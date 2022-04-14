import { ratio } from 'fuzzball';
import { readFile } from 'fs/promises';
import { departamentos, municipios } from '../datos/departamentos.js';
import { error } from './constantes.js';
import { fechaColombia, normalizarTexto } from './ayudas.js';
import { errata } from './errata.js';

const datosPaises = JSON.parse(
  await readFile(new URL('../node_modules/world_countries_lists/data/countries/es/world.json', import.meta.url))
);

function limpiarDepartamento(fila) {
  const codigo = fila.Departamento.trim();
  const nombre = fila.Departamento_nom.trim();

  if (!isNaN(codigo)) {
    const arrDep = departamentos.datos.find((dep) => dep[0] === codigo);

    if (arrDep && arrDep.length) {
      const nombreNormalizado = normalizarTexto(nombre);
      const nombreNormalizado2 = normalizarTexto(arrDep[1]);

      if (nombreNormalizado === nombreNormalizado2) {
        return arrDep;
      }

      if (nombreNormalizado2.includes(nombreNormalizado)) {
        errata.departamentos.add(`${nombre}->${arrDep[1]}`);
        return arrDep;
      }

      if (nombreNormalizado === 'norte santander' && nombreNormalizado2 === 'norte de santander') {
        errata.departamentos.add(`${nombre}->${arrDep[1]}`);
        return arrDep;
      }

      console.log(error(`Nombre no coincide: ${JSON.stringify(fila, null, 2)} - ${JSON.stringify(arrDep, null, 2)}`));
      throw new Error();
    } else {
      if (codigo.length === 5) {
        const codigoDepartamento = codigo.substring(0, 2);
        const dep = departamentos.datos.find((d) => d[0] === codigoDepartamento);

        if (dep && dep.length) {
          errata.departamentos.add(`${nombre}->${dep[1]}`);
          return dep;
        } else {
          console.log(error('El código del departamento no se puede extraer del código de municipio'));
          throw new Error(JSON.stringify(fila, null, 2));
        }
      }

      console.log(error('Código de departamento no existe'));
      throw new Error(JSON.stringify(fila, null, 2));
    }
  } else {
    console.log(error('El código de del departamento no es un número'));
    throw new Error(JSON.stringify(fila, null, 2));
  }
}

function limpiarMunicipio(fila) {
  const codigo = fila.Ciudad_municipio.trim();
  const nombre = fila.Ciudad_municipio_nom.trim();

  if (!isNaN(codigo)) {
    const arrMun = municipios.datos.find((mun) => mun[3] === codigo);

    if (arrMun && arrMun.length) {
      const nombreNormalizado = normalizarTexto(nombre);
      const nombreNormalizado2 = normalizarTexto(arrMun[1]);

      if (nombreNormalizado === nombreNormalizado2) {
        return arrMun;
      }

      if (nombreNormalizado2.includes(nombreNormalizado)) {
        errata.municipios.add(`${nombre}->${arrMun[1]}`);
        return arrMun;
      }

      if (nombreNormalizado.includes(nombreNormalizado2)) {
        errata.municipios.add(`${nombre}->${arrMun[1]}`);
        return arrMun;
      }

      if (ratio(nombreNormalizado, nombreNormalizado2) > 50) {
        errata.municipios.add(`${nombre}->${arrMun[1]}`);
        return arrMun;
      }

      if (nombreNormalizado === 'mompos' && nombreNormalizado2 === 'santa cruz de mompox') {
        errata.municipios.add(`${nombre}->${arrMun[1]}`);
        return arrMun;
      }

      if (nombreNormalizado === 'darien' && fila.Departamento === arrMun[2] && nombreNormalizado2 === 'calima') {
        errata.municipios.add(`${nombre}->${arrMun[1]}`);
        return arrMun;
      }

      console.log(ratio(nombreNormalizado, nombreNormalizado2), nombreNormalizado, nombreNormalizado2);

      console.log(error(`Nombre no coincide: ${JSON.stringify(fila, null, 2)}`));
      throw new Error(JSON.stringify(arrMun, null, 2));
    } else {
      console.log(error('El código de departamento no existe'));
      throw new Error(JSON.stringify(fila, null, 2));
    }
  } else {
    console.log(error('El código de municipio no es un número'));
    throw new Error(`No es numero: ${JSON.stringify(fila, null, 2)}`);
  }
}

function limpiarPais(fila) {
  const codigo = fila.Pais_viajo_1_cod.trim();
  const nombre = fila.Pais_viajo_1_nom.trim();
  // Esta variable no siempre esta, así que salimos temprano si está vacía.
  if (!codigo && !nombre) return;
  const nombreNormalizado = normalizarTexto(nombre);

  if (codigo && !isNaN(codigo)) {
    const pais = datosPaises.find((p) => p.id === +codigo);

    if (pais) {
      const nombreNormalizado2 = normalizarTexto(pais.name);

      if (nombreNormalizado === nombreNormalizado2) {
        return pais;
      }

      if (nombreNormalizado2.includes(nombreNormalizado)) {
        errata.paises.add(`${nombre}->${pais.name}`);
        return pais;
      }

      if (nombreNormalizado.includes(nombreNormalizado2)) {
        errata.paises.add(`${nombre}->${pais.name}`);
        return pais;
      }

      if (ratio(nombreNormalizado, nombreNormalizado2) > 50) {
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

      console.log(error(`El código ${codigo} del país no existe`));
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

function limpiarFecha(fila, llave) {
  if (fila[llave]) {
    const fecha = fechaColombia(fila[llave]);

    if (fecha) {
      return fecha;
    } else {
      errata.fechas.add(`Caso ${fila.Caso} no tiene ${llave}, el campo tiene ${JSON.stringify(fila[llave])}`);

      throw new Error(JSON.stringify(fila, null, 2));
    }
  }

  return;
}

export const limpieza = (fila) => {
  const departamento = limpiarDepartamento(fila);
  const municipio = limpiarMunicipio(fila);
  const pais = limpiarPais(fila);

  const res = {
    id: Number(fila.Caso),
    mun: municipio[3],
    dep: departamento[0],
    recuperado: fila.Recuperado,
    recuperacion: fila.Tipo_recuperacion,
    edad: Number(fila.Edad),
    sexo: fila.Sexo,
  };

  if (pais) res.pais = pais.id;

  const fechaHoy = limpiarFecha(fila, 'fecha_hoy_casos');
  if (fechaHoy) res.fecha_hoy = fechaHoy;

  const fechaInicio = limpiarFecha(fila, 'Fecha_inicio_sintomas');
  if (fechaInicio) res.fecha_inicio = fechaInicio;

  const fechaNotificacion = limpiarFecha(fila, 'Fecha Not');
  if (fechaNotificacion) res.fecha_not = fechaNotificacion;

  const fechaDiagnostico = limpiarFecha(fila, 'Fecha_diagnostico');
  if (fechaDiagnostico) res.fecha_diag = fechaDiagnostico;

  const fechaMuerte = limpiarFecha(fila, 'Fecha_muerte');
  if (fechaMuerte) res.fecha_muerte = fechaMuerte;

  // console.log(res);

  return res;
};
