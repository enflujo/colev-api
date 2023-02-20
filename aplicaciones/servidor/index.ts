import 'dotenv/config';
import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { rutaCasosPorDia } from './rutas/insCasosPorDia';
import { rutaBorrarCache } from './rutas/cache';
import { rutaTendencias } from './rutas/twitter';
import { rutaTuitsPorDia } from './rutas/tuitsPorDia';
import { rutaTuitsPorHora } from './rutas/tuitsPorHora';
import { rutaTuitsPorSemana } from './rutas/tuitsPorSemana';

const servidor: FastifyInstance = fastify();
const PUERTO = process.env.API_PUERTO ? +process.env.API_PUERTO : 8080;

if (process.env.NODE_ENV !== 'produccion') {
  servidor.register(cors);
}

servidor.register(rutaCasosPorDia, { prefix: '/tally' });
servidor.register(rutaBorrarCache, { prefix: '/tally' });
servidor.register(rutaTuitsPorDia, { prefix: '/tally' });
servidor.register(rutaTuitsPorSemana, { prefix: '/tally' });
servidor.register(rutaTuitsPorHora, { prefix: '/tally' });
servidor.register(rutaTendencias, { prefix: '/tally' });

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
