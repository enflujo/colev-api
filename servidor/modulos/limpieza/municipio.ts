import errata from '../errata';
import { CasoSoda, LlavesCaso, Municipio } from '../../tipos';
import { esIgual, esNumero, existeEn, igualAprox, normalizarTexto } from '../../utilidades/ayudas';
import { municipios } from '../../utilidades/lugaresColombia';

const muns = municipios.datos;

function validarSinCodigoConNombre(nombreNormalizado: string, codigo: string): Municipio | undefined {
  const existePorNombre = muns.find((d: Municipio) => normalizarTexto(d[1]) === nombreNormalizado);

  if (existePorNombre) {
    errata.municipios.add(`${codigo}->${existePorNombre[3]} (${existePorNombre[1]})`);
    return existePorNombre;
  }
  return;
}

export default (caso: CasoSoda, llaves: LlavesCaso) => {
  const llaveId = llaves.id;
  let codigo = caso[llaves.mun] as string;
  let nombre = caso[llaves.munNom] as string;
  codigo = codigo ? codigo.trim() : '';
  nombre = nombre ? nombre.trim() : '';

  // Si ambos campos existen, validar usando ambos valores
  if (codigo && nombre) {
    const nombreNormalizado = normalizarTexto(nombre);

    // Validar que el código del municipio es numérico
    if (esNumero(codigo)) {
      // Buscar en los datos de referencia usando el código completo de 5 números.
      const arrMun = muns.find((mun: Municipio) => +mun[3] === +codigo);

      if (arrMun) {
        const nombreNormalizado2 = normalizarTexto(arrMun[1]);

        // Si el nombre es idéntico al que se encontró con el código
        if (esIgual(nombreNormalizado, nombreNormalizado2)) return arrMun;

        // Si el nombre de referencia es parte del nombre en el caso
        if (existeEn(nombreNormalizado2, nombreNormalizado)) {
          errata.municipios.add(`${nombre}->${arrMun[1]}`);
          return arrMun;
        }

        // Si el nombre en el caso es parte del nombre de referencia
        if (existeEn(nombreNormalizado, nombreNormalizado2)) {
          errata.municipios.add(`${nombre}->${arrMun[1]}`);
          return arrMun;
        }

        // Usar fuzz para ver si se parecen al menos en un 50%
        if (igualAprox(nombreNormalizado, nombreNormalizado2)) {
          errata.municipios.add(`${nombre}->${arrMun[1]}`);
          return arrMun;
        }

        /**
         * Algunos casos que se corrigen manualmente.
         */
        if (nombreNormalizado === 'mompos' && nombreNormalizado2 === 'santa cruz de mompox') {
          errata.municipios.add(`${nombre}->${arrMun[1]}`);
          return arrMun;
        }

        if (nombreNormalizado === 'darien' && caso[llaves.dep] === arrMun[2] && nombreNormalizado2 === 'calima') {
          errata.municipios.add(`${nombre}->${arrMun[1]}`);
          return arrMun;
        }

        // No pasó ninguna prueba, registrar el problema en errata.
        errata.municipios.add(
          `En el caso ${caso[llaveId]} no hay manera de encontrar el municipio: ${nombre} con código: ${codigo}`
        );
        return;
      } else {
        /**
         * El código no coincide con los municipios en los datos de referencia.
         */

        // El código no se pudo usar para validar, intentar con el nombre
        const mun = validarSinCodigoConNombre(nombreNormalizado, codigo);
        if (mun) return mun;

        // En este punto el código existe, es numérico, pero no se puede validar.
        errata.municipios.add(
          `No se pudo validar el municipio en caso ${caso[llaveId]} con código: ${codigo} y nombre: ${nombre}`
        );
        return;
      }
    } else {
      /**
       * El código no es numérico pero el campo de nombre existe
       */

      const mun = validarSinCodigoConNombre(nombreNormalizado, codigo);
      if (mun) return mun;

      errata.departamentos.add(
        `No se pudo validar el municipio en caso ${caso[llaveId]}, el código no es numérico: ${codigo} y nombre: ${nombre}`
      );
      return;
    }
  } else if (codigo) {
    /**
     * El caso tiene código pero no tiene nombre
     */

    if (esNumero(codigo)) {
      const arrMun = muns.find((mun: Municipio) => +mun[3] === +codigo);

      if (arrMun) {
        errata.municipios.add(`null->${arrMun[1]}`);
        return arrMun;
      }

      errata.departamentos.add(
        `No se pudo validar el municipio en caso ${caso[llaveId]} con código: ${codigo} y sin nombre`
      );
      return;
    }
  } else if (nombre) {
    /**
     * El caso tiene nombre pero no tiene código
     */
    const mun = validarSinCodigoConNombre(normalizarTexto(nombre), codigo);
    if (mun) return mun;
  }

  /**
   * No tiene ninguno de los campos.
   */
  errata.municipios.add(`Caso ${caso[llaveId]} no tiene campos para validar municipio.`);
  return;
};
