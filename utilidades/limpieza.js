import { ratio } from 'fuzzball';
import { readFile } from 'fs/promises';
import { departamentos, municipios } from '../datos/lugaresColombia.js';
import { error } from './constantes.js';
import { fechaColombia, normalizarTexto } from './ayudas.js';
import { errata } from './errata.js';

const datosPaises = JSON.parse(
  await readFile(new URL('../node_modules/world_countries_lists/data/countries/es/world.json', import.meta.url))
);
const deps = departamentos.datos;

const esIgual = (a, b) => a === b;
const existeEn = (a, b) => a.includes(b);
const igualAprox = (a, b) => ratio(a, b) > 50;

function validarDepPorNombres(nombre, nombreNormalizado, arrDep) {
  const nombreNormalizado2 = normalizarTexto(arrDep[1]);

  // Si los nombres en caso y referencia coinciden exactamente
  if (esIgual(nombreNormalizado, nombreNormalizado2)) return true;

  // Si el nombre de referencia es parte del nombre en caso.
  if (existeEn(nombreNormalizado2, nombreNormalizado)) {
    errata.departamentos.add(`${nombre}->${arrDep[1]}`);
    return true;
  }

  // Usar fuzz para obtener un porcentaje de similitud (útil cuando hay errores tipográficos o de digitación)
  if (igualAprox(nombreNormalizado, nombreNormalizado2)) {
    errata.departamentos.add(`${nombre}->${arrDep[1]}`);
    return true;
  }

  return false;
}

function validarDepSinCodigoConNombre(nombre, nombreNormalizado, codigo) {
  // Cuando no se puede validar el código de departamento, se busca por el nombre en los datos de referencia.
  const existePorNombre = deps.find((d) => normalizarTexto(d[1]) === nombreNormalizado);

  if (existePorNombre) {
    errata.departamentos.add(`${codigo}->${existePorNombre[0]} (${existePorNombre[1]})`);
    return existePorNombre;
  }

  // A veces ponen el nombre del municipio en el de departamento.
  const existePorNombreDeMUnicipio = municipios.datos.find((d) => normalizarTexto(d[1]) === nombreNormalizado);

  if (existePorNombreDeMUnicipio) {
    // Extraer el código del departamento desde los datos de referencia de municipios.
    const codigoDepEnMunicipio = existePorNombreDeMUnicipio[2];
    // Buscar los datos del departamento con el nuevo código.
    const dep = deps.find((d) => d[0] === codigoDepEnMunicipio);

    errata.departamentos.add(`${codigo}->${codigoDepEnMunicipio} (${nombre}->${dep[1]})`);
    return dep;
  }

  return;
}

