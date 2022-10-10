import 'dotenv/config';
import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { casosPorDia, tweetsPorHora } from './utilidades/baseDeDatos';

const servidor: FastifyInstance = fastify();
const PUERTO = process.env.API_PUERTO ? +process.env.API_PUERTO : 8080;

servidor.register(cors);

servidor.get('/', async (request, reply) => {
  const datos = await casosPorDia();

  return datos;
});

servidor.get('/tweets', async (request, reply) => {
  const datos = await tweetsPorHora();

  return datos;
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
