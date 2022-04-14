import mongo from 'mongodb';
const { MongoClient } = mongo;
import { Low, JSONFile } from 'lowdb';
import axios from 'axios';
import filesize from 'filesize';
import { SingleBar } from 'cli-progress';
import {
  ultimaCaso,
  casosPorEntradas,
  descargarArchivo,
  guardarJSON,
  formatoNombreFecha,
  regresarUnDia,
} from './ayudas.js';
import { fileURLToPath } from 'node:url';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import Streamzip from 'node-stream-zip';
import { limpieza } from './limpieza.js';
import { aviso, gorila, bloque, cyan, chulo, verde } from './constantes.js';
import { errata } from './errata.js';
const { BD_USUARIO, BD_CLAVE, BD_PUERTO } = process.env;

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

export const extraerTodos = async (pagina = 0) => {
  const numeroPorPagina = 20000;

  try {
    const { data, status, headers } = await axios.get(
      casosPorEntradas('json', numeroPorPagina, pagina * numeroPorPagina)
    );

    console.log(`Pagina: ${pagina} - Status: ${status} - Número de casos nuevos: ${data.length}}`);

    if (data.length) {
      console.log(data.length);

      await extraerTodos(++pagina);
    } else {
      console.log('..:: Termino de extraer los datos ::..');
    }
  } catch (error) {
    throw new Error(error);
  }
};

function formatoBarra(opciones, params, payload) {
  const completado = Math.round(params.progress * opciones.barsize);
  const incompleto = opciones.barsize - completado;
  const { barCompleteString: barra1, barIncompleteString: barra2, barGlue } = opciones;
  const barra = barra1.substr(0, completado) + barGlue + barra2.substr(0, incompleto);
  const proceso = `${filesize(params.value)} / ${filesize(params.total)}`;

  if (params.value >= params.total) {
    return `${chulo} ${aviso('Archivo procesado')} |${verde(barra)}| ${proceso}`;
  } else {
    return `${bloque(gorila)} ${aviso('Procesando')} |${cyan(barra)}| ${proceso}`;
  }
}

export const raspado = async (fecha = new Date(), limite = 15) => {
  const rutaArchivo = await descargarArchivo(formatoNombreFecha(fecha), 'zip');

  if (rutaArchivo) {
    const zip = new Streamzip.async({ file: rutaArchivo, nameEncoding: 'latin1' });
    const archivosComprimidos = await zip.entries();
    const informacion = archivosComprimidos['Datos_Abiertos.csv'];

    if (informacion) {
      const total = informacion.size;
      const barraProceso = new SingleBar({
        format: formatoBarra,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
      });

      barraProceso.start(total, 0);

      const flujo = await zip.stream('Datos_Abiertos.csv');
      const parser = parse({
        delimiter: ',',
        trim: true,
        columns: true,
        encoding: 'latin1',
      });

      flujo.pipe(parser);

      const url = `mongodb://${BD_USUARIO}:${BD_CLAVE}@localhost:${BD_PUERTO}/?directConnection=true`;
      const nombreBD = 'covid19';
      const cliente = new MongoClient(url);
      await cliente.connect();
      const bd = cliente.db(nombreBD);
      const coleccion = bd.collection('casos');

      for await (const fila of parser) {
        const datosLimpios = limpieza(fila);
        await coleccion.insertOne(datosLimpios);
        barraProceso.update(parser.info.bytes);
      }

      await cliente.close();
    }

    await zip.close();
    guardarJSON(errata, 'errata');
    // console.log('Archivo extraído');
  } else {
    limite--;
    console.log(limite);
    if (limite >= 0) {
      await raspado(regresarUnDia(fecha), limite);
    }
  }
};

export const procesarEnFlujo = (rutaArchivo) => {
  const guardar = flujoHaciaMongo(config);
  const flujo = createReadStream(rutaArchivo, 'latin1');

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
      console.log('..:: FIN ::..');
    })
    .on('error', (err) => {
      console.log(err);
    });
};
