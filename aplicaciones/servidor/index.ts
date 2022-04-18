import 'dotenv/config';
import fastify, { FastifyInstance } from 'fastify';
import cors from 'fastify-cors';
import axios, { AxiosError } from 'axios';
import { logAviso, logCyan, cadena, totalCasosUrl } from './utilidades/constantes';
import datosAbiertos from './modulos/extraccion/datosAbiertos';
import * as bd from './modulos/baseDeDatos';

const servidor: FastifyInstance = fastify();
const PUERTO = process.env.API_PUERTO || 8080;

servidor.register(cors);

servidor.get('/', async (request, reply) => {
  const datos = await bd.casosPorDia();

  return datos;
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

      datosAbiertos(totalCasos);
    }
  } catch (err) {
    const error = err as AxiosError;

    if (error.response) {
      reply.code(error.response.status).send({ error: error.response.status, mensaje: error.response.data.message });
    } else {
      reply.code(500).send({ error: 'desconocido', mensaje: error });
    }
  }
});

const inicio = async () => {
  try {
    await servidor.listen(PUERTO);

    console.log(`${cadena} ${logCyan('Servidor disponible en:')} ${logAviso.underline(`http://localhost:${PUERTO}`)}`);
  } catch (err: unknown) {
    servidor.log.error(err);
    process.exit(1);
  }
};

inicio();
