const filtroDesde = document.getElementById('filtroDesde') as HTMLInputElement;
const filtroHasta = document.getElementById('filtroHasta') as HTMLInputElement;

function fechaATexto(fecha: Date) {
  return fecha.toISOString().slice(0, 16);
}

export const definirMinMaxFechas = (min: Date, max: Date) => {
  filtroDesde.setAttribute('min', fechaATexto(min));
  filtroDesde.setAttribute('max', fechaATexto(max));

  filtroHasta.setAttribute('min', fechaATexto(min));
  filtroHasta.setAttribute('max', fechaATexto(max));
};

export const definirValorDesde = (fecha: Date) => {
  filtroDesde.value = fechaATexto(fecha);
};

export const definirValorHasta = (fecha: Date) => {
  filtroHasta.value = fechaATexto(fecha);
};

export const valorDesde = () => filtroDesde.value;
export const valorHasta = () => filtroHasta.value;
