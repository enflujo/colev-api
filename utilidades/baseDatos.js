import { Low, JSONFile } from 'lowdb';
import axios from 'axios';
import { ultimaCaso } from './ayudas.js';
import { fileURLToPath } from 'node:url';

const archivo = fileURLToPath(new URL('../datos/estados.json', import.meta.url));
const adaptador = new JSONFile(archivo);
const bd = new Low(adaptador);

export const inicio = async () => {
  await bd.read();
  bd.data ||= {
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
