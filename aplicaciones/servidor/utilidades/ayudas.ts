import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { writeFileSync } from 'fs';
import { ratio } from 'fuzzball';
import path from 'path';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Revisa si el valor de un texto contiene un número.
 *
 * @param valor {string} Texto a revisar
 * @returns {Boolean} true o false
 */
export const esNumero = (valor: string): boolean => !isNaN(parseInt(valor));

/**
 * Determina si dos textos son exactamente iguales.
 * @param a Texto 1
 * @param b Texto 2
 * @returns {Boolean}
 */
export const esIgual = (a: string, b: string): boolean => a === b;

/**
 * Si un texto hace parte de otro devuelve `true`
 * @param a Texto 1
 * @param b Texto 2
 * @returns {Boolean} true o false
 */
export const existeEn = (a: string, b: string): boolean => a.includes(b);

/**
 * Usar fuzz para obtener un porcentaje de similitud (útil cuando hay errores tipográficos o de digitación)
 * @param a Texto 1
 * @param b Texto 2
 * @returns {Boolean} true o false
 */
export const igualAprox = (a: string, b: string): boolean => ratio(a, b) > 50;

/**
 * Convierte texto: sin mayúsculas, tildes o espacios alrededor;
 *
 * @param texto Texto a convertir
 * @returns Texto sin mayúsculas, tildes o espacios alrededor.
 */
export const normalizarTexto = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/**
 * Convierte fecha en texto a una fecha válida en zona horaria de Colombia.
 *
 * @param fechaEnTexto Fecha en formato texto que se va a convertir
 * @returns {Date|undefined} Fecha en zona horaria de Colombia o `undefined` si no es válida.
 */
export const fechaColombia = (fechaEnTexto: string): Date | undefined => {
  const fecha = dayjs.tz(fechaEnTexto, 'America/Bogota');
  if (fecha.isValid()) return fecha.toDate();
  return;
};

/**
 * Método para convertir Set en texto para imprimir con JSON.stringify
 *
 * @param key Llave del objeto
 * @param value Cualquier valor que contiene el objeto
 * @returns Cualquier valor dentro del objeto.
 */
export const convertirSet = (key: string, value: any) => (value instanceof Set ? [...value] : value);

/**
 * Guardar datos localmente en archivo .json
 * @param {Object} json Datos que se quieren guardar en formato JSON.
 * @param {String} nombre Nombre del archivo, resulta en ${nombre}.json
 */
export const guardarJSON = (json: Object, nombre: string) => {
  writeFileSync(path.resolve(__dirname, `../../datos/${nombre}.json`), JSON.stringify(json, convertirSet, 2));
};

/**
 * Convierte milisegundos a texto, útil para imprimir tiempo transcurrido.
 * @param ms Tiempo en milisegundos
 * @returns Tiempo en formato: HH:MM:SS
 */
export const reloj = (ms: number): string =>
  new Date(ms).toLocaleTimeString('en-GB', {
    timeZone: 'Etc/UTC',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

export const formatearNombre = (texto: string) => {
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
