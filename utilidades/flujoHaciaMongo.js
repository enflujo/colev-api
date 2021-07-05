import mongo from 'mongodb';
import { Writable } from 'stream';
const { MongoClient } = mongo;

const configPredeterminados = { batchSize: 1 };

export const flujoHaciaMongo = (opciones) => {
  const config = { ...configPredeterminados, ...opciones };
  let cliente;
  let conexion;
  let coleccion;
  let entradas = [];

  const agregar = async () => {
    await coleccion.insertMany(entradas);
    entradas = [];
  };

  const cerrar = async () => {
    if (!config.conexion && cliente) {
      await cliente.close();
    }
  };

  const flujo = new Writable({
    objectMode: true,

    write: async (entrada, codificacion, siguiente) => {
      try {
        if (!conexion) {
          if (config.conexion) {
            conexion = config.conexion;
          } else {
            cliente = await MongoClient.connect(config.url, { useUnifiedTopology: true, useNewUrlParser: true });
            conexion = cliente.db();
          }
        }

        if (!coleccion) {
          coleccion = await conexion.collection(config.nombreColeccion);
        }

        entradas.push(entrada);

        if (entradas.length >= config.batchSize) {
          await agregar();
        }

        siguiente();
      } catch (err) {
        await cerrar();
        flujo.emit('error', err);
      }
    },
  });

  flujo.on('finish', async () => {
    try {
      if (entradas.length > 0) await agregar();
      await cerrar();

      flujo.emit('close');
    } catch (err) {
      await cerrar();
      flujo.emit('error', err);
    }
  });

  return flujo;
};
