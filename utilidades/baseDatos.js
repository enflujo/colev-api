import { Low, JSONFile } from 'lowdb';
import axios from 'axios';
import { ultimaCaso, casosPorEntradas, limpiarNombre, descargarArchivo } from './ayudas.js';
import { fileURLToPath } from 'node:url';
import { createReadStream } from 'fs';
import csv from 'csv-parse';
import transformador from 'stream-transform';
import { flujoHaciaMongo } from './flujoHaciaMongo.js';

const archivo = fileURLToPath(new URL('../datos/estados.json', import.meta.url));
const adaptador = new JSONFile(archivo);
const bd = new Low(adaptador);

export const inicio = async () => {
  await bd.read();
  bd.data ||= {
    anterior: 0,
    ultimoCasoId: 0,
  };
};

/**
 * Extrae y guarda el ID del último caso registrado.
 *
 * @returns ID del último caso registrado
 */
export const actualizarUltimoCasoId = async () => {
  try {
    const { data } = await axios.get(ultimaCaso());

    if (data.length && data[0].max_id_de_caso && !isNaN(data[0].max_id_de_caso)) {
      const ultimoCasoId = +data[0].max_id_de_caso;

      if (bd.data.ultimoCasoId === ultimoCasoId) {
        console.log('El último caso es el mismo');
      } else {
        bd.data.anterior = bd.data.ultimoCasoId;
        bd.data.ultimoCasoId = +data[0].max_id_de_caso;

        await bd.write();
      }

      return ultimoCasoId;
    } else if (!data.length) {
      throw new Error('No hay registros que se llamen "id_de_caso"');
    } else if (!data[0].hasOwnProperty('max_id_de_caso')) {
      throw new Error(
        `No se puede extraer el id del último caso, el resultado de la petición fue: ${JSON.stringify(data[0])}`
      );
    } else if (isNaN(data[0].max_id_de_caso)) {
      throw new Error(`El ID del caso no es un numero, el resultado fue: ${JSON.stringify(data[0].max_id_de_caso)}`);
    }
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const extraerTodos = async (pagina) => {
  const numeroPorPagina = 2;
  pagina ||= 0;

  try {
    const { data, status } = await axios.get(casosPorEntradas('json', numeroPorPagina, pagina * numeroPorPagina));

    console.log(`Pagina: ${pagina} - Status: ${status} - Número de casos nuevos: ${data.length}`);

    if (data.length) {
      console.log(data);

      //await extraerTodos(++pagina);
    } else {
      console.log('..:: Termino de extraer los datos ::..');
    }
  } catch (error) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

export const raspado = async (url) => {
  const rutaArchivo = await descargarArchivo('2021-06-30');
  console.log(rutaArchivo);
};

export const procesarEnFlujo = (rutaArchivo) => {
  const { BD_USUARIO, BD_CLAVE } = process.env;
  const config = { url: `mongodb://${BD_USUARIO}:${BD_CLAVE}@localhost:27017`, nombreColeccion: 'entradas' };
  const guardar = flujoHaciaMongo(config);
  const flujo = createReadStream(rutaArchivo, 'latin1');
  const municipios = {};
  const departamentos = {};
  const paises = {};

  const limpieza = transformador((fila) => {
    const nombreMunicipio = limpiarNombre(fila.Ciudad_municipio_nom);
    const nombreDepartamento = limpiarNombre(fila.Departamento_nom);
    const nombrePais = limpiarNombre(fila.Pais_viajo_1_nom);

    if (nombreMunicipio && !municipios.hasOwnProperty(fila.Ciudad_municipio)) {
      municipios[fila.Ciudad_municipio] = nombreMunicipio;
    }

    if (nombreDepartamento && !departamentos.hasOwnProperty(fila.Departamento)) {
      departamentos[fila.Departamento] = nombreDepartamento;
    }

    if (nombrePais && !paises.hasOwnProperty(fila.Pais_viajo_1_cod)) {
      paises[fila.Pais_viajo_1_cod] = nombrePais;
    }
    console.log(fila);
    const res = {
      id: Number(fila.Caso),
      mun: Number(fila.Ciudad_municipio),
      dep: Number(fila.Departamento),
      pais: Number(fila.Pais_viajo_1_cod),
      fecha_hoy: fila.fecha_hoy_casos,
      fecha_inicio: fila.Fecha_inicio_sintomas,
      fecha_not: fila['Fecha Not'],
      fecha_diag: fila.Fecha_diagnostico,
      fecha_muerte: fila.Fecha_muerte,
      recuperado: fila.Recuperado,
      recuperacion: fila.Tipo_recuperacion,
      edad: Number(fila.Edad),
      sexo: fila.Sexo,
    };

    console.log(res);

    return res;
  });

  flujo
    .pipe(
      csv({
        trim: true,
        columns: true,
      })
    )
    .pipe(limpieza)
    // .pipe(guardar)
    .on('end', () => {
      console.log(departamentos, municipios, paises);
      console.log('..:: FIN ::..');
    })
    .on('error', (err) => {
      console.log(err);
    });
};
