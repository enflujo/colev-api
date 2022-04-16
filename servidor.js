import 'dotenv/config';
import { readFile, mkdir } from 'fs/promises';
import fastify from 'fastify';
import cors from 'fastify-cors';
import * as extraerDatos from './utilidades/baseDatos.js';
import { carpetaTemporales, aviso, cyan, cadena } from './utilidades/constantes.js';
import { totalCasosUrl, ultimoCasoIdUrl } from './utilidades/ayudas.js';
import axios from 'axios';

const PUERTO = 8080;

const servidor = fastify();
servidor.register(cors);

servidor.get('/', async (request, reply) => {
  // extraerDatos.extraerTodos();
  const total = await axios(totalCasosUrl());
  console.log(total.data);
  const ultimo = await axios(ultimoCasoIdUrl());
  console.log(ultimo.data);

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
    const ultimoCasoId = await extraerDatos.actualizarUltimoCasoId();
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
  try {
    const { data } = await axios(totalCasosUrl());

    if (data && data.length && data[0].count_id_de_caso) {
      const totalCasos = +data[0].count_id_de_caso;
      reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send({
        mensaje: 'El servidor inició extracción y procesamiento de todos los datos',
        total: totalCasos,
      });

      extraerDatos.extraerTodos(totalCasos);
    }
  } catch (err) {
    reply.code(err.response.status).send({ error: err.response.status, mensaje: err.response.data.message });
  }
});

servidor.get('/raspar', async (request, reply) => {
  await extraerDatos.raspado();

  return { status: 'ok' };
});

const inicio = async () => {
  await mkdir(carpetaTemporales, { recursive: true });
  // await actualizarUltimoId();

  try {
    await servidor.listen(PUERTO);

    console.log(`${cadena} ${cyan('Servidor disponible en:')} ${aviso.underline(`http://localhost:${PUERTO}`)}`);
  } catch (err) {
    servidor.log.error(err);
    process.exit(1);
  }
};

inicio();