function limpiarDepartamento(fila, llaves) {
  let codigo = fila[llaves.departamento];
  let nombre = fila[llaves.departamento_nom];

  // Si ambos campos existen se puede validar comparándolos.
  if (codigo && nombre) {
    codigo = codigo.trim();
    nombre = nombre.trim();

    // Si el código es número
    if (!isNaN(codigo)) {
      // Usar el código para buscar el departamento en datos de referencia.
      const arrDep = deps.find((dep) => +dep[0] === +codigo);
      const nombreNormalizado = normalizarTexto(nombre);

      /**
       * El código del departamento existe en datos de referencia
       */
      if (arrDep && arrDep.length) {
        const esValido = validarDepPorNombres(nombre, nombreNormalizado, arrDep);
        if (esValido) return arrDep;

        // No pasó ninguna prueba, registrar el problema en errata.
        errata.departamentos.add(
          `En el caso ${
            fila[llaves.id_de_caso]
          } no hay manera de encontrar el departamento: ${nombre} con código: ${codigo}`
        );
        return;
      } else {
        /**
         * El código no coincide con los departamentos en los datos de referencia.
         */

        // En algunos casos ponen el código de municipio en el de departamento
        if (codigo.length === 5) {
          // Los códigos de municipio contienen el del departamento en los primero 2 números.
          const posibleCodigo = codigo.substring(0, 2);
          // Buscar de nuevo
          const dep = deps.find((d) => d[0] === posibleCodigo);

          if (dep && dep.length) {
            errata.departamentos.add(`${codigo}->${posibleCodigo} (${nombre}->${dep[1]})`);
            return dep;
          }

          errata.departamentos.add(
            `Caso ${
              fila[llaves.id_de_caso]
            } tiene código de departamento ${codigo} que parece de municipio, pero ${posibleCodigo} no coincide con ningún departamento`
          );
          return;
        }

        // El código no se pudo usar para validar, intentar con el nombre
        const depCorregido = validarDepSinCodigoConNombre(nombre, nombreNormalizado, codigo);

        if (depCorregido) return depCorregido;

        // En este punto el código existe, es numérico, pero no se puede validar.
        errata.departamentos.add(
          `No se pudo validar el departamento en caso ${
            fila[llaves.id_de_caso]
          } con código: ${codigo} y nombre: ${nombre}`
        );
        return;
      }
    } else {
      /**
       * El código no es numérico pero el campo de nombre existe
       */

      const depCorregido = validarDepSinCodigoConNombre(nombre, nombreNormalizado, codigo);
      if (depCorregido) return depCorregido;

      errata.departamentos.add(
        `No se pudo validar el departamento en caso ${
          fila[llaves.id_de_caso]
        }, el código no es numérico: ${codigo} y nombre: ${nombre}`
      );
      return;
    }
  } else if (codigo) {
    /**
     * El caso tiene código pero no tiene nombre
     */
    if (!isNaN(codigo)) {
      codigo = codigo.trim();
      const arrDep = deps.find((dep) => +dep[0] === +codigo);

      if (arrDep) {
        errata.departamentos.add(`null->${arrDep[1]}`);
        return arrDep;
      }

      // Si tiene código de municipio, volver a intentar pero sin validar nombre ya que no existe
      if (codigo.length === 5) {
        const posibleCodigo = codigo.substring(0, 2);
        const dep = deps.find((d) => d[0] === posibleCodigo);

        if (dep) {
          errata.departamentos.add(`null->${dep[1]}`);
          return dep;
        }

        errata.departamentos.add(
          `Caso ${
            fila[llaves.id_de_caso]
          } tiene código de departamento ${codigo} que parece de municipio, pero ${posibleCodigo} no coincide con ningún departamento`
        );
      }

      errata.departamentos.add(
        `No se pudo validar el departamento en caso ${fila[llaves.id_de_caso]} con código: ${codigo} y sin nombre`
      );
      return;
    }
  } else if (nombre) {
    /**
     * El caso tiene nombre pero no tiene código
     */
    nombre = nombre.trim();
    const depCorregido = validarDepSinCodigoConNombre(nombre, nombreNormalizado, codigo);
    if (depCorregido) return depCorregido;

    errata.departamentos.add(
      `No se pudo validar el departamento: ${nombre} en caso ${fila[llaves.id_de_caso]} y no tiene código`
    );
    return;
  }

  /**
   * No tiene ninguno de los campos.
   */
  errata.departamentos.add(`Caso ${fila[llaves.id_de_caso]} no tiene campos para validar departamento.`);
  return;
}

