import axios from 'axios';
import util from 'util';
import stream from 'stream';
import { access } from 'fs/promises';
import { createWriteStream, writeFileSync } from 'fs';
import ProgressBar from 'progress';
import { puntoDatos, puntoDatosFijos, cyan, aviso, conector, bloque, error } from './constantes.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

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
 * @param {string} formato Formato en que se necesitan los datos, el API permite: 'json', 'csv', o 'xml'
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
 * Estos los suben estáticamente a: https://www.ins.gov.co/BoletinesCasosCOVID19Colombia/YYYY-MM-DD.rar
 *
 * @param {string} fecha Fecha en formato 'YYYY-MM-DD'
 * @returns Ruta donde quedo descargado el archivo
 */
export const descargarArchivo = async (fecha, extension) => {
  const archivoSalida = `./.temporales/casos-${fecha}.${extension}`;
  const prueba = await archivoExiste(archivoSalida);

  if (!prueba) {
    console.log(bloque('..:: Conectando con sitio web ::..'));
    try {
      const { data, headers } = await axios({
        url: `${puntoDatosFijos}/${fecha}.${extension}`,
        method: 'GET',
        responseType: 'stream',
      });

      const total = headers['content-length'];

      console.log(bloque('..:: Iniciando descarga ::..'));

      const barraProceso = new ProgressBar(
        `${bloque(conector)} ${aviso('casos-' + fecha)} ${cyan('|:bar|')} ${aviso(':percent :etas')}`,
        {
          width: 60,
          complete: '-',
          incomplete: ' ',
          renderThrottle: 1,
          total: parseInt(total),
        }
      );

      data.on('data', (pedazo) => barraProceso.tick(pedazo.length));

      await pipeline(data, createWriteStream(archivoSalida));

      return archivoSalida;
    } catch (error) {
      return false;
      // console.error('xxxx ERROR DESCARGANDO ARCHIVO xxx', error.isAxiosError);
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
 * @returns {string | boolean} Nombre de lugar sin espacios o comillas internas. Si el nombre es string vacío, `null` o `undefined` devuelve `false` para poder comparar.
 */
export const limpiarNombre = (nombre) => {
  if (nombre) {
    return nombre.replace(/['"]+/g, '').trim();
  }

  return false;
};

export const convertirSet = (key, value) => (value instanceof Set ? [...value] : value);

export const formatearNombre = (texto) => {
  const palabras = texto.trim().toLowerCase().split(' ');
  const saltar = ['de', 'la'];
  const mantener = ['D.C.'];

  return palabras
    .map((palabra, i) => {
      if ((saltar.includes(palabra) && i > 0) || mantener.includes(palabra)) {
        return palabra;
      }

      return palabra[0].toUpperCase() + palabra.substring(1);
    })
    .join(' ');
};

export const normalizarTexto = (texto) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

export const guardarJSON = (json, nombre) => {
  writeFileSync(`./datos/${nombre}.json`, JSON.stringify(json, convertirSet, 2));
};

export const fechaColombia = (fechaEnTexto) => {
  try {
    const fecha = dayjs.tz(fechaEnTexto, 'America/Bogota');

    if (fecha.isValid()) {
      return fecha.toDate();
    }
  } catch (err) {
    console.log(error(err));
    throw new Error(`"${fechaEnTexto}"`);
  }

  return;
};

export const reloj = (ms) =>
  new Date(ms).toLocaleTimeString('en-GB', {
    timeZone: 'Etc/UTC',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

/**
 * Convierte una fecha a texto (específicamente en el formato que coincide con los nombres de archivos)
 *
 * @param {Date} fecha Fecha en milisegundos o en fecha de JS.
 * @returns {string} texto en formato YYYY-MM-DD
 */
export const formatoNombreFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('en-CA');
};

/**
 * Resta 1 día a una fecha.
 * @param {Date} fecha Fecha en JS a transformar.
 * @returns {Date} Fecha 24 horas antes.
 */
export const regresarUnDia = (fecha) => {
  return new Date(fecha).setHours(-24);
};
