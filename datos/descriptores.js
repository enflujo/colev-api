const descriptores = {
  _creditos: {
    fuente: 'Las descripciones según: https://dev.socrata.com/foundry/www.datos.gov.co/gt2j-8ykr',
    fecha: 'Información extraída manualmente: Junio 28, 2021',
  },
  fecha_reporte_web: {
    tipo: 'string',
    descripcion: 'Fecha de publicación en sitio web',
  },
  id_de_caso: {
    tipo: 'number',
    descripcion: 'ID de caso',
  },
  fecha_de_notificaci_n: {
    tipo: 'string',
    descripcion: 'Fecha de notificación a SIVIGILA',
  },
  departamento: {
    tipo: 'number',
    descripcion: 'Código DIVIPOLA departamento',
  },
  departamento_nom: {
    tipo: 'string',
    descripcion:
      'Por seguridad de las personas, algunos datos serán limitados evitando así la exposición y posible identificación en determinados municipios.',
  },
  ciudad_municipio: {
    tipo: 'number',
    descripcion: 'Código DIVIPOLA municipio',
  },
  ciudad_municipio_nom: {
    tipo: 'string',
    descripcion:
      'Por seguridad de las personas, algunos datos serán limitados evitando así la exposición y posible identificación en determinados municipios.',
  },
  edad: {
    tipo: 'number',
    descripcion: 'Edad',
  },
  unidad_medida: {
    tipo: 'number',
    relacion: {
      1: 'Años',
      2: 'Meses',
      3: 'Días',
    },
    descripcion: '1-Años 2-Meses 3-Días',
  },
  sexo: {
    tipo: 'string',
    descripcion: 'Sexo',
  },
  fuente_tipo_contagio: {
    tipo: 'string',
    relacion: {
      Relacionado: '',
      Importado: '',
      'En estudio': '',
      Comunitaria: '',
    },
    descripcion: 'Relacionado Importado En estudio Comunitario',
    _nota: "¿definiciones?. En los datos no es 'Comunitario' sino 'Comunitaria'",
  },
  ubicacion: {
    tipo: 'string',
    descripcion:
      'Corresponde a muertes no relacionadas con COVID-19, aún si eran casos activos **Hay pacientes recuperados para COVID-19, que pueden permanecer en hospitalización por otras comorbilidades',
    _nota: 'esta descripción no tiene mucho sentido.',
  },
  estado: {
    tipo: 'string',
    descripcion:
      'Por seguridad de las personas, algunos datos serán limitados evitando así la exposición y posible identificación en determinados municipios.',
    _nota:
      'Esta descripción no tiene mucho sentido, sería útil saber la forma como se tipifica el estado y sus definiciones',
  },
  pais_viajo_1_cod: {
    tipo: 'number',
    descripcion: 'Código ISO del país',
  },
  pais_viajo_1_nom: {
    tipo: 'string',
    descripcion: 'Nombre del país',
  },
  recuperado: {
    tipo: 'string',
    descripcion:
      'Recuperado Fallecido N/A (Vacío). N/A se refiere a los fallecidos no COVID. Pueden haber casos recuperados con ubicación Hospital u Hospital UCI, ya que permanecen en hospitalización por causas diferentes. Los casos con información en blanco en esta columna corresponde a los casos activos',
  },
  fecha_inicio_sintomas: {
    tipo: 'string',
    descripcion: 'Fecha de inicio de síntomas',
  },
  fecha_diagnostico: {
    tipo: 'string',
    descripcion: 'Fecha de confirmación por laboratorio',
  },
  fecha_recuperado: {
    tipo: 'string',
    descripcion: 'Fecha de recuperación',
  },
  tipo_recuperacion: {
    tipo: 'string',
    relacion: {
      PCR: 'La persona se encuentra recuperada por segunda muestra, en donde dio negativo para el virus',
      tiempo:
        'Cumplió 30 días posteriores al inicio de síntomas o toma de muestras que no tienen síntomas, que no tengan más de 70 años ni que esté hospitalizado.',
    },
    descripcion:
      'Se refiere a la variable de tipo de recuperación que tiene dos opciones: PCR y tiempo. PCR indica que la persona se encuentra recuperada por segunda muestra, en donde dio negativo para el virus; mientras que tiempo significa que son personas que cumplieron 30 días posteriores al inicio de síntomas o toma de muestras que no tienen síntomas, que no tengan más de 70 años ni que estén hospitalizados.',
  },
  per_etn_: {
    tipo: 'number',
    relacion: {
      1: 'Indígena',
      2: 'ROM',
      3: 'Raizal',
      4: 'Palenquero',
      5: 'Negro',
      6: 'Otro',
    },
    descripcion:
      '1-Indígena 2-ROM 3-Raizal 4-Palenquero 5-Negro 6-Otro. Esta variable se actualizará cada semana. ADVERTENCIA DE RESPONSABILIDAD: La variable etnia depende totalmente de tres cosas: - El correcto diligenciamiento de la variable Etnia por los profesionales de salud que notifican en más de 10.000 instituciones de salud en todos los municipios y departamentos. - Del autorreconocimiento de la persona cuando se le pregunta por esta variable. - Del listado censal que haga y mantenga actualizado cada departamento. No depende del Instituto Nacional de Salud, y por lo tanto, es responsabilidad de las autoridades de cada municipio, departamento y distrito de Colombia; la calidad y consistencia de dicha variable',
  },
};
const llaves = Object.keys(descriptores);

const _llavesSoda = {};

llaves.forEach((llave) => {
  if (llave !== '_creditos') {
    _llavesSoda[llave] = llave;
  }
});

export const llavesSoda = _llavesSoda;

export const llavesIns = {
  fecha_reporte_web: 'fecha_hoy_casos',
  id_de_caso: 'Caso',
  fecha_de_notificaci_n: 'Fecha Not',
  departamento: 'Departamento',
  departamento_nom: 'Departamento_nom',
  ciudad_municipio: 'Ciudad_municipio',
  ciudad_municipio_nom: 'Ciudad_municipio_nom',
  edad: 'Edad',
  unidad_medida: '', // TODO
  sexo: 'Sexo',
  fuente_tipo_contagio: '', // TODO
  ubicacion: '', // TODO
  estado: '', // TODO
  pais_viajo_1_cod: 'Pais_viajo_1_cod',
  pais_viajo_1_nom: 'Pais_viajo_1_nom',
  recuperado: 'Recuperado',
  fecha_inicio_sintomas: 'Fecha_inicio_sintomas',
  fecha_diagnostico: 'Fecha_diagnostico',
  fecha_recuperado: '', // TODO
  tipo_recuperacion: 'Tipo_recuperacion',
  per_etn_: '', // TODO
};
