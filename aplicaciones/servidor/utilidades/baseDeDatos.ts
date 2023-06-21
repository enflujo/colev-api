import { Db, Document, MongoClient } from 'mongodb';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import ms from 'ms';
import palabras from './esp';
import { WordTokenizer, AggressiveTokenizerEs, PorterStemmerEs } from 'natural';

import { TuitsPorHora } from '../tipos';

const { USAR_CACHE, BD_USUARIO, BD_CLAVE, BD_PUERTO, CACHE_PUERTO } = process.env;
const cliente = new MongoClient(`mongodb://${BD_USUARIO}:${BD_CLAVE}@localhost:${BD_PUERTO}/?directConnection=true`);
const cache = new Keyv({
  store: new KeyvRedis(`redis://localhost:${CACHE_PUERTO}`),
  ttl: ms('15s'),
  namespace: 'colev-api-cache',
});

const extractor = new WordTokenizer();
const extractorEsp = new AggressiveTokenizerEs();

const nombreBd = 'colev';

export const colecciones = {
  casos: 'casos',
  tuits: 'tuits',
  tuitsRelacionados: 'tuits-relacionados',
};

let bd: Db | null = null;

export const desconectarBd = async (): Promise<void> => {
  await cliente.close();
  bd = null;
};

export const conectarBd = async (): Promise<Db> => {
  if (bd) return bd;
  const conexion = await cliente.connect();
  bd = conexion.db(nombreBd);

  return bd;
};

export const borrarCache = async (llave: string) => {
  return await cache.delete(llave);
};

const responderDesdeCache = async (llave: string) => {
  // USAR_CACHE se define en el archivo .env para poderlo desactivar con facilidad.
  if (USAR_CACHE === 'true') {
    // Acá están los datos guardados si no ha pasado el tiempo que se define en ttl y ya se guardó el resultado con este id.
    const datosGuardados = await cache.get(llave);

    if (datosGuardados) {
      console.log('desde cache', llave);
      return JSON.parse(datosGuardados);
    }
  }

  return null;
};

/**
 *
 * @param llave El identificador que se usa para buscar en el caché o guardar el resultado de mongo.
 * @param busqueda Función que hace la búsqueda en mongo.
 * @returns
 */
export const peticion = async (llave: string, busqueda: (db: Db) => Promise<Document> | null) => {
  // Buscar datos en caché y si existen devolverlos inmediatamente.
  const datos = await responderDesdeCache(llave);
  if (datos) return datos;

  // Si no encontró nada en el caché, hace el query en mongo.
  console.log('desde mongo:', llave);
  // Asegurarse que se pudo conectar a mongo.
  await conectarBd();

  if (bd) {
    const datos = await busqueda(bd);

    if (datos) {
      // Guardar el resultado en caché para que estén disponibles en los siguientes llamados a esta función.
      cache.set(llave, JSON.stringify(datos));
      return datos;
    }
    return null;
  }
  return null;
};

/**
 * Rutas
 */

function estadoInicial() {
  return [];
}

export const tendencias = async (): Promise<Document | undefined> => {
  const id = 'tendencias';

  const datos: TuitsPorHora[] | undefined = await responderDesdeCache(id);
  console.log('no hay cache aún');
  if (!datos) {
    console.log('tendencias desde mongo');
    await conectarBd();

    if (bd) {
      const coleccion = bd.collection(colecciones.tuits);
      console.log();
      const reglas = `\\w+`;

      const datos = await coleccion
        .aggregate([
          // {
          //   $addFields: {
          //     palabras: {
          //       $map: {
          //         input: {
          //           $split: ['$text', ' '],
          //         },
          //         as: 'str',
          //         in: {
          //           $trim: { input: { $toLower: ['$$str'] }, chars: ' ,|(){}-<>.;' },
          //         },
          //       },
          //     },
          //   },
          // },
          // { $unwind: '$palabras' },
          // {
          //   $match: {
          //     palabras: {
          //       $nin: spa,
          //     },
          //   },
          // },
          {
            $project: {
              año: { $year: '$created_at' }, // Año
              mes: { $month: '$created_at' }, // Mes
              semana: { $week: '$created_at' }, // Semana del año
              texto: '$text',
              fecha: '$created_at', // Fecha del tuit
            },
          },
          // { $unwind: '$palabras' },
          // {
          //   $match: {
          //     palabras: {
          //       $nin: [''],
          //     },
          //   },
          // },

          // {
          //   $addFields: {
          //     palabras: {
          //       $map: {
          //         input: { $split: ['$texto', ' '] },
          //         as: 'str',
          //         in: {
          //           $trim: {
          //             input: { $toLower: ['$$str'] },
          //             chars: ' ,|(){}-<>.;"',
          //           },
          //         },
          //       },
          //     },
          //   },
          // },
          // {
          //   $group: {
          //     _id: ['$a', '$mes', '$semana'], // el identificador tiene la estructura que lo hace único: [año, mes, semana].
          //     palabras: { $push: '$palabras' },
          //     fecha: { $first: '$fecha' }, // pasamos la primera fecha de la semana para ordenar en el paso siguiente.
          //     total: { $sum: 1 }, // Contador de la semana
          //   },
          // },

          // {
          //   $sort: { fecha: 1 }, // Ordenar por fechas.
          // },
          // { $match: { $expr: { $eq: [{ $type: '$text' }, 'string'] } } },
          // { $set: { palabras: { $regexFindAll: { input: '$text', regex: reglas } } } },
          // { $project: { tokens: '$palabras.match' } },
          // { $unwind: { path: '$tokens' } },
          // { $group: { _id: '$tokens', count: { $sum: 1 } } },
          // { $set: { word: '$_id', _id: '$$REMOVE' } },
          // { $sort: { count: -1 } },
          // { $limit: 200 },
        ])
        .toArray();

      const semanas = datos.reduce((estado, { año, semana, texto }) => {
        const indice = estado.findIndex((obj: any) => obj.año === año && obj.semana === semana);
        const palabras = extractorEsp.tokenize(texto.toLowerCase());

        if (indice < 0) {
          estado.push({ año, semana, palabras: new Set(palabras) });
        } else {
          estado[indice].palabras = [...new Set([...estado[indice].palabras, ...palabras])];
        }

        return estado;
      }, []);
      console.log(semanas.length);
      return semanas;
      // console.log(datos);
    }
  }

  return datos;
};
