import { FastifyPluginCallback } from 'fastify';
import { Db } from 'mongodb';
import { RespuestaTuitsContexto, TuitsContexto } from '../tipos';
import { colecciones, peticion } from '../utilidades/baseDeDatos';

const tuitsPorContextoDominio = async (): Promise<TuitsContexto[] | undefined> => {
  return peticion('tweetsPorContextoDominio', (bd: Db) => {
    return new Promise(async (resolver) => {
      const coleccion = bd.collection(colecciones.tuits);
      const respuestaBusqueda = (await coleccion
        .aggregate([
          {
            $project: {
              dominio: '$context_annotations.domain',
            },
          },
          {
            $group: {
              _id: { $first: '$dominio' },
              total: { $sum: 1 },
            },
          },
          {
            $sort: { total: -1 },
          },
        ])
        .toArray()) as RespuestaTuitsContexto[];

      const respuesta = respuestaBusqueda
        .filter((obj) => obj._id && obj.total >= 10 && obj._id.name !== 'Unified Twitter Taxonomy')
        .map((obj) => [obj._id.name, obj.total]);

      resolver(respuesta);
    });
  });
};

export const rutaTuitsPorContextoDominio: FastifyPluginCallback = (servidor, opciones, listo) => {
  servidor.get('/tuits-por-contexto-dominio', async (_, reply) => {
    const datos = await tuitsPorContextoDominio();
    reply.send(datos);
  });

  listo();
};
