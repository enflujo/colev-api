import 'dotenv/config';
import fastify, { FastifyInstance } from 'fastify';
import cors from 'fastify-cors';
import axios, { AxiosError } from 'axios';
import { logAviso, logCyan, cadena, totalCasosUrl, ultimoCasoIdUrl, logError } from './utilidades/constantes';
import datosAbiertos from './modulos/extraccion/datosAbiertos';
import * as bd from './modulos/baseDeDatos';
import palabrasClaves from './utilidades/palabrasClaves';

const servidor: FastifyInstance = fastify();
const PUERTO = process.env.API_PUERTO || 8080;

const instanciaAxios = axios.create({
  baseURL: 'https://api.twitter.com/2/tweets/search',
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  },
});

servidor.register(cors);

servidor.get('/', async (request, reply) => {
  const datos = await bd.casosPorDia();

  return datos;
});

servidor.get('/tweets', async (request, reply) => {
  const datos = await bd.tweetsPorHora();

  return datos;
});

servidor.get('/extraer', async (request, reply) => {
  try {
    const { data } = await axios(totalCasosUrl);
    const ultimoCaso = await axios(ultimoCasoIdUrl);
    console.log(ultimoCaso.data, data);

    if (data && data.length && data[0].count_id_de_caso) {
      const totalCasos = +data[0].count_id_de_caso;
      reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send({
        mensaje: 'El servidor inició extracción y procesamiento de todos los datos',
        total: totalCasos,
      });

      datosAbiertos(totalCasos, 60);
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

// Un día antes del inicio de la pandemia (6 de marzo, 2020)
const fechaInicial = new Date('05 March 2020 00:00 UTC').toISOString();
// Fecha actual menos 10 segundos (Twitter sólo acepta fecha final con 10 segundos de diferencia)
const hoy = Date.now() - 10 * 1000;
const fechaFinal = new Date(hoy).toISOString();

const busqueda = palabrasClaves.covid19.join(' OR ');

type ParametrosQuery = {
  query: string;
  start_time: string;
  end_time: string;
  next_token: string | null;
  max_results: number;
  'tweet.fields': string;
  expansions: string;
  'media.fields': string;
};

const parametrosBase = {
  query: `(${busqueda}) place_country:CO`,
  start_time: fechaInicial,
  end_time: fechaFinal,
  next_token: null,
};

const parametrosBusqueda: any = {
  ...parametrosBase,
  max_results: 100,
  'tweet.fields':
    'attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,public_metrics,referenced_tweets,reply_settings,source,text,withheld',
  expansions:
    'attachments.media_keys,attachments.poll_ids,author_id,entities.mentions.username,geo.place_id,in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id',
  'media.fields': 'media_key,duration_ms,height,preview_image_url,type,url,width,public_metrics,alt_text,variants',
};

async function peticion(pagina: string | null) {
  if (pagina) {
    parametrosBusqueda.next_token = pagina;
  }

  try {
    const { data } = await instanciaAxios.get(`/all`, { params: parametrosBusqueda });
    const { data: tweets, includes, meta } = data;

    bd.guardarBasicosTweeter(
      tweets.map((t: any) => {
        t.created_at = new Date(t.created_at);
        return t;
      })
    );
    console.log(meta.next_token);
    if (meta.next_token) {
      await peticion(meta.next_token);
    }
  } catch (error) {
    console.log('xxxxxxx', logError(error._message), 'xxxxxxxx');
    console.log(error);

    throw new Error();
  }
}

servidor.get('/extraer-tweets', async (request, reply) => {
  try {
    await peticion('b26v89c19zqg8o3fpdy7oatq2gopm98nqcf9fzxpuvmgt');
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
