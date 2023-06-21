import type { TuitsDatos, TuitsPorHora } from '@/tipos';
import { servidorUrl, zona } from '../constantes';
import { instanciaFechas } from './fechas';
import { definirMinMaxFechas, definirValorDesde, definirValorHasta } from './camposFechas';

export async function cargarDatos() {
  const fechas = instanciaFechas();
  const datos = await fetch(`${servidorUrl}/tuits-por-hora-tipo`)
    .then((respuesta) => respuesta.json())
    .then(procesarDatos);

  const maximo = Math.max(...datos.map((d: TuitsPorHora) => d.valor));
  const fechaInicial = fechas.tz(datos[0].fecha, zona);
  const fechaFinal = fechas.tz(datos[datos.length - 1].fecha, zona);
  const fechaMin = fechaInicial.toDate();
  const fechaMax = fechaFinal.toDate();

  definirMinMaxFechas(fechaMin, fechaMax);
  definirValorDesde(fechaMin);
  definirValorHasta(fechaMax);

  return { datos, maximo, fechaMin, fechaMax };
}

function procesarDatos(datos: TuitsDatos[]) {
  const conTipo = datos[0].length === 4;
  const procesados = datos.map((d): TuitsPorHora => {
    const fecha = new Date(d[0]);

    if (!conTipo) {
      return { fecha, dia: d[1], valor: d[2] };
    } else {
      return { fecha, dia: d[1], valor: d[2], tipo: d[3] };
    }
  });

  procesados.sort((a, b) => +a.fecha - +b.fecha);
  return procesados;
}
