import { FastifyPluginCallback } from 'fastify';
import { Db } from 'mongodb';
import { RespuestaTuitsPorHora, TuitsPorHora } from '../tipos';
import { colecciones, peticion } from '../utilidades/baseDeDatos';

const tuitsPorHoraTipo = async (): Promise<TuitsPorHora[] | undefined> => {
  return peticion('tweetsPorHoraTipo', (bd: Db) => {
    return new Promise(async (resolver) => {
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
              tipo: '$referenced_tweets.type',
              tweet: 1,
            },
          },
          {
            $group: {
              _id: ['$a', '$m', '$d', '$h', { $first: '$tipo' }],
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
        const datos = tuitsPorHora.map((datosHora) => {
          const [año, mes, dia, hora, tipo] = datosHora._id;
          return [`${año}-${mes}-${dia}`, +hora, +datosHora.total, tipo];
        });

        resolver(datos);
      }
    });
  });
};

export const rutaTuitsPorHoraTipo: FastifyPluginCallback = (servidor, opciones, listo) => {
  servidor.get('/tuits-por-hora-tipo', async (_, reply) => {
    const datos = await tuitsPorHoraTipo();
    reply.send(datos);
  });

  listo();
};