function limpiarMunicipio(fila, llaves) {
  const codigo = fila[llaves.ciudad_municipio].trim();
  const nombre = fila[llaves.ciudad_municipio_nom].trim();

  if (!isNaN(codigo)) {
    const arrMun = municipios.datos.find((mun) => +mun[3] === +codigo);

    if (arrMun && arrMun.length) {
      const nombreNormalizado = normalizarTexto(nombre);
      const nombreNormalizado2 = normalizarTexto(arrMun[1]);

      if (esIgual(nombreNormalizado, nombreNormalizado2)) return arrMun;

      if (existeEn(nombreNormalizado2, nombreNormalizado)) {
        errata.municipios.add(`${nombre}->${arrMun[1]}`);
        return arrMun;
      }

      if (existeEn(nombreNormalizado, nombreNormalizado2)) {
        errata.municipios.add(`${nombre}->${arrMun[1]}`);
        return arrMun;
      }

      if (igualAprox(nombreNormalizado, nombreNormalizado2)) {
        errata.municipios.add(`${nombre}->${arrMun[1]}`);
        return arrMun;
      }

      if (nombreNormalizado === 'mompos' && nombreNormalizado2 === 'santa cruz de mompox') {
        errata.municipios.add(`${nombre}->${arrMun[1]}`);
        return arrMun;
      }

      if (
        nombreNormalizado === 'darien' &&
        fila[llaves.departamento] === arrMun[2] &&
        nombreNormalizado2 === 'calima'
      ) {
        errata.municipios.add(`${nombre}->${arrMun[1]}`);
        return arrMun;
      }

      console.log(ratio(nombreNormalizado, nombreNormalizado2), nombreNormalizado, nombreNormalizado2);

      console.log(error(`Nombre del municipio no coincide: ${JSON.stringify(fila, null, 2)}`));
      throw new Error(JSON.stringify(arrMun, null, 2));
    } else {
      console.log(error('El código de municipio no existe'));
      throw new Error(JSON.stringify(fila, null, 2));
    }
  } else {
    console.log(error('El código de municipio no es un número'));
    throw new Error(`No es numero: ${JSON.stringify(fila, null, 2)}`);
  }
}

function limpiarPais(fila, llaves) {
  let codigo = fila[llaves.pais_viajo_1_cod];
  let nombre = fila[llaves.pais_viajo_1_nom];
  // Esta variable no siempre esta, así que salimos temprano si está vacía.
  if (!codigo && !nombre) return;

  if (!codigo) {
    nombre = nombre.trim();

    const paisPorNombre = datosPaises.find((p) => normalizarTexto(p.name) === normalizarTexto(nombre));

    if (paisPorNombre) {
      errata.paises.add(`null->${paisPorNombre.id} (${nombre}->${paisPorNombre})`);
      codigo = paisPorNombre.id;
      nombre = paisPorNombre.name;
    } else if (nombre === 'TABATINGA') {
      nombre = 'Brasil';
      codigo = 76;
      errata.paises.add(`null->76 (TABATINGA->Brasil)`);
    } else {
      errata.paises.add(`Caso ${fila[llaves.id_de_caso]} tiene nombre de país ${nombre} pero no tiene código`);
      return;
    }
  } else {
    codigo = codigo.trim();
  }

  const nombreNormalizado = normalizarTexto(nombre);

  if (codigo && !isNaN(codigo)) {
    const pais = datosPaises.find((p) => +p.id === +codigo);

    if (pais) {
      const nombreNormalizado2 = normalizarTexto(pais.name);

      if (esIgual(nombreNormalizado, nombreNormalizado2)) return pais;

      if (existeEn(nombreNormalizado2, nombreNormalizado)) {
        errata.paises.add(`${nombre}->${pais.name}`);
        return pais;
      }

      if (existeEn(nombreNormalizado, nombreNormalizado2)) {
        errata.paises.add(`${nombre}->${pais.name}`);
        return pais;
      }

      if (igualAprox(nombreNormalizado, nombreNormalizado2)) {
        errata.paises.add(`${nombre}->${pais.name}`);
        return pais;
      }

      const existePorNombre = datosPaises.find((p) => normalizarTexto(p.name) === nombreNormalizado);

      if (existePorNombre) {
        errata.paises.add(`${codigo}->${existePorNombre.id} (${existePorNombre.name})`);
        return existePorNombre;
      }

      if (+codigo === 654 && nombreNormalizado2 === 'santa elena, ascension y tristan de acuna') {
        errata.paises.add(`${nombre}->${pais.name}`);
        return pais;
      }

      console.log(ratio(nombreNormalizado, nombreNormalizado2), nombreNormalizado, nombreNormalizado2);
      console.log(error(`Nombre no coincide: ${JSON.stringify(fila, null, 2)}`));
      throw new Error(JSON.stringify(pais, null, 2));
    } else {
      const existePorNombre = datosPaises.find((p) => normalizarTexto(p.name) === nombreNormalizado);

      if (existePorNombre) {
        errata.paises.add(`${codigo}->${existePorNombre.id} (${existePorNombre.name})`);
        return existePorNombre;
      }

      const existePorNombreAproximado = datosPaises.find((p) => ratio(nombreNormalizado, normalizarTexto(p.name)) > 50);

      if (existePorNombreAproximado) {
        errata.paises.add(`${codigo}->${existePorNombreAproximado.id} (${existePorNombreAproximado.name})`);
        return existePorNombreAproximado;
      }

      if (+codigo === 530 && nombre === 'ANTILLAS NEERLANDESAS') {
        return { id: 530, name: 'Antillas Neerlandesas' };
      }

      console.log(error(`El código del país ${codigo} no existe`));
      throw new Error(JSON.stringify(fila, null, 2));
    }
  } else {
    if (typeof codigo === 'string') {
      const existePorNombre = datosPaises.find((p) => normalizarTexto(p.name) === normalizarTexto(codigo));

      if (existePorNombre) {
        errata.paises.add(`${codigo}->${existePorNombre.id} (${existePorNombre.name})`);
        return existePorNombre;
      }
    }

    console.log(error(`El código "${codigo}" no es numérico y no lo encuentra`));
    throw new Error(JSON.stringify(fila, null, 2));
  }
}

