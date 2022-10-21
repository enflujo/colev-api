import { FastifyPluginCallback } from 'fastify';
import { tuitsPorDia, tuitsPorHora } from '../utilidades/baseDeDatos';

export const rutaTuitsPorDia: FastifyPluginCallback = (servidor, opciones, listo) => {
  servidor.get('/tuits-por-dia', async (request, reply) => {
    const datos = await tuitsPorDia();
    reply.send(datos);
  });

  listo();
};

export const rutaTuitsPorHora: FastifyPluginCallback = (servidor, opciones, listo) => {
  servidor.get('/tuits-por-hora', async (request, reply) => {
    const datos = await tuitsPorHora();
    reply.send(datos);
  });

  listo();
};
