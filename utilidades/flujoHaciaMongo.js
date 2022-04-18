import { MongoClient } from 'mongodb';
import axios from 'axios';
import { puntoDatos } from './constantes.js';
const { BD_USUARIO, BD_CLAVE, BD_PUERTO, TOKEN } = process.env;

const cliente = new MongoClient(`mongodb://${BD_USUARIO}:${BD_CLAVE}@localhost:${BD_PUERTO}/?directConnection=true`);
const config = { nombreBD: 'covid19', coleccionCasos: 'casos', coleccionGeneral: 'general', administrador: null };

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
};

export const conectar = async () => {
  if (config.administrador) return config.administrador;

  await cliente.connect();
  const bd = cliente.db(config.nombreBD);
  config.administrador = bd.collection(config.coleccionCasos);
};

export const guardarVarios = async (datos) => {
  try {
    await conectar();
    const entradas = datos.map((caso) => {
      return {
        updateOne: {
          filter: { _id: caso._id },
          update: { $set: caso },
          upsert: true,
        },
      };
    });

    await config.administrador.bulkWrite(entradas);
  } finally {
    await cerrar();
  }
};

export const actualizarUltimoId = async () => {
  try {
    const { data } = await axios.get(`${puntoDatos}.json?$$app_token=${TOKEN}&$select=max(id_de_caso)`);

    if (data && data.length && data[0].max_id_de_caso && !isNaN(data[0].max_id_de_caso)) {
      const ultimoCasoId = +data[0].max_id_de_caso;
      await cliente.connect();
      const bd = cliente.db(config.nombreBD);
      const coleccion = bd.collection(config.coleccionGeneral);

      const obj = await coleccion.findOne({ nombre: 'ultimoCaso' });

      console.log(obj.ultimoCasoId, ultimoCasoId);

      if (obj.ultimoCasoId === ultimoCasoId) {
        console.log('El último caso es el mismo');
      } else {
        await coleccion.updateOne(
          {
            nombre: 'ultimoCaso',
          },
          {
            $set: {
              ultimoCasoId: ultimoCasoId,
              anterior: obj.ultimoCasoId ? obj.ultimoCasoId : 0,
            },
          },
          {
            upsert: true,
          }
        );
      }
    }
  } finally {
    await cliente.close();
  }
};
