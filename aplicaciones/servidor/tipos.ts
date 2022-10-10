/**
 * Datos del api
 */

export type LlavesCasosPorDia = [
  /** Fecha de Notificación */
  fecha: string,
  /** Total muertos */
  muertos: string,
  /** Total de casos */
  total: string
];

export type CasoPorDia = [
  /** Fecha de notificación */
  fecha: Date,
  /** Total muertos */
  muertos: number,
  /** Total de casos */
  total: number
];

export type DatosCasosPorDia = {
  /** El orden de las variables en los casos */
  llaves: LlavesCasosPorDia;
  casos: CasoPorDia[];
};
