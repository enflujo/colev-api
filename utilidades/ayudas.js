/**
 * Punto principal para peticiones al API de "Casos positivos de COVID-19 en Colombia" del gobierno de Colombia vía el servicio SODA.
 */
export const puntoDatos = 'https://www.datos.gov.co/resource/gt2j-8ykr';

/**
 * Crea la URL para pedir datos según cantidad de items y página.
 * https://dev.socrata.com/foundry/www.datos.gov.co/gt2j-8ykr
 *
 * @param {string} formato Formato en que se necesital los datos, el API permite: 'json', 'csv', o 'xml'
 * @param {number} numeroDeEntradas Numero de items por página.
 * @param {number} pagina Numero de la página
 * @returns Url para hacer la petición al API.
 */
export const casosPorEntradas = (formato, numeroDeEntradas, pagina) => {
  return `${puntoDatos}.${formato}?$$app_token=${process.env.TOKEN}&$order=id_de_caso&$limit=${numeroDeEntradas}&$offset=${pagina}`;
};

/**
 * Crea la URL para buscar el ID del último caso registrado.
 *
 * @returns URL para buscar el ID del último caso registrado
 */
export const ultimaCaso = () => {
  return `${puntoDatos}.json?$$app_token=${process.env.TOKEN}&$select=max(id_de_caso)`;
};
