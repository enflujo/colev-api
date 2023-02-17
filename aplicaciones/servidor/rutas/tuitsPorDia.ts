import { FastifyPluginCallback } from 'fastify';
import { Db } from 'mongodb';
import { RespuestaTuitsPorDia, TuitsPorDia } from '../tipos';
import { colecciones, peticion } from '../utilidades/baseDeDatos';

const tuitsPorDia = async (): Promise<TuitsPorDia[] | undefined> => {
  return peticion('tuitsPorDia', (bd: Db) => {
    return new Promise(async (resolver) => {
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
        const datos = tuitsPorDia.map((datosDia) => [datosDia._id.join('-'), datosDia.total]);
        resolver(datos);
      }
    });
  });
};

export const rutaTuitsPorDia: FastifyPluginCallback = (servidor, opciones, listo) => {
  servidor.get('/tuits-por-dia', async (request, reply) => {
    const datos = await tuitsPorDia();
    reply.send(datos);
  });

  listo();
};
