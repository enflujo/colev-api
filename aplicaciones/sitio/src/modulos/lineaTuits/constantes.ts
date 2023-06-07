export const servidorUrl = import.meta.env.PROD ? '/tally' : 'http://localhost:8080/tally';
export const zona = 'America/Bogota';
export const duracion = 250;
export const margen = { arriba: 140, der: 60, abajo: 50, izq: 30 };

export function color(tipo: string, opacidad: number): string {
  const colores: { [color: string]: string } = {
    todos: `rgba(62, 220, 255, ${opacidad})`, // azul
    quoted: `rgba(255, 217, 114, ${opacidad})`, // amarillo
    replied_to: `rgba(240, 209, 208, ${opacidad})`, // azul
    original: `rgba(15, 239, 183, ${opacidad})`, // verde
  };

  return colores[tipo];
}
