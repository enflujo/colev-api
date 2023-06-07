import { FastifyPluginCallback } from 'fastify';
import { Db } from 'mongodb';
import { RespuestaTuitsPorHora, TuitsPorHora } from '../tipos';
import { colecciones, peticion } from '../utilidades/baseDeDatos';
import { numFechas } from '../utilidades/ayudas';

const tuitsPorHora = async (): Promise<TuitsPorHora[] | undefined> => {
  return peticion('tweetsPorHora', (bd: Db) => {
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
        let diaPandemia = 0;

        const datos = tuitsPorHora.map((datosHora) => {
          const [año, mes, dia, hora] = datosHora._id;
          const h = +hora;
          const fecha = `${año}-${numFechas(mes)}-${numFechas(dia)}T${numFechas(hora)}:00:00`;
          diaPandemia = h === 0 ? diaPandemia + 1 : diaPandemia;

          return [fecha, diaPandemia, +datosHora.total];
        });

        resolver(datos);
      }
    });
  });
};

export const rutaTuitsPorHora: FastifyPluginCallback = (servidor, opciones, listo) => {
  servidor.get('/tuits-por-hora', async (_, reply) => {
    const datos = await tuitsPorHora();
    reply.send(datos);
  });

  listo();
};
