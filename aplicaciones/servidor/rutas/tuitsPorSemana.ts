import { FastifyPluginCallback } from 'fastify';
import { Db } from 'mongodb';
import { RespuestaTuitsPorSemana, TuitsPorSemana } from '../tipos';
import { colecciones, peticion } from '../utilidades/baseDeDatos';

const busqueda = async (): Promise<TuitsPorSemana[] | undefined> => {
  return peticion('tuitsPorSemana', (bd: Db) => {
    return new Promise(async (resolver) => {
      // Definir desde cual colección se extraen los datos.
      const coleccion = bd.collection(colecciones.tuits);
      const tuitsPorSemana = (await coleccion
        .aggregate([
          {
            $project: {
              a: { $year: '$created_at' }, // Año
              mes: { $month: '$created_at' }, // Mes
              semana: { $week: '$created_at' }, // Semana del año
              fecha: '$created_at', // Fecha del tuit
            },
          },
          {
            $group: {
              _id: ['$a', '$mes', '$semana'], // el identificador tiene la estructura que lo hace único: [año, mes, semana].
              fecha: { $first: '$fecha' }, // pasamos la primera fecha de la semana para ordenar en el paso siguiente.
              total: { $sum: 1 }, // Contador de la semana
            },
          },
          {
            $sort: { fecha: 1 }, // Ordenar por fechas.
          },
        ])
        .toArray()) as RespuestaTuitsPorSemana[];

      if (tuitsPorSemana && tuitsPorSemana.length) {
        const datos = tuitsPorSemana.map((datosSemana) => [...datosSemana._id, datosSemana.total]);
        resolver(datos);
      }
    });
  });
};

export const rutaTuitsPorSemana: FastifyPluginCallback = (servidor, opciones, listo) => {
  servidor.get('/tuits-por-semana', async (request, reply) => {
    const datos = await busqueda();
    reply.send(datos);
  });

  listo();
};
