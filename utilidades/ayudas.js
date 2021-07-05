import axios from 'axios';
import util from 'util';
import stream from 'stream';
import { access } from 'fs/promises';
import { createWriteStream } from 'fs';
import ProgressBar from 'progress';
import { puntoDatos, puntoDatosFijos } from './constantes.js';

const pipeline = util.promisify(stream.pipeline);

export const archivoExiste = async (ruta) => {
  try {
    await access(ruta);
    return true;
  } catch {
    return false;
  }
};

/**
 * Crea la URL para pedir datos según cantidad de items y página.
 * https://dev.socrata.com/foundry/www.datos.gov.co/gt2j-8ykr
 *
 * @param {string} formato Formato en que se necesital los datos, el API permite: 'json', 'csv', o 'xml'
 * @param {number} numeroDeEntradas Numero de items por página.
 * @param {number} offset Numero desde donde empieza a buscar
 * @returns Url para hacer la petición al API.
 */
export const casosPorEntradas = (formato, numeroDeEntradas, offset) => {
  return `${puntoDatos}.${formato}?$$app_token=${process.env.TOKEN}&$order=id_de_caso&$limit=${numeroDeEntradas}&$offset=${offset}`;
};

/**
 * Crea la URL para buscar el ID del último caso registrado.
 *
 * @returns URL para buscar el ID del último caso registrado
 */
export const ultimaCaso = () => {
  return `${puntoDatos}.json?$$app_token=${process.env.TOKEN}&$select=max(id_de_caso)`;
};

/**
 * Descarga el archivo .rar que contiene la base de datos de INS.
 * Estos los suben estaticamente a: https://www.ins.gov.co/BoletinesCasosCOVID19Colombia/YYYY-MM-DD.rar
 *
 * @param {string} fecha Fecha en formato 'YYYY-MM-DD'
 * @returns Ruta donde quedo descargado el archivo
 */
export const descargarArchivo = async (fecha) => {
  const archivoSalida = `./.temporales/casos-${fecha}.rar`;
  const prueba = await archivoExiste(archivoSalida);

  if (!prueba) {
    console.log('..:: Conectando con sitio web ::..');
    try {
      const { data, headers } = await axios({
        url: `${puntoDatosFijos}/${fecha}.rar`,
        method: 'GET',
        responseType: 'stream',
      });
      console.log(headers);
      const total = headers['content-length'];

      console.log('..:: Iniciando descarga ::..');

      const barraProceso = new ProgressBar('-> descargando [:bar] :percent :etas', {
        width: 40,
        complete: '=',
        incomplete: ' ',
        renderThrottle: 1,
        total: parseInt(total),
      });

      data.on('data', (pedazo) => barraProceso.tick(pedazo.length));

      await pipeline(data, createWriteStream(archivoSalida));

      return archivoSalida;
    } catch (error) {
      console.error('xxxx ERROR DESCARGANDO ARCHIVO xxx', error);
    }
  } else {
    console.log(`El archivo casos-${fecha}.rar ya existe`);
    return archivoSalida;
  }
};

/**
 * Algunos nombres de lugares llegan con errores de digitación.
 * Ejemplo: " "BOGOTA"", y debería ser: "BOGOTA"
 *
 * @param {string} nombre String con nombre de lugar.
 * @returns {string | boolean} Nombre de lugar sin espacios o comillas internas. Si el nombre es string vacio, `null` o `undefined` deveuelve `false` para poder comparar.
 */
export const limpiarNombre = (nombre) => {
  if (nombre) {
    return nombre.replace(/['"]+/g, '').trim();
  }

  return false;
};
