import { fechasActuales } from './cerebro';
import { instanciaFechas } from './fechas';

const filtroDesde = document.getElementById('filtroDesde') as HTMLInputElement;
const filtroHasta = document.getElementById('filtroHasta') as HTMLInputElement;

filtroDesde.onchange = (evento) => {
  const { value } = evento.target as HTMLInputElement;
  fechasActuales.setKey('inicio', new Date(value));
};

filtroHasta.onchange = (evento) => {
  const { value } = evento.target as HTMLInputElement;
  fechasActuales.setKey('fin', new Date(value));
};

function fechaATexto(fecha: Date) {
  return instanciaFechas().tz(fecha).format('YYYY-MM-DDTHH:00');
}

export const definirMinMaxFechas = (min: Date, max: Date) => {
  filtroDesde.setAttribute('min', fechaATexto(min));
  filtroDesde.setAttribute('max', fechaATexto(max));

  filtroHasta.setAttribute('min', fechaATexto(min));
  filtroHasta.setAttribute('max', fechaATexto(max));
};

export const definirValores = (inicio: Date, fin: Date) => {
  definirValorDesde(inicio);
  definirValorHasta(fin);
};

export const definirValorDesde = (fecha: Date) => {
  filtroDesde.value = fechaATexto(fecha);
  filtroDesde.dispatchEvent(new Event('change'));
};

export const definirValorHasta = (fecha: Date) => {
  filtroHasta.value = fechaATexto(fecha);
  filtroHasta.dispatchEvent(new Event('change'));
};

export const valorDesde = () => filtroDesde.value;
export const valorHasta = () => filtroHasta.value;
