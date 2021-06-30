import 'dotenv/config';
import { readFile } from 'fs/promises';
import fastify from 'fastify';
import axios from 'axios';
import * as baseDeDatos from './utilidades/baseDatos.js';
import { casosPorEntradas } from './utilidades/ayudas.js';

const servidor = fastify();

servidor.get('/', async (request, reply) => {
  try {
    const { data } = await axios.get(casosPorEntradas('json', 10, 10));
    return data;
  } catch (error) {
    console.error(error);
  }
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

const inicio = async () => {
  await baseDeDatos.inicio();

  try {
    await servidor.listen(3000);
  } catch (err) {
    servidor.log.error(err);
    process.exit(1);
  }
};

inicio();
