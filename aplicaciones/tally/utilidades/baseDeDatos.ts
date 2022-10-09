import { Db, MongoClient } from 'mongodb';
import { CasoLimpio, TMedio, TwitterBasicos } from '../tipos';

const { BD_USUARIO, BD_CLAVE, BD_PUERTO } = process.env;

const cliente = new MongoClient(`mongodb://${BD_USUARIO}:${BD_CLAVE}@localhost:${BD_PUERTO}/?directConnection=true`);
const nombreBd = 'colev';
let bd: Db | null = null;

type Colecciones = {
  casos: 'Casos de COVID19 registrados en el INS';
  tuits: 'Datos de tweeter';
  'tuits-relacionados': 'Tuits a los que se hace referencia en los tuits (conversaciones, respuesta a, etc)';
  'tuits-medios': 'Medios a los que se hace referencia en los tuits';
};

export const conectarBd = async (): Promise<Db> => {
  if (bd) return bd;
  const conexion = await cliente.connect();
  bd = conexion.db(nombreBd);

  return bd;
};

export const desconectarBd = async (): Promise<void> => {
  await cliente.close();
  bd = null;
};

export const guardarVarios = async (datos: CasoLimpio[], nombreColeccion: string): Promise<void> => {
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

    const coleccion = bd.collection(nombreColeccion);
    await coleccion.bulkWrite(entradas);
  }
};

export const guardarTuits = async (datos: TwitterBasicos[], nombreColeccion: keyof Colecciones) => {
  await conectarBd();

  if (bd) {
    const entradas = datos.map((tuit: TwitterBasicos) => {
      const tuitId = tuit.id;
      delete tuit.id;

      return {
        updateOne: {
          filter: { _id: tuitId },
          update: { $set: tuit },
          upsert: true,
        },
      };
    });

    const coleccion = bd.collection(nombreColeccion);
    await coleccion.bulkWrite(entradas);
  }
};

export const guardarMedios = async (datos: TMedio[], nombreColeccion: keyof Colecciones) => {
  await conectarBd();

  if (bd) {
    const entradas = datos.map((medio: TMedio) => {
      const medioId = medio.media_key;
      delete medio.media_key;

      return {
        updateOne: {
          filter: { _id: medioId },
          update: { $set: medio },
          upsert: true,
        },
      };
    });

    const coleccion = bd.collection(nombreColeccion);
    await coleccion.bulkWrite(entradas);
  }
};

// Queries

export const buscarPrimerUltimoTuit = async (direccion: 1 | -1 = -1) => {
  await conectarBd();

  if (bd) {
    const coleccion = bd.collection('tuits');

    if (coleccion) {
      return await coleccion.findOne({}, { sort: { created_at: direccion } });
    }

    return null;
  }
};
