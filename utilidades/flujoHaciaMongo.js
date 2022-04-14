import { MongoClient } from 'mongodb';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import ms from 'ms';
const { USAR_CACHE } = process.env;

const cache = new Keyv({
  store: new KeyvRedis('redis://localhost:6379'),
  ttl: ms('10s'),
  namespace: 'colev-api-cache',
});

const { BD_USUARIO, BD_CLAVE, BD_PUERTO } = process.env;
const url = `mongodb://${BD_USUARIO}:${BD_CLAVE}@localhost:${BD_PUERTO}/?directConnection=true`;
const config = { nombreBD: 'covid19', coleccion: 'casos', administrador: null };
const cliente = new MongoClient(url);

export const casosPorDia = async () => {
  const id = 'casosPorDia';
  let datos;

  if (USAR_CACHE === 'true') datos = await cache.get(id);

  if (datos) {
    console.log('Desde cache');
  } else {
    console.log('Desde mongo');
    const casos = await config.administrador
      .aggregate([
        {
          $group: {
            _id: '$fecha_not',
            total: { $sum: 1 },
            muertos: {
              $sum: {
                $cond: [{ $eq: ['$recuperado', 'Fallecido'] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    datos = {
      llaves: ['fecha', 'muertos', 'total'],
      casos: casos.map((obj) => [obj._id, obj.muertos, obj.total]),
    };

    cache.set(id, datos);
  }

  return datos;
};

export const muertos = async () => {
  const muertos = await config.administrador
    .find({ recuperado: 'Fallecido' })
    .sort({ fecha_hoy: 1 })
    .project({
      _id: 0,
      id: 0,
      mun: 0,
      dep: 0,
      fecha_inicio: 0,
      fecha_not: 0,
      fecha_diag: 0,
      recuperado: 0,
      recuperacion: 0,
      fecha_hoy: 0,
    })
    .toArray();

  return muertos.map((m) => [m.fecha_muerte, m.edad, m.sexo]);
};

export const cerrar = async () => {
  await cliente.close();
  config.administrador = null;
  console.log('Conexión a base de datos cerrada');
};

export const conectar = async () => {
  if (config.administrador) return config.administrador;

  await cliente.connect();
  const bd = cliente.db(config.nombreBD);
  config.administrador = bd.collection(config.coleccion);

  console.log('Conectado a base de datos');
};
