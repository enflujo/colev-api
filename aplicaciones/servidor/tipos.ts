export type ProgressPayload = {
  pagina: number;
  totalPaginas: number;
  terminado: boolean;
};

export type CasoLimpio = {
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

export type CasoFuente = {
  [key: string]: string;
};

/**
 * Los nombres de las columnas (variables) en las diferentes fuentes de datos.
 *
 * Fuente: Las descripciones según: https://dev.socrata.com/foundry/www.datos.gov.co/gt2j-8ykr
 * Información extraída manualmente: Junio 28, 2021
 */
export type LlavesCaso = {
  /** ID de caso */
  id: 'id_de_caso' | 'Caso';
  /** Fecha de publicación en sitio web */
  fechaReporte: 'fecha_reporte_web' | 'fecha_hoy_casos';
  /** Fecha de notificación a SIVIGILA */
  fechaNotificacion: 'fecha_de_notificaci_n' | 'Fecha Not';
  /** Código DIVIPOLA departamento */
  dep: 'departamento' | 'Departamento';
  /** Nombre departamento */
  depNom: 'departamento_nom' | 'Departamento_nom';
  /** Código DIVIPOLA municipio */
  mun: 'ciudad_municipio' | 'Ciudad_municipio';
  /** Nombre municipio: Por seguridad de las personas, algunos datos serán limitados evitando así la exposición y posible identificación en determinados municipios. */
  munNom: 'ciudad_municipio_nom' | 'Ciudad_municipio_nom';
  /** Edad */
  edad: 'edad' | 'Edad';
  /** 1-Años 2-Meses 3-Días */
  unidadMedida: 'unidad_medida';
  /** Sexo */
  sexo: 'sexo' | 'Sexo';
  /** Tipo de contagio: "Relacionado", "Importado" o "En estudio Comunitario" - En los datos no es 'Comunitario' sino 'Comunitaria' */
  fuenteContagio: 'fuente_tipo_contagio' | 'Fuente_tipo_contagio';
  /** Ubicación del caso:  */
  ubicacion: 'ubicacion' | 'Ubicacion';
  /** Estado:  */
  estado: 'estado' | 'Estado';
  /** Código ISO del país */
  pais: 'pais_viajo_1_cod' | 'Pais_viajo_1_cod';
  /** Nombre del país */
  paisNom: 'pais_viajo_1_nom' | 'Pais_viajo_1_nom';
  /**
   * "Recuperado", "Fallecido", "N/A" o (Vacío).
   * N/A se refiere a los fallecidos no COVID.
   * Pueden haber casos recuperados con ubicación Hospital u Hospital UCI, ya que permanecen en hospitalización por causas diferentes.
   * Los casos con información en blanco en esta columna corresponde a los casos activos.
   */
  recuperado: 'recuperado' | 'Recuperado';
  /** Fecha de inicio de síntomas */
  fechaSintomas: 'fecha_inicio_sintomas' | 'Fecha_inicio_sintomas';
  /** Fecha de muerte */
  fechaMuerte: 'fecha_muerte' | 'Fecha_muerte';
  /** Fecha de diagnostico: Fecha de confirmación por laboratorio */
  fechaDiag: 'fecha_diagnostico' | 'Fecha_diagnostico';
  /** Fecha de recuperación */
  fechaRecuperado: 'fecha_recuperado' | 'Fecha_recuperado';
  /**
   * Tipo de recuperación
   *
   * Se refiere a la variable de tipo de recuperación que tiene dos opciones: "PCR" y "tiempo".
   * PCR indica que la persona se encuentra recuperada por segunda muestra, en donde dio negativo para el virus;
   * mientras que tiempo significa que son personas que cumplieron 30 días posteriores al inicio de síntomas o toma de muestras que no tienen síntomas,
   * que no tengan más de 70 años ni que estén hospitalizados.
   */
  tipoRecuperacion: 'tipo_recuperacion' | 'Tipo_recuperacion';
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
  perEtn: 'per_etn_';
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
  nomGrupo: 'nom_grupo_';
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

/**
 * TWITTER
 */

export type TwitterBasicos = {
  _id: String;
  text: String;
  attachments: {
    poll_ids: [String];
    media_keys: [String];
  };
  author_id: String;
  context_annotations: [
    {
      domain: {
        id: String;
        name: String;
        description: String;
      };
      entity: {
        id: String;
        name: String;
        description: String;
      };
    }
  ];
  conversation_id: String;
  created_at: Date;
  entities: {
    annotations: [
      {
        start: Number;
        end: Number;
        probability: Number;
        normalized_text: String;
        type: { type: String };
      }
    ];
    cashtags: [
      {
        start: Number;
        end: Number;
        tag: String;
      }
    ];
    hashtags: [
      {
        start: Number;
        end: Number;
        tag: String;
      }
    ];
    mentions: [
      {
        start: Number;
        end: Number;
        tag: String;
      }
    ];
    urls: [
      {
        start: Number;
        end: Number;
        url: String;
        expanded_url: String;
        display_url: String;
        status: Number;
        title: String;
        description: String;
        unwound_url: String;
      }
    ];
  };
  geo: {
    coordinates: {
      type: { type: String };
      coordinates: [Number, Number];
    };
    place_id: String;
  };
  in_reply_to_user_id: String;
  lang: String;
  non_public_metrics: {
    impression_count: Number;
    url_link_clicks: Number;
    user_profile_clicks: Number;
  };
  organic_metrics: {
    impression_count: Number;
    like_count: Number;
    reply_count: Number;
    retweet_count: Number;
    url_link_clicks: Number;
    user_profile_clicks: Number;
  };
  possibly_sensitive: Boolean;
  promoted_metrics: {
    impression_count: Number;
    like_count: Number;
    reply_count: Number;
    retweet_count: Number;
    url_link_clicks: Number;
    user_profile_clicks: Number;
  };

  public_metrics: {
    like_count: Number;
    quote_count: Number;
    reply_count: Number;
    retweet_count: Number;
  };

  referenced_tweets: [
    {
      type: { type: String };
      id: String;
    }
  ];
  reply_settings: String;
  source: String;
  withheld: {
    copyright: Boolean;
    country_codes: [String];
  };
};
