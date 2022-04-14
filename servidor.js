import 'dotenv/config';
import fs from 'fs/promises';
import { readFile } from 'fs/promises';
import fastify from 'fastify';
import cors from 'fastify-cors';
import * as baseDeDatos from './utilidades/baseDatos.js';
import { carpetaTemporales, aviso, cyan, cadena } from './utilidades/constantes.js';
import { conectar, cerrar, casosPorDia } from './utilidades/flujoHaciaMongo.js';
const PUERTO = 8080;

const servidor = fastify();
servidor.register(cors);

servidor.get('/', async (request, reply) => {
  baseDeDatos.extraerTodos();
  // baseDeDatos.actualizarUltimoCasoId();
  // try {
  //   const datos = await conectar().then(casosPorDia);
  //   reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send(datos);
  //   await cerrar();
  // } catch (err) {
  //   reply.code(500).send(err);
  // }
  return { status: 'ok' };
});

servidor.get('/total-casos', async (request, reply) => {});

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

servidor.get('/extraer', async (request, reply) => {
  await baseDeDatos.raspado();

  return { status: 'ok' };
});

const inicio = async () => {
  await fs.mkdir(carpetaTemporales, { recursive: true });
  await baseDeDatos.inicio();

  try {
    await servidor.listen(PUERTO);

    console.log(`${cadena} ${cyan('Servidor disponible en:')} ${aviso.underline(`http://localhost:${PUERTO}`)}`);
  } catch (err) {
    servidor.log.error(err);
    process.exit(1);
  }
};

inicio();
