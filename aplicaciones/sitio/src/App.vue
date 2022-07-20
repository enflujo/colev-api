<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref } from 'vue';
import HelloWorld from './components/HelloWorld.vue';
const servidorUrl = 'http://localhost:8080';
const muertos = ref([]);
const extraccion = ref(null);

async function obtenerMuertos() {
  muertos.value = await fetch(servidorUrl).then((respuesta) => respuesta.json());
}

async function extraer() {
  extraccion.value = await fetch(`${servidorUrl}/extraer`).then((respuesta) => respuesta.json());
}
</script>

<template>
  <h1>Administrador</h1>

  <button @click="obtenerMuertos">Muertos</button>
  <button @click="extraer">Extrear</button>

  <div v-if="extraccion" :class="extraccion.error ? 'error' : ''" class="mensaje">
    <h3>{{ extraccion.error }}</h3>
    {{ extraccion.mensaje }}
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
