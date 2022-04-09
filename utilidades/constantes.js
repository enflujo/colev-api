import chalk from 'chalk';
import emoji from 'node-emoji';

// https://www.npmjs.com/package/chalk#styles
export const error = chalk.bold.red;
export const aviso = chalk.bold.hex('#FFA500');
export const bloque = chalk.bgCyan.black;
export const cyan = chalk.cyan;

// https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json
export const cadena = emoji.emojify(':link:');
export const conector = emoji.emojify(':electric_plug:');

/**
 * Carpeta donde se guardan temporalmente archivos descargados del API
 */
export const carpetaTemporales = './.temporales';

/**
 * Punto principal para peticiones al API de "Casos positivos de COVID-19 en Colombia" del gobierno de Colombia vía el servicio SODA.
 */
export const puntoDatos = 'https://www.datos.gov.co/resource/gt2j-8ykr';

/**
 * Los archivos los exportan en formato .xlsx o .csv comprimidos en .rar
 */
export const puntoDatosFijos = 'https://www.ins.gov.co/BoletinesCasosCOVID19Colombia';

export const extensiones = ['.zip', '.rar', 'xlsx'];
