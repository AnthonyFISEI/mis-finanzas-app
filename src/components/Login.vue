<script setup>
import { ref } from 'vue';
import axios from 'axios';

const emit = defineEmits(['loginExitoso']);

const form = ref({
  email: '',
  password: ''
});

const errorMsj = ref('');
const cargando = ref(false);

const iniciarSesion = async () => {
  cargando.value = true;
  errorMsj.value = '';
  
  try {
    const res = await axios.post('http://localhost:3000/api/login', form.value);
    
    // Guardamos el token y los datos del usuario en el navegador
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
    
    // Le avisamos a App.vue que ya puede cargar la app principal
    emit('loginExitoso');
  } catch (error) {
    errorMsj.value = error.response?.data?.error || 'Error al conectar con el servidor';
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Inicia sesión en tu cuenta
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
        <form class="space-y-6" @submit.prevent="iniciarSesion">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <div class="mt-1">
              <input id="email" v-model="form.email" type="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div class="mt-1">
              <input id="password" v-model="form.password" type="password" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            </div>
          </div>

          <div v-if="errorMsj" class="p-3 rounded-md bg-red-50 text-red-700 text-sm">
            {{ errorMsj }}
          </div>

          <div>
            <button type="submit" :disabled="cargando" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {{ cargando ? 'Verificando...' : 'Entrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>