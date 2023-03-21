/**
 * Datos del api
 */

interface LlavesFechaBase {
  año: Number;
  mes: Number;
  dia: Number;
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
  fecha: String,
  /** Total de tuits */
  total: Number
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
  año: Number,
  mes: Number,
  semana: Number
];

export type CasosPorDia = [
  /** Fecha de notificación */
  fecha: Date,
  /** Total muertos */
  muertos: Number,
  /** Total de casos */
  total: Number
];

export type RespuestaCasosPorDia = {
  _id: Date;
  muertos: Number;
  total: Number;
};

export type RespuestaTuitsPorDia = {
  _id: LlavesTuitsPorDia;
  fecha: Date;
  total: Number;
};

export type RespuestaTuitsPorHora = {
  _id: LlavesTuitsPorHora;
  hora: Number;
  fecha: Date;
  total: Number;
};

export type RespuestaTuitsPorSemana = {
  _id: LlavesTuitsPorSemana;
  semana: Number;
  fecha: Date;
  total: Number;
};

export type TuitsPorDia = [dia: String, total: Number];
export type TuitsPorHora = [dia: String, hora: Number, total: Number];
export type TuitsPorSemana = [dia: String, semana: Number, total: Number];