function limpiarFecha(fila, llave, llaves) {
  let fecha = fila[llave];
  if (fecha) {
    const fechaValida = fechaColombia(fecha.trim());

    if (fechaValida) {
      return fechaValida;
    }

    errata.fechas.add(`Caso ${fila[llaves.id_de_caso]} no tiene ${llave} con fecha válida, contiene: ${fecha}`);
    return;
  }

  return;
}

function limpiarEdad(fila, llaves) {
  let edad = fila[llaves.edad];
  let unidadMedida = fila[llaves.unidad_medida];

  if (edad && unidadMedida) {
    edad = edad.trim();
    unidadMedida = unidadMedida.trim();

    if (!isNaN(edad) && !isNaN(unidadMedida)) {
      edad = +edad;
      unidadMedida = +unidadMedida;

      switch (unidadMedida) {
        case 2:
          return edad / 12;
        case 3:
          return edad / 365;
        default:
          return edad;
      }
    } else if (!isNaN(edad)) {
      errata.edad.add(
        `Caso ${fila[llaves.id_de_caso]} no tiene unidad de medida pero parece que si tiene edad numérica: ${+edad}`
      );
      return +edad;
    } else {
      errata.edad.add(`Caso ${fila[llaves.id_de_caso]} tiene en edad: ${edad} y unidad de medida: ${unidadMedida}`);
    }
  } else if (edad) {
    if (!isNaN(edad)) {
      errata.edad.add(`Caso ${fila[llaves.id_de_caso]} no tiene unidad de medida pero si tiene edad numérica: ${edad}`);
      return +fila[llaves.edad];
    } else {
      errata.edad.add(
        `Caso ${fila[llaves.id_de_caso]} no tiene unidad de medida y el campo de edad no es numérico: ${edad}`
      );
      return;
    }
  }

  errata.edad.add(`Caso ${fila[llaves.id_de_caso]} no tiene los campos de edad ni unidad de medida`);
  return;
}

function limpiarRecuperado(fila, llaves) {
  let recuperado = fila[llaves.recuperado];

  if (recuperado) {
    recuperado = normalizarTexto(recuperado.trim());

    if (recuperado === 'recuperado') {
      return 'r';
    } else if (recuperado === 'fallecido') {
      return 'f';
    } else if (recuperado === 'n/a' || recuperado === '') {
      return;
    }
  }

  errata.recuperado.add(`Caso ${fila[llaves.id_de_caso]} no tiene campo de recuperado`);
  return;
}

