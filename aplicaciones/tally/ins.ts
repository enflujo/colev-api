import axios, { AxiosError } from 'axios';
import { casosPorEntradasUrl, logError, totalCasosUrl, ultimoCasoIdUrl } from './utilidades/constantes';
import { CasoLimpio, CasoFuente } from './tipos';
import limpieza from './limpieza';
import { llavesSoda } from './utilidades/llavesCasos';
import { guardarJSON } from './utilidades/ayudas';
import errata from './errata';
import { guardarVarios, desconectarBd } from './utilidades/baseDeDatos';
import { MongoError } from 'mongodb';
import barraProceso from './utilidades/barraProceso';

const produccion = process.env.NODE_ENV === 'produccion';
const iniciarEnPg = process.env.PAGINA ? +process.env.PAGINA : 0;
/**
 * La cantidad de casos por petición se procesan en memoria por lo que toca mantenerlo bajo.
 * Entre más alto, el servidor necesita tener más memoria ram para procesarlos.
 * El peso inicial (sin considerar la ram que necesita para procesar) se puede estimar con:
 * 10000 alrededor de 6.5mb | 20000 alrededor de 13mb | 50000 alrededor de 32.5mb
 *
 * EL API donde están los datos (SODA) supuestamente no tiene límites desde la versión 2.1.
 * Mongo tiene un limite de 100,000 en `insertMany`.
 */
const numeroPorPagina = process.env.CANTIDAD ? +process.env.CANTIDAD : 20000;

console.log(`Iniciando extracción en página ${iniciarEnPg} y modo ${numeroPorPagina} por página`);
/**
 * Extracción de los datos por medio de la API de Datos Abiertos: https://www.datos.gov.co/resource/gt2j-8ykr
 * Hace varias peticiones a la API para ir extrayendo y guardando en la base de datos sin saturar la memoria RAM.
 */
async function extraer(total: number, pagina = iniciarEnPg) {
  // Revisar si debe empezar en una página en particular, si no se pasa extrae todos los datos.
  if (pagina === iniciarEnPg) {
    // Inicializar barra de proceso.
    barraProceso.start(total, 0, {
      pagina: iniciarEnPg,
      totalPaginas: Math.ceil(total / numeroPorPagina) - 1,
      terminado: false,
    });
  }

  try {
    const inicioBloque = pagina * numeroPorPagina;
    const { data } = await axios.get(casosPorEntradasUrl('json', numeroPorPagina, inicioBloque));

    if (data.length) {
      const datosLimpios: CasoLimpio[] = [];

      /**
       * Procesar y limpiar bloque de datos.
       */
      try {
        data.forEach((d: CasoFuente) => {
          const casoLimpio = limpieza(d, llavesSoda);
          if (casoLimpio) datosLimpios.push(casoLimpio);
        });
      } catch (err) {
        barraProceso.stop();
        throw new Error(JSON.stringify(logError(err)));
      }

      /**
       * Guardar datos procesados en Mongo.
       */
      try {
        await guardarVarios(datosLimpios, 'casos');
      } catch (err) {
        const error = err as MongoError;
        barraProceso.stop();
        throw new Error(JSON.stringify(logError(`Error en instancia de MongoDB: ${error.code}`, error.message)));
      }

      /**
       * Actualizar barra de proceso.
       */
      const casosProcesados = inicioBloque + data.length;
      barraProceso.update(casosProcesados, { pagina: pagina });
      extraer(total, pagina + 1);
    } else {
      if (produccion) {
        guardarJSON(errata, 'errata');
      }

      try {
        await desconectarBd();
      } catch (err) {
        barraProceso.stop();
        console.log(logError(err));
      }

      barraProceso.update(total, { terminado: true });
      barraProceso.stop();
      return;
    }
  } catch (err: unknown) {
    const error = err as AxiosError;
    if (error.response) {
      console.error({ error: error.response.status, mensaje: error.response.data });
    } else {
      console.error(JSON.stringify(error, null, 2));
    }
  }
}

async function inicio() {
  const { data } = await axios(totalCasosUrl);
  const ultimoCaso = await axios(ultimoCasoIdUrl);
  console.log(ultimoCaso.data, data);

  if (data && data.length && data[0].count_id_de_caso) {
    const totalCasos = +data[0].count_id_de_caso;

    extraer(totalCasos);
  }
}

inicio();
