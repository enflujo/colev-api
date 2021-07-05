import 'dotenv/config';
import fs from 'fs/promises';
import { readFile } from 'fs/promises';
import fastify from 'fastify';
import * as baseDeDatos from './utilidades/baseDatos.js';
import { carpetaTemporales } from './utilidades/constantes.js';

const servidor = fastify();

servidor.get('/', async (request, reply) => {
  // baseDeDatos.procesarEnFlujo();
  // baseDeDatos.extraerTodos();
  baseDeDatos.raspado();

  return { status: 'ok' };
});

servidor.get('/actualizar', async (request, reply) => {
  try {
    const ultimoCasoId = await baseDeDatos.actualizarUltimoCasoId();
    return { ultimoCasoId };
  } catch (error) {
    console.error(error);
  }
});

servidor.get('/descriptores', async (request, reply) => {
  const descriptores = await readFile('./datos/descriptores.json');

  return JSON.parse(descriptores);
});

servidor.get('/procesar', async (request, reply) => {
  // const
});

const inicio = async () => {
  await fs.mkdir(carpetaTemporales, { recursive: true });

  await baseDeDatos.inicio();

  try {
    await servidor.listen(3000);
  } catch (err) {
    servidor.log.error(err);
    process.exit(1);
  }
};

inicio();
