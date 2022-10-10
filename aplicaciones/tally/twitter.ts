import axios from 'axios';
import palabrasClave from './utilidades/palabrasClaves';
import { buscarPrimerUltimoTuit, guardarMedios, guardarTuits } from './utilidades/baseDeDatos';
import { logError } from './utilidades/constantes';
import { ParametrosQuery, TLugar, TUsuario, TwitterBasicos } from './tipos';
import { camposMedios, camposTweet, expansiones } from './utilidades/camposTweeter';
import { reducirSemanas } from './utilidades/ayudas';

// Un día antes del inicio de la pandemia (6 de marzo, 2020)
const fechaInicioPandemia = new Date('05 March 2020 00:00 UTC');

const instanciaAxios = axios.create({
  baseURL: 'https://api.twitter.com/2/tweets/search',
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  },
});

const definirParametros = (fechaPrimerTuit: Date, fechaUltimoTuit: Date): ParametrosQuery => {
  // Fecha actual menos 10 segundos (Twitter sólo acepta fecha final con 10 segundos de diferencia)
  const hoy = new Date(Date.now() - 10 * 1000);
  const busqueda = palabrasClave.covid19.join(' OR ');

  const diaUltimoTuit = {
    año: fechaUltimoTuit.getFullYear(),
    mes: fechaUltimoTuit.getMonth(),
    dia: fechaUltimoTuit.getDay(),
  };
  const diaHoy = { año: hoy.getFullYear(), mes: hoy.getMonth(), dia: hoy.getDay() };
  const esMismoDia =
    diaUltimoTuit.año === diaHoy.año || diaUltimoTuit.mes === diaHoy.mes || diaUltimoTuit.dia === diaHoy.dia;

  // POR HACER: toca cambiar esto cuando este llena la BD o hacer otra comprobación para que empiece 2 semanas antes si ya sabemos que esta lleno.
  const fechaInicial =
    fechaPrimerTuit >= fechaInicioPandemia ? fechaInicioPandemia : reducirSemanas(2, fechaUltimoTuit);
  const fechaFinal = esMismoDia ? hoy : fechaUltimoTuit;

  return {
    query: `(${busqueda}) place_country:CO`,
    max_results: 100,
    'tweet.fields': camposTweet.join(','),
    expansions: expansiones.join(','),
    'media.fields': camposMedios.join(','),
    start_time: fechaInicial.toISOString(),
    end_time: fechaFinal.toISOString(),
  };
};

async function peticion(parametrosBusqueda: ParametrosQuery, pagina?: string) {
  if (pagina) {
    parametrosBusqueda.next_token = pagina;
  }

  try {
    const { data } = await instanciaAxios.get(`/all`, { params: parametrosBusqueda });
    const { data: tweets, includes, meta } = data;

    const modelarTuit = (tuit: TwitterBasicos) => {
      tuit.created_at = new Date(tuit.created_at);
      const relacionUsuario = includes.users.find((usuario: TUsuario) => usuario.id === tuit.author_id);

      if (relacionUsuario) {
        tuit.author_name = relacionUsuario.name;
        tuit.author_username = relacionUsuario.username;
      }

      if (tuit.geo) {
        const relacionLugar = includes.places.find((lugar: TLugar) => lugar.id === tuit.geo.place_id);

        if (relacionLugar) {
          tuit.geo.place_full_name = relacionLugar.full_name;
        }
      }

      return tuit;
    };

    await guardarTuits(tweets.map(modelarTuit), 'tuits');
    await guardarTuits(includes.tweets.map(modelarTuit), 'tuits-relacionados');
    await guardarMedios(includes.media, 'tuits-medios');

    if (meta.next_token) {
      console.log(meta.next_token);
      await peticion(parametrosBusqueda, meta.next_token);
    } else {
      console.log('-------------- FIN ---------------');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('xxxxxxx', logError(JSON.stringify(error.response?.data, null, 2)), 'xxxxxxxx');
    }

    throw new Error();
  }
}

async function inicio() {
  try {
    const ultimoTuit = await buscarPrimerUltimoTuit(-1);
    const primerTuit = await buscarPrimerUltimoTuit(1);
    const fechaPrimerTuit = primerTuit ? primerTuit.created_at : fechaInicioPandemia;
    const fechaUltimoTuit = ultimoTuit ? ultimoTuit.created_at : new Date();
    const parametros = definirParametros(fechaPrimerTuit, fechaUltimoTuit);

    await peticion(parametros);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        JSON.stringify({
          error: error.response.status,
          mensaje: error.response.data.message,
        })
      );
    } else {
      throw new Error(JSON.stringify({ error: 'desconocido', mensaje: error }));
    }
  }
}

inicio();
