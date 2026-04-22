<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';

const usuarios = ref([]);
const mensaje = ref({ texto: '', tipo: '' });

// Estado inicial del formulario con pareja_id incluido
const form = ref({ 
  nombre: '', 
  email: '', 
  password: '', 
  rol: 'usuario',
  pareja_id: '' // Importante: inicializado como string vacío
});

// Función para obtener la lista de usuarios y llenar el select de parejas
const cargarUsuarios = async () => {
  try {
    const res = await api.get('/usuarios');
    usuarios.value = res.data;
  } catch (error) {
    console.error("Error al cargar usuarios", error);
  }
};

const registrarUsuario = async () => {
  try {
    // Si pareja_id está vacío, enviamos null al servidor
    const datosEnvio = { 
      ...form.value, 
      pareja_id: form.value.pareja_id || null 
    };
    
    await api.post('/usuarios', datosEnvio);
    
    mensaje.value = { texto: 'Usuario y vinculación creados con éxito', tipo: 'success' };
    
    // Limpiamos el formulario
    form.value = { nombre: '', email: '', password: '', rol: 'usuario', pareja_id: '' };
    
    // Recargamos la lista para ver al nuevo usuario
    await cargarUsuarios();
    
    setTimeout(() => mensaje.value = { texto: '', tipo: '' }, 4000);
  } catch (error) {
    mensaje.value = { texto: 'Error: El correo ya existe o faltan datos', tipo: 'error' };
  }
};

onMounted(cargarUsuarios);
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
      <h2 class="text-lg font-bold mb-4 text-gray-800">Registrar Nuevo Usuario</h2>
      
      <div v-if="mensaje.texto" 
           :class="['mb-4 p-3 rounded-lg text-sm font-medium', 
                    mensaje.tipo === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200']">
        {{ mensaje.texto }}
      </div>
      
      <form @submit.prevent="registrarUsuario" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo</label>
          <input v-model="form.nombre" type="text" class="w-full border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500" required>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Correo Electrónico</label>
          <input v-model="form.email" type="email" class="w-full border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500" required>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña Inicial</label>
          <input v-model="form.password" type="password" class="w-full border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500" required>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Rol</label>
            <select v-model="form.rol" class="w-full border-gray-300 rounded-lg p-2 text-sm bg-white">
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <div>
            <label class="block text-xs font-bold text-indigo-600 uppercase mb-1">¿Pareja de?</label>
            <select v-model="form.pareja_id" class="w-full border-indigo-200 rounded-lg p-2 text-sm bg-indigo-50 focus:ring-indigo-500">
              <option value="">Ninguno</option>
              <option v-for="u in usuarios" :key="u.id" :value="u.id">
                💍 {{ u.nombre }}
              </option>
            </select>
          </div>
        </div>

        <button type="submit" class="w-full bg-gray-900 text-white font-bold py-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-md">
          Crear y Vincular
        </button>
      </form>
    </div>

    <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold text-gray-800">Usuarios en la Plataforma</h2>
        <span class="text-xs text-gray-400">Total: {{ usuarios.length }}</span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
              <th class="pb-3 font-black">Usuario</th>
              <th class="pb-3 font-black text-center">Rol</th>
              <th class="pb-3 font-black text-center">Pareja Vinculada</th>
              <th class="pb-3 font-black text-right">Registrado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td class="py-3">
                <div class="font-bold text-gray-900">{{ u.nombre }}</div>
                <div class="text-[11px] text-gray-400">{{ u.email }}</div>
              </td>
              <td class="py-3 text-center">
                <span :class="u.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'" 
                      class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                  {{ u.rol }}
                </span>
              </td>
            <td class="py-3 text-center">
                <span v-if="u.pareja_id" class="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  💍 {{ usuarios.find(p => p.id === u.pareja_id)?.nombre || 'ID: ' + u.pareja_id }}
                </span>
                <span v-else class="text-gray-300 italic text-xs">Sin vínculo</span>
              </td>
              <td class="py-3 text-right text-gray-500 text-xs">
                {{ new Date(u.creado_en).toLocaleDateString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>