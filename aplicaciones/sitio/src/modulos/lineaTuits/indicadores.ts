import { axisBottom, scaleLinear, scaleTime } from 'd3';
import type { BaseType, Selection, ZoomTransform } from 'd3';
import { duracion } from '../constantes';

type SeleccionD3 = Selection<SVGGElement, unknown, HTMLElement, any>;
type Indicadores = { x?: SeleccionD3; y?: SeleccionD3 };

export const indicadores: Indicadores = {};
export const ejeX = scaleTime();
export const ejeY = scaleLinear();

export function iniciarIndicadores(svg: Selection<BaseType, unknown, HTMLElement, any>) {
  indicadores.x = svg.append('g').attr('class', 'eje').attr('id', 'ejeX');
  indicadores.y = svg.append('g').attr('class', 'eje').attr('id', 'ejeY');
}

export const escalarEjeX = (transformacion: ZoomTransform) => {
  if (!indicadores.x) return;

  indicadores.x
    .transition()
    .duration(duracion)
    .call(axisBottom(transformacion.rescaleX(ejeX)).ticks(24));
};

export const actualizarEjeX = (inicio: Date, fin: Date) => {
  ejeX.domain([inicio, fin]);
};

export const actualizarEjeY = (max: number) => {
  ejeY.domain([0, max]);
};
