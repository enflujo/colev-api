# Colev API

Aplicación para extraer, procesar y administrar los datos sobre Covid 19 en Colombia para las diferentes aplicaciones de investigación en el grupo [Colev](https://colev.uniandes.edu.co/) de la Universidad de los Andes.

## Instalación

```bash
# Con yarn o NPM
yarn
```

## Desarrollo local

Iniciar el servidor:

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
