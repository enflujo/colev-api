const cargador = document.getElementById('cargador') as HTMLDivElement;

export function esconderCargador() {
  cargador.classList.remove('activo');
}

export function mostrarCargador() {
  cargador.classList.add('activo');
}
