import errata from '../errata';
import { CasoLimpio, CasoFuente, LlavesCaso } from '../tipos';
import { esNumero, fechaColombia, normalizarTexto } from '../utilidades/ayudas';
import limpiarDepartamento from './departamento';
import limpiarMunicipio from './municipio';
import limpiarPais from './pais';

const produccion = process.env.NODE_ENV === 'produccion';

function limpiarId(caso: CasoFuente, llaves: LlavesCaso): number | undefined {
  const llaveId = llaves.id;
  let id = caso[llaveId] as string;

  if (id) {
    id = id.trim();
    if (esNumero(id)) return +id;
    if (!produccion) {
      errata.id.add(`Caso ${caso[llaveId]} no tiene un id numérico, su valor es: ${id}`);
    }
    return;
  }

  if (!produccion) {
    errata.id.add(`Caso ${caso[llaveId]} no tiene id`);
  }
  return;
}

function limpiarFecha(caso: CasoFuente, llave: keyof CasoFuente, llaves: LlavesCaso): Date | undefined {
  let fecha = caso[llave] as string;

  if (fecha) {
    const fechaValida = fechaColombia(fecha.trim());
    if (fechaValida) return fechaValida;
    if (!produccion) {
      errata.fechas.add(`Caso ${caso[llaves.id]} no tiene ${llave} con fecha válida, contiene: ${fecha}`);
    }
    return;
  }
  return;
}

function limpiarEdad(caso: CasoFuente, llaves: LlavesCaso): number | undefined {
  let edad = caso[llaves.edad] as string;
  let unidadMedida = caso[llaves.unidadMedida] as string;

  if (edad && unidadMedida) {
    edad = edad.trim();
    unidadMedida = unidadMedida.trim();
    if (esNumero(edad) && esNumero(unidadMedida)) {
      switch (+unidadMedida) {
        case 2:
          return +edad / 12;
        case 3:
          return +edad / 365;
        default:
          return +edad;
      }
    } else if (esNumero(edad)) {
      if (!produccion) {
        errata.edad.add(
          `Caso ${caso[llaves.id]} no tiene unidad de medida pero parece que si tiene edad numérica: ${+edad}`
        );
      }
      return +edad;
    } else {
      if (!produccion) {
        errata.edad.add(`Caso ${caso[llaves.id]} tiene en edad: ${edad} y unidad de medida: ${unidadMedida}`);
      }
    }
  } else if (edad) {
    if (esNumero(edad)) {
      if (!produccion) {
        errata.edad.add(`Caso ${caso[llaves.id]} no tiene unidad de medida pero si tiene edad numérica: ${edad}`);
      }
      return +caso[llaves.edad];
    } else {
      if (!produccion) {
        errata.edad.add(`Caso ${caso[llaves.id]} no tiene unidad de medida y el campo de edad no es numérico: ${edad}`);
      }
      return;
    }
  }

  if (!produccion) {
    errata.edad.add(`Caso ${caso[llaves.id]} no tiene los campos de edad ni unidad de medida`);
  }
  return;
}

function limpiarRecuperado(caso: CasoFuente, llaves: LlavesCaso): string | undefined {
  let recuperado = caso[llaves.recuperado] as string;

  if (recuperado) {
    recuperado = normalizarTexto(recuperado.trim());

    if (recuperado === 'recuperado') return 'recuperado';
    else if (recuperado === 'fallecido') return 'fallecido';
    else if (recuperado === 'activo') return 'activo';
    else if (recuperado === 'n/a' || recuperado === '') {
      return;
    }

    if (!produccion) {
      errata.recuperado.add(`Caso ${caso[llaves.id]} contiene un valor que no se puede validar: ${recuperado}`);
    }
    return;
  }
  if (!produccion) {
    errata.recuperado.add(`Caso ${caso[llaves.id]} no tiene campo de recuperado`);
  }
  return;
}

function limpiarRecuperacion(caso: CasoFuente, llaves: LlavesCaso) {
  let tipo = caso[llaves.tipoRecuperacion] as string;

  if (tipo) {
    tipo = tipo.trim();
    const nombreNormalizado = normalizarTexto(tipo);

    if (nombreNormalizado === 'pcr') return 'PCR';
    else if (nombreNormalizado === 'tiempo') return 'tiempo';

    if (!produccion) {
      errata.recuperacion.add(`Caso ${caso[llaves.id]} no tiene tipo de recuperación tiempo o PCR sino: ${tipo}`);
    }
    return;
  }

  return;
}

