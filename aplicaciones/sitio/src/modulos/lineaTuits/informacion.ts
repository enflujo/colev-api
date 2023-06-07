import type { TuitsPorHora } from '@/tipos';
import { margen } from './constantes';

const contenedor = document.getElementById('info') as HTMLDivElement;
const fecha = contenedor.querySelector('.fecha') as HTMLSpanElement;
const total = contenedor.querySelector('.total .valor') as HTMLSpanElement;
const originales = contenedor.querySelector('.originales .valor') as HTMLSpanElement;
const citas = contenedor.querySelector('.citas .valor') as HTMLSpanElement;
const replicas = contenedor.querySelector('.replicas .valor') as HTMLSpanElement;

const traducirFecha = (fecha: Date) => {
  return fecha.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric' });
};

export const actualizarInfo = (punto: TuitsPorHora, posicion: [x: number, y: number]) => {
  fecha.innerText = `${traducirFecha(punto.fecha)}`;
  total.innerText = `${punto.valor}`;
  originales.innerText = `${punto.tipo?.original || 0}`;
  citas.innerText = `${punto.tipo?.quoted || 0}`;
  replicas.innerText = `${punto.tipo?.replied_to || 0}`;
  const dims = contenedor.getBoundingClientRect();
  const x1 = posicion[0] + margen.izq;
  const y1 = posicion[1];
  const x = x1 + dims.width > window.innerWidth ? x1 - dims.width : x1;
  const y2 = y1 - dims.height + 10;
  const y = y2 < margen.arriba ? y1 : y2;

  contenedor.style.transform = `translate(${x}px, ${y}px)`;
};

export const mostrarInfo = () => {
  contenedor.classList.add('visible');
};

export const esconderInfo = () => {
  contenedor.classList.remove('visible');
};
