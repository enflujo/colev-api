# Colev API

Aplicación para extraer, procesar y administrar los datos sobre Covid 19 en Colombia para las diferentes aplicaciones de investigación en el grupo [Colev](https://colev.uniandes.edu.co/) de la Universidad de los Andes.

## Instalación

```bash
# Con yarn o NPM
yarn
```

## Desarrollo local

### Crear Token

1. Ingresar o registrarse en el portal de datos abiertos de Colombia Tokens de App [https://www.datos.gov.co/profile/edit/developer_settings](https://www.datos.gov.co/profile/edit/developer_settings).
2. En la sección **"Tokens de App"**, picar en el botón **"Crear nueva aplicación"**.
3. Luego de llenar la información de la aplicación, copiar el token público que se encuentra en **"Autentificador de la aplicación"**
4. En los archivos locales, hacer una copia del archivo `.env.ejemplo` y llamarlo `.env`. Allí pegar el Token que acaba de copiar en la variable `TOKEN=`

o crear el archivo `.env` directamente con la variable:

```bash
TOKEN=.....
```

### Iniciar el servidor:

```bash
yarn start
```

Este inicia en el puerto `3000`: [localhost:3000](http://localhost:3000)

### Rutas

Para acceder a las diferentes fuentes de datos, ver las rutas que se definen en el archivo `./servidor.js`. Cada ruta comienza con `servidor.get('/' ...`.

Por ejemplo, en `servidor.js` esta la siguiente ruta que se puede acceder desde [localhost:3000/descriptores](http://localhost:3000/descriptores):

```js
servidor.get('/descriptores', async (request, reply) => {
  const descriptores = await readFile('./datos/descriptores.json');

  return JSON.parse(descriptores);
});
```

Revisar 1 caso por id: https://www.datos.gov.co/resource/gt2j-8ykr.json?id_de_caso=5666290