function limpiarSexo(caso: CasoFuente, llaves: LlavesCaso): string | undefined {
  let sexo = caso[llaves.sexo] as string;

  if (sexo) {
    sexo = sexo.trim();
    const nombreNormalizado = normalizarTexto(sexo);

    if (nombreNormalizado === 'f') return 'F';
    else if (nombreNormalizado === 'm') return 'M';

    if (!produccion) {
      errata.sexo.add(`Caso ${caso[llaves.id]} no se pudo validar con tipo: ${sexo}`);
    }
  }

  return;
}

function limpiarPerEtnica(caso: CasoFuente, llaves: LlavesCaso): number | undefined {
  let codigo = caso[llaves.perEtn] as string;

  if (codigo) {
    codigo = codigo.trim();
    if (esNumero(codigo)) return +codigo;

    if (!produccion) {
      errata.perEtnica.add(`Caso ${caso[llaves.id]} no tiene código numérico, su valor es: ${codigo}`);
    }
  }

  return;
}

function limpiarFuenteContagio(caso: CasoFuente, llaves: LlavesCaso): string | undefined {
  let fuente = caso[llaves.fuenteContagio] as string;
  if (fuente) {
    fuente = fuente.trim();
    const nombreNormalizado = normalizarTexto(fuente);

    if (nombreNormalizado === 'relacionado') return 'relacionado';
    else if (nombreNormalizado === 'importado') return 'importado';
    else if (nombreNormalizado === 'comunitaria') return 'comunitaria';
    else if (nombreNormalizado === 'en estudio') return 'en estudio';

    if (!produccion) {
      errata.fuenteContagio.add(`Caso ${caso[llaves.id]} no se puede validar con: ${fuente}`);
    }
  }

  return;
}

function limpiarNombreGrupo(caso: CasoFuente, llaves: LlavesCaso): string | undefined {
  let nombre = caso[llaves.nomGrupo] as string;

  if (nombre) {
    nombre = nombre.trim();

    if (typeof nombre === 'string') return nombre;
  }

  return;
}

export default (caso: CasoFuente, llaves: LlavesCaso): CasoLimpio | undefined => {
  const id = limpiarId(caso, llaves);

  if (id) {
    const res: CasoLimpio = {
      _id: id,
    };

    const fechaReporte = limpiarFecha(caso, llaves.fechaReporte, llaves);
    if (fechaReporte) res.fechaReporte = fechaReporte;

    const fechaSintomas = limpiarFecha(caso, llaves.fechaSintomas, llaves);
    if (fechaSintomas) res.fechaSintomas = fechaSintomas;

    const fechaNotificacion = limpiarFecha(caso, llaves.fechaNotificacion, llaves);
    if (fechaNotificacion) res.fechaNot = fechaNotificacion;

    const fechaDiagnostico = limpiarFecha(caso, llaves.fechaDiag, llaves);
    if (fechaDiagnostico) res.fechaDiag = fechaDiagnostico;

    const fechaMuerte = limpiarFecha(caso, llaves.fechaMuerte, llaves);
    if (fechaMuerte) res.fechaMuerte = fechaMuerte;

    const fechaRecuperado = limpiarFecha(caso, llaves.fechaRecuperado, llaves);
    if (fechaRecuperado) res.fechaRecuperado = fechaRecuperado;

    const departamento = limpiarDepartamento(caso, llaves);
    if (departamento) res.dep = departamento[0];

    const municipio = limpiarMunicipio(caso, llaves);
    if (municipio) res.mun = municipio[3];

    const pais = limpiarPais(caso, llaves);
    if (pais) res.pais = pais.id;

    const edad = limpiarEdad(caso, llaves);
    if (edad) res.edad = edad;

    const recuperado = limpiarRecuperado(caso, llaves);
    if (recuperado) res.recuperado = recuperado;

    const recuperacion = limpiarRecuperacion(caso, llaves);
    if (recuperacion) res.recuperacion = recuperacion;

    const sexo = limpiarSexo(caso, llaves);
    if (sexo) res.sexo = sexo;

    const perEtnica = limpiarPerEtnica(caso, llaves);
    if (perEtnica) res.perEtnica = perEtnica;

    const fuenteContagio = limpiarFuenteContagio(caso, llaves);
    if (fuenteContagio) res.fuenteContagio = fuenteContagio;

    const nombreGrupo = limpiarNombreGrupo(caso, llaves);
    if (nombreGrupo) res.nomGrupo = nombreGrupo;

    return res;
  }

  return;
};
