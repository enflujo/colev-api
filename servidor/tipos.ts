export type ProgressPayload = {
  pagina: number;
  totalPaginas: number;
  terminado: boolean;
};

export type Caso = {
  _id: number;
  fechaReporte?: Date;
  fechaNot?: Date;
  dep?: string;
  mun?: string;
  edad?: number;
  sexo?: string;
  fuenteContagio?: string;
  pais?: number;
  recuperado?: string;
  fechaSintomas?: Date;
  fechaMuerte?: Date;
  fechaDiag?: Date;
  fechaRecuperado?: Date;
  recuperacion?: string;
  perEtnica?: number;
  nomGrupo?: string;
};

export type LlavesCaso = {
  id: keyof CasoSoda;
  fechaReporte: keyof CasoSoda;
  fechaNotificacion: keyof CasoSoda;
  dep: keyof CasoSoda;
  depNom: keyof CasoSoda;
  mun: keyof CasoSoda;
  munNom: keyof CasoSoda;
  edad: keyof CasoSoda;
  unidadMedida: keyof CasoSoda;
  sexo: keyof CasoSoda;
  fuenteContagio: keyof CasoSoda;
  ubicacion: keyof CasoSoda;
  estado: keyof CasoSoda;
  pais: keyof CasoSoda;
  paisNom: keyof CasoSoda;
  recuperado: keyof CasoSoda;
  fechaSintomas: keyof CasoSoda;
  fechaMuerte: keyof CasoSoda;
  fechaDiag: keyof CasoSoda;
  fechaRecuperado: keyof CasoSoda;
  tipoRecuperacion: keyof CasoSoda;
  perEtn: keyof CasoSoda;
  nomGrupo: keyof CasoSoda;
};

/**
 * Fuente: Las descripciones según: https://dev.socrata.com/foundry/www.datos.gov.co/gt2j-8ykr
 *
 * Información extraída manualmente: Junio 28, 2021
 */
export type CasoSoda = {
  /** Fecha de publicación en sitio web */
  fecha_reporte_web: string;
  /** ID de caso */
  id_de_caso: string;
  /** Fecha de notificación a SIVIGILA */
  fecha_de_notificaci_n: string;
  /** Código DIVIPOLA departamento */
  departamento: string;
  /** Nombre departamento */
  departamento_nom: string;
  /** Código DIVIPOLA municipio */
  ciudad_municipio: number;
  /** Nombre municipio: Por seguridad de las personas, algunos datos serán limitados evitando así la exposición y posible identificación en determinados municipios. */
  ciudad_municipio_nom: string;
  /** Edad */
  edad: string;
  /** 1-Años 2-Meses 3-Días */
  unidad_medida: string;
  /** Sexo */
  sexo: string;
  /** Tipo de contagio: "Relacionado", "Importado" o "En estudio Comunitario" - En los datos no es 'Comunitario' sino 'Comunitaria' */
  fuente_tipo_contagio: string;
  /** Ubicación del caso:  */
  ubicacion: string;
  /** Estado:  */
  estado: string;
  /** Código ISO del país */
  pais_viajo_1_cod: string;
  /** Nombre del país */
  pais_viajo_1_nom: string;
  /**
   * "Recuperado", "Fallecido", "N/A" o (Vacío).
   * N/A se refiere a los fallecidos no COVID.
   * Pueden haber casos recuperados con ubicación Hospital u Hospital UCI, ya que permanecen en hospitalización por causas diferentes.
   * Los casos con información en blanco en esta columna corresponde a los casos activos.
   */
  recuperado: string;
  /** Fecha de inicio de síntomas */
  fecha_inicio_sintomas: string;
  /** Fecha de muerte */
  fecha_muerte: string;
  /** Fecha de diagnostico: Fecha de confirmación por laboratorio */
  fecha_diagnostico: string;
  /** Fecha de recuperación */
  fecha_recuperado: string;
  /**
   * Tipo de recuperación
   *
   * Se refiere a la variable de tipo de recuperación que tiene dos opciones: "PCR" y "tiempo".
   * PCR indica que la persona se encuentra recuperada por segunda muestra, en donde dio negativo para el virus;
   * mientras que tiempo significa que son personas que cumplieron 30 días posteriores al inicio de síntomas o toma de muestras que no tienen síntomas,
   * que no tengan más de 70 años ni que estén hospitalizados.
   */
  tipo_recuperacion: string;
  /**
   * Pertenencia étnica: 1-Indígena 2-ROM 3-Raizal 4-Palenquero 5-Negro 6-Otro
   *
   * Esta variable se actualizará cada semana.
   *
   * ADVERTENCIA DE RESPONSABILIDAD: La variable etnia depende totalmente de tres cosas:
   *
   * - El correcto diligenciamiento de la variable Etnia por los profesionales de salud que notifican en más de 10.000 instituciones de salud en todos los municipios y departamentos.
   * - Del autorreconocimiento de la persona cuando se le pregunta por esta variable.
   * - Del listado censal que haga y mantenga actualizado cada departamento.
   *
   * No depende del Instituto Nacional de Salud, y por lo tanto, es responsabilidad de las autoridades de cada municipio, departamento y distrito de Colombia; la calidad y consistencia de dicha variable.
   */
  per_etn_: string;
  /**
   * Nombre del grupo étnico
   *
   * ADVERTENCIA DE RESPONSABILIDAD:
   * La variable etnia depende totalmente de tres cosas:
   *
   * - El correcto diligenciamiento de la variable Etnia por los profesionales de salud que notifican en más de 10.000 instituciones de salud en todos los municipios y departamentos.
   * - Del autorreconocimiento de la persona cuando se le pregunta por esta variable.
   * - Del listado censal que haga y mantenga actualizado cada departamento.
   *
   * No depende del Instituto Nacional de Salud, y por lo tanto, es responsabilidad de las autoridades de cada municipio, departamento y distrito de Colombia; la calidad y consistencia de dicha variable
   */
  nom_grupo_: string;
};

export type Departamento = [codigo: string, nombre: string, latitud: number, longitud: number];
export type ObjetoDepartamentos = {
  llaves: string[];
  datos: Departamento[];
};

export type Municipio = [
  /** Código de municipio (sin departamento): ### */
  codigo: string,
  /** Nombre de la ciudad o municipio */
  nombre: string,
  /** Código del departamento al que pertenece la ciudad o municipio: ## */
  codigoDepartamento: string,
  /** Código de la ciudad o municipio (incluyendo su departamento): ##### */
  codigoCompleto: string
];
export type ObjetoMunicipios = {
  llaves: string[];
  datos: Municipio[];
};

/**
 * Usa los datos de este módulo de NPM
 * https://www.npmjs.com/package/world_countries_lists
 */
export type Pais = {
  /** Código ISO 3166 standard */
  id: number;
  /** Código con 2 caracteres */
  alpha2?: string;
  /** Código con 3 caracteres */
  alpha3?: string;
  /** Nombre del país */
  name: string;
};

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
