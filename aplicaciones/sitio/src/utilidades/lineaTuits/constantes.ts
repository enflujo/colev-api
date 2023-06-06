export const servidorUrl = 'http://localhost:8080/tally';
export const zona = 'America/Bogota';
export const duracion = 250;

export function color(tipo: string, opacidad: number): string {
  const colores: { [color: string]: string } = {
    todos: `rgba(62, 255, 207, ${opacidad})`, // verde
    quoted: `rgba(255, 217, 114, ${opacidad})`, // amarillo
    replied_to: `rgba(137, 209, 248, ${opacidad})`, // azul
    original: `rgba(62, 255, 207, ${opacidad})`, // verde
  };

  return colores[tipo];
}
