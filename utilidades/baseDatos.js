import mongo from 'mongodb';
const { MongoClient } = mongo;
import axios from 'axios';
import filesize from 'filesize';
import { SingleBar } from 'cli-progress';
import { casosPorEntradas, descargarArchivo, guardarJSON, formatoNombreFecha, regresarUnDia } from './ayudas.js';
import { parse } from 'csv-parse';
import Streamzip from 'node-stream-zip';
import { limpieza } from './limpieza.js';
import { aviso, gorila, bloque, cyan, chulo, verde } from './constantes.js';
import { errata } from './errata.js';
import { actualizarUltimoId, guardarVarios } from './flujoHaciaMongo.js';
import { llavesSoda } from '../datos/descriptores.js';
const { BD_USUARIO, BD_CLAVE, BD_PUERTO } = process.env;

function formatoBarra(opciones, params, payload) {
  const completado = Math.round(params.progress * opciones.barsize);
  const incompleto = opciones.barsize - completado;
  const { barCompleteString: barra1, barIncompleteString: barra2, barGlue } = opciones;
  const barra = barra1.substr(0, completado) + barGlue + barra2.substr(0, incompleto);
  // const proceso = `${filesize(params.value)} / ${filesize(params.total)}`;
  const proceso = `${payload.porcentaje}%`;

  if (params.value >= params.total) {
    return `${chulo} ${aviso('Archivo procesado')} |${verde(barra)}| ${proceso}`;
  } else {
    return `${bloque(gorila)} ${aviso('Procesando')} |${cyan(barra)}| pagina: ${payload.pagina} de ${
      payload.totalPaginas
    } | ${proceso}`;
  }
}

const barraProceso = new SingleBar({
  format: formatoBarra,
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
});

export const extraerTodos = async (total, pagina = 0) => {
  /**
   * La cantidad de casos por petición se procesan en memoria por lo que toca mantenerlo bajo.
   * Entre más alto, el servidor necesita tener más memoria ram para procesarlos.
   * El peso inicial (sin considerar la ram que necesita luego para procesar) se puede estimar con:
   * 10000 alrededor de 6.5mb | 20000 alrededor de 13mb | 50000 alrededor de 32.5mb
   *
   * EL API donde están los datos (SODA) supuestamente no tiene límites desde la versión 2.1.
   * Mongo tiene un limite de 100,000 en `insertMany`.
   */
  const numeroPorPagina = 20000;
  if (pagina === 0) {
    barraProceso.start(total, 0, {
      pagina: 0,
      totalPaginas: Math.ceil(total / numeroPorPagina) - 1,
      porcentaje: 0,
    });
  }

  try {
    const inicioBloque = pagina * numeroPorPagina;
    const { data } = await axios.get(casosPorEntradas('json', numeroPorPagina, inicioBloque));

    if (data.length) {
      const datosLimpios = [];

      data.forEach((d) => {
        const casoLimpio = limpieza(d, llavesSoda);
        if (casoLimpio) datosLimpios.push(casoLimpio);
      });

      const casosProcesados = inicioBloque + numeroPorPagina;

      await guardarVarios(datosLimpios).catch(console.dir);
      barraProceso.update(casosProcesados, {
        pagina: pagina,
        porcentaje: ((casosProcesados / total) * 100).toFixed(1),
      });
      // console.log(datos.length);
      // guardarJSON(datosLimpios, 'pruebaLimpia2');
      // guardarJSON(errata, 'errata');

      extraerTodos(total, pagina + 1);
    } else {
      guardarJSON(errata, 'errata');
      await actualizarUltimoId();
      console.log('..:: Termino de extraer los datos ::..');

      return;
    }
  } catch (error) {
    throw new Error(error);
  }
};

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
