import { Db, MongoClient } from 'mongodb';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import ms from 'ms';
import {
  CasosPorDia,
  RespuestaCasosPorDia,
  RespuestaTuitsPorDia,
  RespuestaTuitsPorHora,
  TuitsPorDia,
  TuitsPorHora,
} from '../tipos';

const { USAR_CACHE, BD_USUARIO, BD_CLAVE, BD_PUERTO, CACHE_PUERTO } = process.env;
const cliente = new MongoClient(`mongodb://${BD_USUARIO}:${BD_CLAVE}@localhost:${BD_PUERTO}/?directConnection=true`);
const cache = new Keyv({
  store: new KeyvRedis(`redis://localhost:${CACHE_PUERTO}`),
  // ttl: ms('15s'),
  namespace: 'colev-api-cache',
});

const nombreBd = 'colev';

const colecciones = {
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

const responderDesdeCache = async (id: string) => {
  // USAR_CACHE se define en el archivo .env para poderlo desactivar con facilidad.
  if (USAR_CACHE === 'true') {
    // Acá están los datos guardados si no ha pasado el tiempo que se define en ttl y ya se guardó el resultado con este id.
    const datosGuardados = await cache.get(id);

    if (datosGuardados) {
      console.log('desde cache');
      return JSON.parse(datosGuardados);
    }
  }

  return null;
};

/**
 * Rutas
 */
export const casosPorDia = async (): Promise<CasosPorDia[] | undefined> => {
  // Este id se usa para buscar en el caché o guardar el resultado de mongo.
  const id = 'casosPorDia';

  // Definir variable de datos que pueden salir del caché o de mongo.
  let datos: CasosPorDia[] | undefined = await responderDesdeCache(id);

  // Si no encontró nada en el caché, hace el query en mongo.
  if (!datos) {
    await conectarBd();

    // Asegurarse que se pudo conectar a mongo.
    if (bd) {
      // Definir desde cual colección se extraen los datos.
      const coleccion = bd.collection(colecciones.casos);

      // Query
      const casos = (await coleccion
        .aggregate([
          {
            $group: {
              _id: '$fechaNot',
              total: { $sum: 1 },
              muertos: {
                $sum: {
                  $cond: [{ $eq: ['$recuperado', 'fallecido'] }, 1, 0],
                },
              },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])
        .toArray()) as RespuestaCasosPorDia[];

      // Aplanar respuesta de objetos a arrays para que sea la menor cantidad de bits que se mandan desde la API.
      if (casos && casos.length) {
        datos = casos.map((obj): CasosPorDia => [obj._id, obj.muertos, obj.total]);

        // Guardar el resultado en caché para que estén disponibles en los siguientes llamados a esta función.
        cache.set(id, JSON.stringify(datos));

        return datos;
      }
    }
  }

  return datos;
};

export const tuitsPorDia = async (): Promise<TuitsPorDia[] | undefined> => {
  // Este id se usa para buscar en el caché o guardar el resultado de mongo.
  const id = 'tuitsPorDia';

  // Definir variable de datos que pueden salir del caché o de mongo.
  let datos: TuitsPorDia[] | undefined = await responderDesdeCache(id);

  // Si no encontró nada en el caché, hace el query en mongo.
  if (!datos) {
    await conectarBd();

    // Asegurarse que se pudo conectar a mongo.
    if (bd) {
      // Definir desde cual colección se extraen los datos.
      const coleccion = bd.collection(colecciones.tuits);
      const tuitsPorDia = (await coleccion
        .aggregate([
          {
            $project: {
              a: { $year: '$created_at' },
              m: { $month: '$created_at' },
              d: { $dayOfMonth: '$created_at' },
              fecha: '$created_at',
              tweet: 1,
            },
          },
          {
            $group: {
              _id: ['$a', '$m', '$d'],
              fecha: { $first: '$fecha' },
              total: { $sum: 1 },
            },
          },
          {
            $sort: { fecha: 1 },
          },
        ])
        .toArray()) as RespuestaTuitsPorDia[];

      if (tuitsPorDia && tuitsPorDia.length) {
        datos = tuitsPorDia.map((datosDia) => [datosDia._id.join('-'), datosDia.total]);
        cache.set(id, JSON.stringify(datos));

        return datos;
      }
    }
  }

  return datos;
};

export const tuitsPorHora = async (): Promise<TuitsPorHora[] | undefined> => {
  const id = 'tuitsPorHora';
  let datos: TuitsPorHora[] | undefined = await responderDesdeCache(id);

  if (!datos) {
    await conectarBd();

    if (bd) {
      const coleccion = bd.collection(colecciones.tuits);
      const tuitsPorHora = (await coleccion
        .aggregate([
          {
            $project: {
              a: { $year: '$created_at' },
              m: { $month: '$created_at' },
              d: { $dayOfMonth: '$created_at' },
              h: { $hour: '$created_at' },
              fecha: '$created_at',
              tweet: 1,
            },
          },
          {
            $group: {
              _id: ['$a', '$m', '$d', '$h'],
              fecha: { $first: '$fecha' },
              total: { $sum: 1 },
            },
          },
          {
            $sort: { fecha: 1 },
          },
        ])
        .toArray()) as RespuestaTuitsPorHora[];

      if (tuitsPorHora && tuitsPorHora.length) {
        datos = tuitsPorHora.map((datosHora) => {
          const [año, mes, dia, hora] = datosHora._id;
          return [`${año}-${mes}-${dia}`, hora, datosHora.total];
        });

        cache.set(id, JSON.stringify(datos));

        return datos;
      }
    }
  }

  return datos;
};

export const borrarCache = async (llave: string) => {
  return await cache.delete(llave);
};
