import type { TuitsDatos, TuitsPorHora } from '../../tipos';

export function procesarDatos(datos: TuitsDatos[]) {
  const conTipo = datos[0].length === 4;

  return datos.map((d): TuitsPorHora => {
    const fecha = new Date(d[0]);

    if (!conTipo) {
      return { fecha, dia: d[1], valor: d[2] };
    } else {
      return { fecha, dia: d[1], valor: d[2], tipo: d[3] };
    }
  });
}
