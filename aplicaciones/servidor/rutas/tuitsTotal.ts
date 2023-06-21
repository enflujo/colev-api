import { FastifyPluginCallback } from 'fastify';
import { Db } from 'mongodb';
import { colecciones, peticion } from '../utilidades/baseDeDatos';

const tuitsTotal = async (): Promise<number | undefined> => {
  return peticion('tweetsTotal', (bd: Db) => {
    return new Promise(async (resolver) => {
      const coleccion = bd.collection(colecciones.tuits);
      const respuestaBusqueda = await coleccion.countDocuments();
      console.log(respuestaBusqueda);
      resolver({ total: respuestaBusqueda });
    });
  });
};

export const rutaTuitsTotal: FastifyPluginCallback = (servidor, opciones, listo) => {
  servidor.get('/tuits-total', async (_, reply) => {
    const datos = await tuitsTotal();
    reply.send(datos);
  });

  listo();
};
