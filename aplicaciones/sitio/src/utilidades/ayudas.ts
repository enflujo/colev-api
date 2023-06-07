export const fechasIgualesAHora = (fecha1: Date, fecha2: Date) => {
  const a1 = fecha1.getFullYear();
  const a2 = fecha2.getFullYear();
  const m1 = fecha1.getMonth();
  const m2 = fecha2.getMonth();
  const d1 = fecha1.getDate();
  const d2 = fecha2.getDate();
  const h1 = fecha1.getHours();
  const h2 = fecha2.getHours();
  return a1 === a2 && m1 === m2 && d1 === d2 && h1 === h2;
};
