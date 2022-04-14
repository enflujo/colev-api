<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue';
const servidorUrl = 'http://localhost:8080';
const muertos = [];
</script>

<script>
export default {
  methods: {
    async obtenerMuertos() {
      this.muertos = await fetch(this.servidorUrl).then((respuesta) => respuesta.json());
    },
  },
};
</script>

<template>
  <h1>Administrador</h1>

  <button @click="obtenerMuertos">Muertos</button>
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
</style>
