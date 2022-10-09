import errata from '../errata';
import { CasoFuente, LlavesCaso, Pais } from '../tipos';
import { esIgual, esNumero, existeEn, igualAprox, normalizarTexto } from '../utilidades/ayudas';
import datosPaises from 'world_countries_lists/data/countries/es/world.json';

const produccion = process.env.NODE_ENV === 'produccion';

export default (caso: CasoFuente, llaves: LlavesCaso): Pais | undefined => {
  let codigo = caso[llaves.pais] as string;
  let nombre = caso[llaves.paisNom] as string;

  // Esta variable no siempre esta, así que salimos temprano si está vacía.
  if (!codigo && !nombre) return;
  codigo = codigo ? codigo.trim() : '';
  nombre = nombre ? nombre.trim() : '';

  /**
   * Si el código no existe, sacarlo de los datos de referencia antes de continuar.
   */
  if (!codigo) {
    const paisPorNombre = datosPaises.find((p: Pais) => normalizarTexto(p.name) === normalizarTexto(nombre));

    if (paisPorNombre) {
      if (!produccion) {
        errata.paises.add(`null->${paisPorNombre.id} (${nombre}->${paisPorNombre})`);
      }
      codigo = `${paisPorNombre.id}`;
      nombre = paisPorNombre.name;
    } else if (nombre === 'TABATINGA') {
      nombre = 'Brasil';
      codigo = '76';
      if (!produccion) {
        errata.paises.add(`null->76 (TABATINGA->Brasil)`);
      }
    } else {
      if (!produccion) {
        errata.paises.add(`Caso ${caso[llaves.id]} tiene nombre de país ${nombre} pero no tiene código`);
      }
      return;
    }
  }

  const nombreNormalizado = normalizarTexto(nombre);

  if (codigo && esNumero(codigo)) {
    /**
     * Buscar el país según el código
     */
    const pais = datosPaises.find((p: Pais) => +p.id === +codigo);

    if (pais) {
      const nombreNormalizado2 = normalizarTexto(pais.name);

      if (esIgual(nombreNormalizado, nombreNormalizado2)) return pais;

      if (existeEn(nombreNormalizado2, nombreNormalizado)) {
        if (!produccion) {
          errata.paises.add(`${nombre}->${pais.name}`);
        }
        return pais;
      }

      if (existeEn(nombreNormalizado, nombreNormalizado2)) {
        if (!produccion) {
          errata.paises.add(`${nombre}->${pais.name}`);
        }
        return pais;
      }

      if (igualAprox(nombreNormalizado, nombreNormalizado2)) {
        if (!produccion) {
          errata.paises.add(`${nombre}->${pais.name}`);
        }
        return pais;
      }

      // Si encuentra un ID válido pero no coincide con el nombre, buscar por el nombre.
      const existePorNombre = datosPaises.find((p: Pais) => normalizarTexto(p.name) === nombreNormalizado);

      if (existePorNombre) {
        if (!produccion) {
          errata.paises.add(`${codigo}->${existePorNombre.id} (${existePorNombre.name})`);
        }
        return existePorNombre;
      }

      /**
       * Casos que se arreglan manualmente
       */
      if (+codigo === 654 && nombreNormalizado2 === 'santa elena, ascension y tristan de acuna') {
        if (!produccion) {
          errata.paises.add(`${nombre}->${pais.name}`);
        }
        return pais;
      }

      // No pasó ninguna prueba, registrar el problema en errata.
      if (!produccion) {
        errata.paises.add(
          `En el caso ${caso[llaves.id]} no hay manera de encontrar el país: ${nombre} con código: ${codigo}`
        );
      }
      return;
    } else {
      /**
       * Si no pudo encontrarlo por el código
       */
      const existePorNombre = datosPaises.find((p: Pais) => normalizarTexto(p.name) === nombreNormalizado);

      if (existePorNombre) {
        if (!produccion) {
          errata.paises.add(`${codigo}->${existePorNombre.id} (${existePorNombre.name})`);
        }
        return existePorNombre;
      }

      const existePorNombreAproximado = datosPaises.find((p: Pais) =>
        igualAprox(nombreNormalizado, normalizarTexto(p.name))
      );

      if (existePorNombreAproximado) {
        if (!produccion) {
          errata.paises.add(`${codigo}->${existePorNombreAproximado.id} (${existePorNombreAproximado.name})`);
        }
        return existePorNombreAproximado;
      }

      /**
       * Casos manuales
       */
      if (+codigo === 530 && nombre === 'ANTILLAS NEERLANDESAS') {
        return { id: 530, name: 'Antillas Neerlandesas' };
      }

      // En este punto el código existe, es numérico, pero no se puede validar.
      if (!produccion) {
        errata.municipios.add(
          `No se pudo validar el país en caso ${caso[llaves.id]} con código: ${codigo} y nombre: ${nombre}`
        );
      }
      return;
    }
  } else {
    /**
     * El código no es numérico
     */

    // A veces ponen el nombre del país en el campo del código.
    if (typeof codigo === 'string') {
      const existePorNombre = datosPaises.find((p: Pais) => normalizarTexto(p.name) === normalizarTexto(codigo));

      if (existePorNombre) {
        if (!produccion) {
          errata.paises.add(`${codigo}->${existePorNombre.id} (${existePorNombre.name})`);
        }
        return existePorNombre;
      }

      if (!produccion) {
        errata.paises.add(
          `Caso ${
            caso[llaves.id]
          } tiene en el campo de código pais: ${codigo} pero no coincide con ningún país reconocible.`
        );
      }
      return;
    }
  }

  if (!produccion) {
    errata.paises.add(`Caso ${caso[llaves.id]} no se pudo validar con código: ${codigo} y nombre: ${nombre}.`);
  }
  return;
};
