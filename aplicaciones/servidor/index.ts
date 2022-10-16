import 'dotenv/config';
import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { borrarCache, casosPorDia, tweetsPorHora } from './utilidades/baseDeDatos';

const servidor: FastifyInstance = fastify();
const PUERTO = process.env.API_PUERTO ? +process.env.API_PUERTO : 8080;

servidor.register(cors);

servidor.get('/', async (request, reply) => {
  const datos = await casosPorDia();
  reply.send(datos);
});

servidor.get('/tweets', async (request, reply) => {
  const datos = await tweetsPorHora();
  reply.send(datos);
});

servidor.get('/borrar/:llave', async (request: any, reply) => {
  if (request.params.llave) {
    console.log(`Borrando cache: ${request.params.llave}`);
    const seBorroCache = await borrarCache(request.params.llave);
    reply.send(seBorroCache);
  }

  reply.send('No se pasó llave');
});

const inicio = async () => {
  try {
    await servidor.listen({ port: PUERTO });

    console.log(`Servidor disponible en: http://localhost:${PUERTO}`);
  } catch (err) {
    servidor.log.error(err);
    process.exit(1);
  }
};

inicio();
