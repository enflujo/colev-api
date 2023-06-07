import { FastifyPluginCallback } from 'fastify';
import { Db } from 'mongodb';
import { DatoTuitTipos, RespuestaTuitsPorHora, TuitsPorHora } from '../tipos';
import { colecciones, peticion } from '../utilidades/baseDeDatos';
import { numFechas } from '../utilidades/ayudas';

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
        let diaPandemia = 0;

        const respuesta: DatoTuitTipos[] = [];

        tuitsPorHora.forEach((datosHora) => {
          const [año, mes, dia, hora, tipo] = datosHora._id;
          const h = +hora;
          const fecha = `${año}-${numFechas(mes)}-${numFechas(dia)}T${numFechas(hora)}:00:00`;
          const datoGuardado = respuesta.find((d) => d[0] === fecha);
          const _tipo = tipo || 'original';

          diaPandemia = h === 0 ? diaPandemia + 1 : diaPandemia;

          if (!datoGuardado) {
            const fila: DatoTuitTipos = [fecha, diaPandemia, +datosHora.total, {}];
            fila[3][_tipo] = +datosHora.total;
            respuesta.push(fila);
          } else {
            datoGuardado[2] += +datosHora.total;

            if (!datoGuardado[3][_tipo]) {
              datoGuardado[3][_tipo] = +datosHora.total;
            }
          }
          return [fecha, diaPandemia, +datosHora.total, tipo || 'original'];
        });

        resolver(respuesta);
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
