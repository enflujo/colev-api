import { FastifyPluginCallback } from 'fastify';
import { borrarCache } from '../utilidades/baseDeDatos';

export const rutaBorrarCache: FastifyPluginCallback = (servidor, opciones, listo) => {
  servidor.get('/borrar/:llave', async (request: any, reply) => {
    if (request.params.llave) {
      console.log(`Borrando cache: ${request.params.llave}`);
      const seBorroCache = await borrarCache(request.params.llave);
      reply.send(seBorroCache);
    }

    reply.send('No se pasó llave');
  });

  listo();
};
