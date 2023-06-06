import type { TuitsPorHora } from '@/tipos';
import { servidorUrl, zona } from './constantes';
import { procesarDatos } from './procesarDatos';
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
