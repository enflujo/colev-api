import { Db, MongoClient } from 'mongodb';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import ms from 'ms';
import { CasoLimpio, CasoPorDia, DatosCasosPorDia } from '../../tipos';

const { USAR_CACHE, BD_USUARIO, BD_CLAVE, BD_PUERTO, CACHE_PUERTO } = process.env;
const cliente = new MongoClient(`mongodb://${BD_USUARIO}:${BD_CLAVE}@localhost:${BD_PUERTO}/?directConnection=true`);
const cache = new Keyv({
  store: new KeyvRedis(`redis://localhost:${CACHE_PUERTO}`),
  ttl: ms('10s'),
  namespace: 'colev-api-cache',
});

const nombreBd = 'colev';
const colecciones = {
  casos: 'casos',
  twitterTweets: 'tweets',
  twitterLugares: 'tweeter-lugares',
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

export const guardarVarios = async (datos: CasoLimpio[]): Promise<void> => {
  await conectarBd();

  if (bd) {
    const entradas = datos.map((caso: CasoLimpio) => {
      return {
        updateOne: {
          filter: { _id: caso._id },
          update: { $set: caso },
          upsert: true,
        },
      };
    });

    const coleccion = bd.collection(colecciones.casos);
    await coleccion.bulkWrite(entradas);
  }
};

type ObjetoCaso = {
  _id: Date;
  muertos: number;
  total: number;
};

/**
 * Rutas
 */
export const casosPorDia = async (): Promise<DatosCasosPorDia | undefined> => {
  // Este id se usa para buscar en el caché o guardar el resultado de mongo.
  const id = 'casosPorDia';

  // Definir variable de datos que pueden salir del caché o de mongo.
  let datos: DatosCasosPorDia | undefined;

  // USAR_CACHE se define en el archivo .env para poderlo desactivar con facilidad.
  if (USAR_CACHE === 'true') {
    // Acá están los datos guardados si no ha pasado el tiempo que se define en ttl y ya se guardó el resultado con este id.
    const datosGuardados = await cache.get(id);

    if (datosGuardados) {
      datos = JSON.parse(datosGuardados);
      console.log('cache');
    }
  }

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
        .toArray()) as ObjetoCaso[];

      // Aplanar respuesta de objetos a arrays para que sea la menor cantidad de bits que se mandan desde la API.
      if (casos && casos.length) {
        datos = {
          llaves: ['fecha', 'muertos', 'total'],
          casos: casos.map((obj: ObjetoCaso): CasoPorDia => [obj._id, obj.muertos, obj.total]),
        };

        // Guardar el resultado en caché para que estén disponibles en los siguientes llamados a esta función.
        cache.set(id, JSON.stringify(datos));
        console.log('mongo');
        return datos;
      }
    }
  }

  return datos;
};
