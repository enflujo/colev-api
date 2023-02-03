<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import zonaHoraria from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';

dayjs.extend(utc);
dayjs.extend(zonaHoraria);
dayjs.tz.setDefault('America/Bogota');
dayjs.locale('es');
const servidorUrl = import.meta.env.DEV ? 'http://localhost:8080/tally' : 'https://colev.enflujo.com/tally';
const muertos = ref([]);
const fechaInicial = ref(null);
const fechaFinal = ref(null);

async function obtenerMuertos() {
  const datos = await fetch(`${servidorUrl}/casos-por-dia`).then((respuesta) => respuesta.json());
  fechaInicial.value = datos[0][0];
  fechaFinal.value = datos[datos.length - 1][0];
  muertos.value = datos;
  console.log(datos);
}

async function obtenerTweetsPorDia() {
  const datos = await fetch(`${servidorUrl}/tuits-por-dia`).then((respuesta) => respuesta.json());

  console.log(datos);
  datos.forEach((dia) => {
    const fecha = dayjs(dia[0]).format('MMMM D, YYYY');
    console.log(fecha, dia[1]);
  });
}

async function obtenerTweetsPorHora() {
  const datos = await fetch(`${servidorUrl}/tuits-por-hora`).then((respuesta) => respuesta.json());
  if (datos) {
    console.log(datos);
  }
}

async function borrarCache(llave) {
  const seBorroCache = await fetch(`${servidorUrl}/borrar/${llave}`).then((respuesta) => respuesta.json());
  console.log(`¿Se borró cache ${llave}? - ${seBorroCache}`);
}
</script>

<template>
  <div>
    <h1>Administrador</h1>

    <button @click="obtenerMuertos">Muertos</button>
    <button @click="obtenerTweetsPorDia">Tweets por día</button>
    <button @click="obtenerTweetsPorHora">Tweets por hora</button>
    <button @click="borrarCache('tweetsPorDia')">Borrar cache Tweets por día</button>
    <button @click="borrarCache('tweetsPorHora')">Borrar cache Tweets por día</button>
    <button @click="borrarCache('casosPorDia')">Borrar cache Casos por día</button>

    <p v-if="fechaInicial">fecha inicial: {{ fechaInicial }}</p>
    <p v-if="fechaFinal">fecha final: {{ fechaFinal }}</p>
    <p>{{ muertos.length }}</p>
    <p v-if="muertos.length">{{ muertos.length }}</p>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.error {
  color: red;
}

.mensaje {
  font-size: 0.9em;
  margin: 1em;
}
</style>
