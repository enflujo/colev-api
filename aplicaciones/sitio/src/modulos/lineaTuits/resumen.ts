import { fechasActuales } from '@/modulos/lineaTuits/cerebro';
import type { TuitsPorHora } from '@/tipos';
import { porcentaje } from '@/utilidades/ayudas';

const contenedor = document.getElementById('resumen') as HTMLDivElement;
const desde = contenedor.querySelector('.desde') as HTMLSpanElement;
const hasta = contenedor.querySelector('.hasta') as HTMLSpanElement;
const total = contenedor.querySelector('.total .valor') as HTMLParagraphElement;
const originales = contenedor.querySelector('.originales .valor') as HTMLParagraphElement;
const citas = contenedor.querySelector('.citas .valor') as HTMLParagraphElement;
const replicas = contenedor.querySelector('.replicas .valor') as HTMLParagraphElement;
const barraOriginales = contenedor.querySelector('#barras .originales') as HTMLSpanElement;
const barraCitas = contenedor.querySelector('#barras .citas') as HTMLSpanElement;
const barraReplicas = contenedor.querySelector('#barras .replicas') as HTMLSpanElement;
const valorOriginales = barraOriginales.querySelector('.valor') as HTMLSpanElement;
const valorCitas = barraCitas.querySelector('.valor') as HTMLSpanElement;
const valorReplicas = barraReplicas.querySelector('.valor') as HTMLSpanElement;

function fechaATexto(fecha: Date) {
  return fecha.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
  });
}

export const iniciarResumen = (datos: TuitsPorHora[]) => {
  fechasActuales.subscribe((fechas) => {
    if (!fechas.inicio || !fechas.fin) return;
    desde.innerText = fechaATexto(fechas.inicio);
    hasta.innerText = fechaATexto(fechas.fin);

    const datosSeccion = datos.reduce(
      (acumulado, actual) => {
        if (actual.fecha >= fechas.inicio && actual.fecha <= fechas.fin) {
          acumulado.valor += actual.valor;

          if (acumulado.tipo) {
            if (typeof acumulado.tipo.original === 'number') {
              acumulado.tipo.original += actual.tipo?.original || 0;
            }

            if (typeof acumulado.tipo.quoted === 'number') {
              acumulado.tipo.quoted += actual.tipo?.quoted || 0;
            }

            if (typeof acumulado.tipo.replied_to === 'number') {
              acumulado.tipo.replied_to += actual.tipo?.replied_to || 0;
            }
          }

          return acumulado;
        }

        return acumulado;
      },
      { valor: 0, dia: 0, fecha: datos[0].fecha, tipo: { original: 0, quoted: 0, replied_to: 0 } }
    );

    const valorTotal = datosSeccion.valor;
    total.innerText = `${valorTotal}`;
    originales.innerText = `${datosSeccion.tipo?.original}`;
    citas.innerText = `${datosSeccion.tipo?.quoted}`;
    replicas.innerText = `${datosSeccion.tipo?.replied_to}`;

    const pasoX = 500 / valorTotal;

    if (datosSeccion.tipo) {
      if (typeof datosSeccion.tipo?.original === 'number') {
        const valor = datosSeccion.tipo.original;
        barraOriginales.style.width = `${(valor * pasoX) | 0}px`;
        valorOriginales.innerText = `${porcentaje(valorTotal, valor)}%`;
      }

      if (typeof datosSeccion.tipo?.quoted === 'number') {
        const valor = datosSeccion.tipo.quoted;
        barraCitas.style.width = `${(valor * pasoX) | 0}px`;
        valorCitas.innerText = `${porcentaje(valorTotal, valor)}%`;
      }

      if (typeof datosSeccion.tipo?.replied_to === 'number') {
        const valor = datosSeccion.tipo.replied_to;
        barraReplicas.style.width = `${(valor * pasoX) | 0}px`;
        valorReplicas.innerText = `${porcentaje(valorTotal, valor)}%`;
      }
    }
  });
};
