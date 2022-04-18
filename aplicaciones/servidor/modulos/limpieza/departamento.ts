import errata from '../errata';
import { CasoFuente, Departamento, LlavesCaso, Municipio } from '../../tipos';
import { esIgual, esNumero, existeEn, igualAprox, normalizarTexto } from '../../utilidades/ayudas';
import { departamentos, municipios } from '../../utilidades/lugaresColombia';

const deps = departamentos.datos;

function validarDepPorNombres(nombre: string, nombreNormalizado: string, arrDep: Departamento): boolean {
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

function validarDepSinCodigoConNombre(
  nombre: string,
  nombreNormalizado: string,
  codigo: string
): Departamento | undefined {
  // Cuando no se puede validar el código de departamento, se busca por el nombre en los datos de referencia.
  const existePorNombre = deps.find((d: Departamento) => normalizarTexto(d[1]) === nombreNormalizado);

  if (existePorNombre) {
    errata.departamentos.add(`${codigo}->${existePorNombre[0]} (${existePorNombre[1]})`);
    return existePorNombre;
  }

  // A veces ponen el nombre del municipio en el de departamento.
  const existePorNombreDeMUnicipio = municipios.datos.find(
    (d: Municipio) => normalizarTexto(d[1]) === nombreNormalizado
  );

  if (existePorNombreDeMUnicipio) {
    // Extraer el código del departamento desde los datos de referencia de municipios.
    const codigoDepEnMunicipio = existePorNombreDeMUnicipio[2];
    // Buscar los datos del departamento con el nuevo código.
    const dep = deps.find((d: Departamento) => d[0] === codigoDepEnMunicipio);

    if (dep) {
      errata.departamentos.add(`${codigo}->${codigoDepEnMunicipio} (${nombre}->${dep[1]})`);
      return dep;
    }
    return;
  }

  return;
}

export default (caso: CasoFuente, llaves: LlavesCaso): Departamento | undefined => {
  const llaveCodigo = llaves.dep;
  const llaveNombre = llaves.depNom;
  const llaveId = llaves.id;
  let codigo = caso[llaveCodigo] as string;
  let nombre = caso[llaveNombre] as string;
  codigo = codigo ? codigo.trim() : '';
  nombre = nombre ? nombre.trim() : '';

  // Si ambos campos existen se puede validar comparándolos.
  if (codigo && nombre) {
    const nombreNormalizado = normalizarTexto(nombre);

    // Si el código es número
    if (esNumero(codigo)) {
      // Usar el código para buscar el departamento en datos de referencia.
      const arrDep = deps.find((dep: Departamento) => +dep[0] === +codigo);

      /**
       * El código del departamento existe en datos de referencia
       */
      if (arrDep) {
        const esValido = validarDepPorNombres(nombre, nombreNormalizado, arrDep);
        if (esValido) return arrDep;

        // No pasó ninguna prueba, registrar el problema en errata.
        errata.departamentos.add(
          `En el caso ${caso[llaveId]} no hay manera de encontrar el departamento: ${nombre} con código: ${codigo}`
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
          const dep = deps.find((d: Departamento) => d[0] === posibleCodigo);

          if (dep && dep.length) {
            errata.departamentos.add(`${codigo}->${posibleCodigo} (${nombre}->${dep[1]})`);
            return dep;
          }

          errata.departamentos.add(
            `Caso ${caso[llaveId]} tiene código de departamento ${codigo} que parece de municipio, pero ${posibleCodigo} no coincide con ningún departamento`
          );
          return;
        }

        // El código no se pudo usar para validar, intentar con el nombre
        const depCorregido = validarDepSinCodigoConNombre(nombre, nombreNormalizado, codigo);

        if (depCorregido) return depCorregido;

        // En este punto el código existe, es numérico, pero no se puede validar.
        errata.departamentos.add(
          `No se pudo validar el departamento en caso ${caso[llaveId]} con código: ${codigo} y nombre: ${nombre}`
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
        `No se pudo validar el departamento en caso ${caso[llaveId]}, el código no es numérico: ${codigo} y nombre: ${nombre}`
      );
      return;
    }
  } else if (codigo) {
    /**
     * El caso tiene código pero no tiene nombre
     */
    if (esNumero(codigo)) {
      const arrDep = deps.find((dep: Departamento) => +dep[0] === +codigo);

      if (arrDep) {
        errata.departamentos.add(`null->${arrDep[1]}`);
        return arrDep;
      }

      // Si tiene código de municipio, volver a intentar pero sin validar nombre ya que no existe
      if (codigo.length === 5) {
        const posibleCodigo = codigo.substring(0, 2);
        const dep = deps.find((d: Departamento) => d[0] === posibleCodigo);

        if (dep) {
          errata.departamentos.add(`null->${dep[1]}`);
          return dep;
        }

        errata.departamentos.add(
          `Caso ${caso[llaveId]} tiene código de departamento ${codigo} que parece de municipio, pero ${posibleCodigo} no coincide con ningún departamento`
        );
        return;
      }

      errata.departamentos.add(
        `No se pudo validar el departamento en caso ${caso[llaveId]} con código: ${codigo} y sin nombre`
      );
      return;
    }
  } else if (nombre) {
    /**
     * El caso tiene nombre pero no tiene código
     */
    const depCorregido = validarDepSinCodigoConNombre(nombre, normalizarTexto(nombre), codigo) as Departamento;
    if (depCorregido) return depCorregido;

    errata.departamentos.add(
      `No se pudo validar el departamento: ${nombre} en caso ${caso[llaveId]} y no tiene código`
    );
    return;
  }

  /**
   * No tiene ninguno de los campos.
   */
  errata.departamentos.add(`Caso ${caso[llaveId]} no tiene campos para validar departamento.`);
  return;
};
