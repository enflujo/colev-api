import { FastifyPluginCallback } from 'fastify';
import { tendencias } from '../utilidades/baseDeDatos';

export const rutaTendencias: FastifyPluginCallback = (servidor, opciones, listo) => {
  servidor.get('/tendencias', async (peticion, respuesta) => {
    console.log('buscando tendencias');
    const datos = await tendencias();
    console.log(datos);
    respuesta.send(datos);
  });

  listo();
};