function limpiarRecuperacion(fila, llaves) {
  let tipo = fila[llaves.tipo_recuperacion];

  if (tipo) {
    tipo = tipo.trim();
    const nombreNormalizado = normalizarTexto(tipo);

    if (nombreNormalizado === 'pcr') return 'PCR';
    else if (nombreNormalizado === 'tiempo') return 'tiempo';

    errata.recuperacion.add(`Caso ${fila[llaves.id_de_caso]} no tiene tipo de recuperación tiempo o PCR sino: ${tipo}`);
    return;
  }

  return;
}

function limpiarSexo(fila, llaves) {
  let sexo = fila[llaves.sexo];

  if (sexo) {
    sexo = sexo.trim();
    const nombreNormalizado = normalizarTexto(sexo);

    if (nombreNormalizado === 'f') return 'f';
    else if (nombreNormalizado === 'm') return 'm';

    errata.sexo.add(`Caso ${fila[llaves.id_de_caso]} no se pudo validar con tipo: ${sexo}`);
  }
}

function limpiarId(fila, llaves) {
  let id = fila[llaves.id_de_caso];

  if (id) {
    id = id.trim();
    if (!isNaN(id)) return +id;

    errata.id.add(`Caso ${fila[llaves.id_de_caso]} no tiene un id numérico, su valor es: ${id}`);
    return;
  }

  errata.id.add(`Caso ${fila[llaves.id_de_caso]} no tiene id`);
  return;
}

function limpiarPerEtnica(fila, llaves) {
  let codigo = fila[llaves.per_etn_];

  if (codigo) {
    codigo = codigo.trim();
    if (!isNaN(codigo)) return +codigo;

    errata.perEtnica.add(`Caso ${fila[llaves.id_de_caso]} no tiene código numérico, su valor es: ${codigo}`);
  }

  return;
}

export const limpieza = (fila, llaves) => {
  const id = limpiarId(fila, llaves);

  if (id) {
    const res = {
      _id: id,
    };

    const fechaReporte = limpiarFecha(fila, llaves.fecha_reporte_web, llaves);
    if (fechaReporte) res.fechaReporte = fechaReporte;

    const fechaInicio = limpiarFecha(fila, llaves.fecha_inicio_sintomas, llaves);
    if (fechaInicio) res.fechaInicio = fechaInicio;

    const fechaNotificacion = limpiarFecha(fila, llaves.fecha_de_notificaci_n, llaves);
    if (fechaNotificacion) res.fechaNot = fechaNotificacion;

    const fechaDiagnostico = limpiarFecha(fila, llaves.fecha_diagnostico, llaves);
    if (fechaDiagnostico) res.fechaDiag = fechaDiagnostico;

    const fechaMuerte = limpiarFecha(fila, llaves.fecha_muerte, llaves);
    if (fechaMuerte) res.fechaMuerte = fechaMuerte;

    const departamento = limpiarDepartamento(fila, llaves);
    if (departamento) res.dep = departamento[0];

    const municipio = limpiarMunicipio(fila, llaves);
    if (municipio) res.mun = municipio[3];

    const pais = limpiarPais(fila, llaves);
    if (pais) res.pais = pais.id;

    const edad = limpiarEdad(fila, llaves);
    if (edad) res.edad = edad;

    const recuperado = limpiarRecuperado(fila, llaves);
    if (recuperado) res.recuperado = recuperado;

    const recuperacion = limpiarRecuperacion(fila, llaves);
    if (recuperacion) res.recuperacion = recuperacion;

    const sexo = limpiarSexo(fila, llaves);
    if (sexo) res.sexo = sexo;

    const perEtnica = limpiarPerEtnica(fila, llaves);
    if (perEtnica) res.perEtnica = perEtnica;

    return res;
  }

  return;
};
