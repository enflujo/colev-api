import colores from 'cli-color';
import emoji from 'node-emoji';

/**
 * Para usar otros colores, usar esta tabla para saber el número: https://robotmoon.com/256-colors/
 * Texto: xterm(40)
 * Fondo: bgXterm(40)
 */
export const logError = colores.red.bold;
export const logAviso = colores.bold.xterm(214);
export const logBloque = colores.bgCyan.black;
export const logCyan = colores.cyan.bold;
export const logVerde = colores.greenBright;
export const logNaranjaPulso = colores.xterm(214).blink;

// https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json
export const cadena = emoji.emojify(':link:');
export const conector = emoji.emojify(':electric_plug:');
export const gorila = emoji.emojify(':gorilla:');
export const chulo = emoji.emojify(':white_check_mark:');

/**
 * Punto principal para peticiones al API de "Casos positivos de COVID-19 en Colombia" del gobierno de Colombia vía el servicio SODA.
 */
export const puntoDatos = 'https://www.datos.gov.co/resource/gt2j-8ykr';

export const totalCasosUrl = `${puntoDatos}.json?$$app_token=${process.env.TOKEN}&$select=count(id_de_caso)`;
export const ultimoCasoIdUrl = `${puntoDatos}.json?$$app_token=${process.env.TOKEN}&$select=max(id_de_caso)`;

/**
 * Crea la URL para pedir datos según cantidad de items y página.
 * https://dev.socrata.com/foundry/www.datos.gov.co/gt2j-8ykr
 *
 * @param {string} formato Formato en que se necesitan los datos, el API permite: 'json', 'csv', o 'xml'
 * @param {number} numeroDeEntradas Numero de items por página.
 * @param {number} offset Numero desde donde empieza a buscar
 * @returns Url para hacer la petición al API.
 */
export const casosPorEntradasUrl = (formato: string, numeroDeEntradas: number, offset: number): string => {
  return `${puntoDatos}.${formato}?$$app_token=${process.env.TOKEN}&$order=id_de_caso&$limit=${numeroDeEntradas}&$offset=${offset}`;
};

/**
 * Los archivos los exportan en formato .xlsx o .csv comprimidos en .rar o .zip
 */
export const puntoDatosFijos = 'https://www.ins.gov.co/BoletinesCasosCOVID19Colombia';

const daneBase = 'https://geoportal.dane.gov.co/laboratorio/serviciosjson/gdivipola/servicios/';
export const daneMunicipios = `${daneBase}municipios.php`;
export const daneCentrosPoblados = `${daneBase}tabla_centros_p.php`;
