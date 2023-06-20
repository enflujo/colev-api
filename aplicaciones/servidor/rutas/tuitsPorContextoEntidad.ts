import { FastifyPluginCallback } from 'fastify';
import { Db } from 'mongodb';
import { RespuestaTuitsContexto, TuitsContexto } from '../tipos';
import { colecciones, peticion } from '../utilidades/baseDeDatos';

const tuitsPorContextoEntidad = async (): Promise<TuitsContexto[] | undefined> => {
  return peticion('tweetsPorContextoEntidad', (bd: Db) => {
    return new Promise(async (resolver) => {
      const coleccion = bd.collection(colecciones.tuits);
      const respuestaBusqueda = (await coleccion
        .aggregate([
          {
            $project: {
              entidad: '$context_annotations.entity',
            },
          },
          {
            $group: {
              _id: { $first: '$entidad' },
              total: { $sum: 1 },
            },
          },
          {
            $sort: { total: -1 },
          },
        ])
        .toArray()) as RespuestaTuitsContexto[];

      const respuesta = respuestaBusqueda
        .filter((obj) => obj._id && obj.total >= 10)
        .map((obj) => [obj._id.name, obj.total]);

      resolver(respuesta);
    });
  });
};

export const rutaTuitsPorContextoEntidad: FastifyPluginCallback = (servidor, opciones, listo) => {
  servidor.get('/tuits-por-contexto-entidad', async (_, reply) => {
    const datos = await tuitsPorContextoEntidad();
    reply.send(datos);
  });

  listo();
};
