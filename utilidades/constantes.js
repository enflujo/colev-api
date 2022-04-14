import chalk from 'chalk';
import emoji from 'node-emoji';

// https://www.npmjs.com/package/chalk#styles
export const error = chalk.bold.red;
export const aviso = chalk.bold.hex('#FFA500');
export const bloque = chalk.bgCyan.black;
export const cyan = chalk.cyan;
export const verde = chalk.greenBright;

// https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json
export const cadena = emoji.emojify(':link:');
export const conector = emoji.emojify(':electric_plug:');
export const gorila = emoji.emojify(':gorilla:');
export const chulo = emoji.emojify(':white_check_mark:');

/**
 * Carpeta donde se guardan temporalmente archivos descargados del API
 */
export const carpetaTemporales = './.temporales';

/**
 * Punto principal para peticiones al API de "Casos positivos de COVID-19 en Colombia" del gobierno de Colombia vía el servicio SODA.
 */
export const puntoDatos = 'https://www.datos.gov.co/resource/gt2j-8ykr';

/**
 * Los archivos los exportan en formato .xlsx o .csv comprimidos en .rar o .zip
 */
export const puntoDatosFijos = 'https://www.ins.gov.co/BoletinesCasosCOVID19Colombia';

const daneBase = 'https://geoportal.dane.gov.co/laboratorio/serviciosjson/gdivipola/servicios/';
export const daneMunicipios = `${daneBase}municipios.php`;
export const daneCentrosPoblados = `${daneBase}tabla_centros_p.php`;
