import { FastifyPluginCallback } from 'fastify';
import { casosPorDia } from '../utilidades/baseDeDatos';

export const rutaCasosPorDia: FastifyPluginCallback = (servidor, opciones, listo) => {
  servidor.get('/casos-por-dia', async (request, reply) => {
    const datos = await casosPorDia();
    reply.send(datos);
  });

  listo();
};
