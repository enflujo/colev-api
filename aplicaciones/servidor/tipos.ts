/**
 * Datos del api
 */

interface LlavesFechaBase {
  año: number;
  mes: number;
  dia: number;
}

export type LlavesCasosPorDia = [
  /** Fecha de Notificación */
  fecha: string,
  /** Total muertos */
  muertos: string,
  /** Total de casos */
  total: string
];

export type LlavesTuitsPorDia = [
  /** Fecha */
  fecha: string,
  /** Total de tuits */
  total: number
];

export type LlavesTuitsPorHora = [
  /** Fecha */
  año: number,
  mes: number,
  dia: number,
  hora: number,
  tipo: string
];

export type LlavesTuitsPorSemana = [
  /** Fecha */
  año: number,
  mes: number,
  semana: number
];

export type CasosPorDia = [
  /** Fecha de notificación */
  fecha: Date,
  /** Total muertos */
  muertos: number,
  /** Total de casos */
  total: number
];

export type RespuestaCasosPorDia = {
  _id: Date;
  muertos: number;
  total: number;
};

export type RespuestaTuitsPorDia = {
  _id: LlavesTuitsPorDia;
  fecha: Date;
  total: number;
};

export type RespuestaTuitsPorHora = {
  _id: LlavesTuitsPorHora;
  hora: number;
  fecha: Date;
  total: number;
};

export type RespuestaTuitsPorSemana = {
  _id: LlavesTuitsPorSemana;
  semana: number;
  fecha: Date;
  total: number;
};

export type RespuestaTuitsContexto = {
  _id: { id: string | null; name?: string; description?: string };
  total: number;
};

export type TuitsPorDia = [dia: string, total: number];
export type TuitsPorHora = [dia: string, hora: number, total: number];
export type TuitsPorSemana = [dia: string, semana: number, total: number];
export type DatoTuitTipos = [fecha: string, dia: number, total: number, tuits: TiposTuits];
export type TiposTuits = { [llave: string]: number };

export type TuitsContexto = [nombre: string, cantidad: number];
