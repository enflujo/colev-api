import axios from 'axios';
import { constants, createWriteStream } from 'fs';
import util from 'util';
import stream from 'stream';
import Streamzip from 'node-stream-zip';
import { access, mkdir } from 'fs/promises';
import { parse } from 'csv-parse';
import { conector, logAviso, logBloque, logCyan, puntoDatosFijos } from '../../utilidades/constantes';
import { guardarJSON } from '../../utilidades/ayudas';
import errata from '../errata';
import limpieza from '../limpieza';

/**
 * Otra manera de extraer el datos.
 * El problema en usar las dos es que los ids no coinciden.
 * Dejo esto acá por si es necesario extraer los datos directo de INS en el futuro.
 */
const carpetaTemporales = './.temporales';
const pipeline = util.promisify(stream.pipeline);
const archivoExiste = async (ruta: string): Promise<boolean> => {
  try {
    await access(ruta, constants.R_OK | constants.W_OK);
    return true;
  } catch {
    return false;
  }
};
/**
 * Convierte una fecha a texto (específicamente en el formato que coincide con los nombres de archivos)
 *
 * @param {number} fecha Fecha en milisegundos o en fecha de JS.
 * @returns {string} texto en formato YYYY-MM-DD
 */
const formatoNombreFecha = (fecha: number): string => new Date(fecha).toLocaleDateString('en-CA');

/**
 * Resta 1 día a una fecha.
 * @param {Date} fecha Fecha en JS a transformar.
 * @returns {number} Fecha 24 horas antes.
 */
const regresarUnDia = (fecha: number): number => new Date(fecha).setHours(-24);

/**
 * Descarga el archivo que contiene la base de datos de INS.
 * Estos los suben estáticamente a: https://www.ins.gov.co/BoletinesCasosCOVID19Colombia/YYYY-MM-DD.rar
 *
 * @param {string} fecha Fecha en formato 'YYYY-MM-DD'
 * @returns Ruta donde quedo descargado el archivo
 */

const descargarArchivo = async (fecha: string, extension: string): Promise<string | undefined> => {
  await mkdir(carpetaTemporales, { recursive: true });

  const archivoSalida = `${carpetaTemporales}/casos-${fecha}.${extension}`;
  const prueba = await archivoExiste(archivoSalida);

  if (!prueba) {
    console.log(logBloque('..:: Conectando con sitio web ::..'));
    try {
      const { data, headers } = await axios({
        url: `${puntoDatosFijos}/${fecha}.${extension}`,
        method: 'GET',
        responseType: 'stream',
      });

      const total = headers['content-length'];

      console.log(logBloque('..:: Iniciando descarga ::..'));

      // const barraProceso = new ProgressBar(
      //   `${logBloque(conector)} ${logAviso('casos-' + fecha)} ${logCyan('|:bar|')} ${logAviso(':percent :etas')}`,
      //   {
      //     width: 60,
      //     complete: '-',
      //     incomplete: ' ',
      //     renderThrottle: 1,
      //     total: parseInt(total),
      //   }
      // );

      // data.on('data', (pedazo) => barraProceso.tick(pedazo.length));

      await pipeline(data, createWriteStream(archivoSalida));

      return archivoSalida;
    } catch (error) {
      return;
      // console.error('xxxx ERROR DESCARGANDO ARCHIVO xxx', error.isAxiosError);
    }
  } else {
    console.log(`El archivo casos-${fecha}.rar ya existe`);
    return archivoSalida;
  }
};

export default async function raspado(fecha = new Date(), limite = 15) {
  const rutaArchivo = await descargarArchivo(formatoNombreFecha(fecha.getTime()), 'zip');

  if (rutaArchivo) {
    console.log('HEY');
    const zip = new Streamzip.async({ file: rutaArchivo, nameEncoding: 'latin1' });
    const archivosComprimidos = await zip.entries();
    const informacion = archivosComprimidos['Datos_Abiertos_130422.csv'];

    if (informacion) {
      const total = informacion.size;
      console.log('YO');

      const flujo = await zip.stream('Datos_Abiertos_130422.csv');
      const parser = parse({
        delimiter: ',',
        trim: true,
        columns: true,
        encoding: 'latin1',
      });

      flujo.pipe(parser);

      // const url = `mongodb://${BD_USUARIO}:${BD_CLAVE}@localhost:${BD_PUERTO}/?directConnection=true`;
      // const nombreBD = 'covid19';
      // const cliente = new MongoClient(url);
      // await cliente.connect();
      // const bd = cliente.db(nombreBD);
      // const coleccion = bd.collection('casos');

      for await (const fila of parser) {
        console.log(fila);
        // const datosLimpios = limpieza(fila, llavesIns);
        // await coleccion.insertOne(datosLimpios);
        // barraProceso.update(parser.info.bytes);
      }

      // await cliente.close();
    }

    await zip.close();
    guardarJSON(errata, 'errataINS');
    // console.log('Archivo extraído');
  } else {
    limite--;
    console.log(limite);
    if (limite >= 0) {
      await raspado(new Date(regresarUnDia(fecha.getTime())), limite);
    }
  }
}
