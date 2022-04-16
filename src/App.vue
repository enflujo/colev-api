<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue';
const servidorUrl = 'http://localhost:8080';
const muertos = [];
const extraccion = {};
</script>

<script>
export default {
  methods: {
    async obtenerMuertos() {
      this.muertos = await fetch(this.servidorUrl).then((respuesta) => respuesta.json());
    },

    async extraer() {
      this.extraccion = await fetch(`${this.servidorUrl}/extraer`).then((respuesta) => respuesta.json());
    },
  },
};
</script>

<template>
  <h1>Administrador</h1>

  <button @click="obtenerMuertos">Muertos</button>
  <button @click="extraer">Extrear</button>

  <div :class="this.extraccion.error ? 'error' : ''" class="mensaje">
    <h3>{{ this.extraccion.error }}</h3>
    {{ this.extraccion.mensaje }}
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
