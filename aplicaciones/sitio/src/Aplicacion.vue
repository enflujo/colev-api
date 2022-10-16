<script setup>
import { ref } from 'vue';
const servidorUrl = 'https://colev.enflujo.com/tally';
const muertos = ref([]);
const fechaInicial = ref(null);
const fechaFinal = ref(null);

async function obtenerMuertos() {
  const muertos = await fetch(servidorUrl).then((respuesta) => respuesta.json());

  fechaInicial.value = muertos.casos[0][0];
  fechaFinal.value = muertos.casos[muertos.casos.length - 1][0];
  muertos.value = muertos.casos;
}
</script>

<template>
  <div>
    <h1>Administrador</h1>

    <button @click="obtenerMuertos">Muertos</button>

    <p v-if="fechaInicial">fecha inicial: {{ fechaInicial }}</p>
    <p v-if="fechaFinal">fecha final: {{ fechaFinal }}</p>
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
