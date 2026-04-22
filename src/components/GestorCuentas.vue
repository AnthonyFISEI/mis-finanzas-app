<script setup>
import { ref } from 'vue';
import axios from 'axios';

const props = defineProps({
  cuentas: { type: Array, required: true }
});

const emit = defineEmits(['recargarCuentas']);

const form = ref({
  nombre: '',
  tipo: 'credito',
  cupo_aprobado: '',
  dia_corte: '',
  dia_pago: ''
});

const guardarCuenta = async () => {
  if (!form.value.nombre || !form.value.tipo) return alert('El nombre y tipo son obligatorios');
  
  try {
    await axios.post('http://localhost:3000/api/cuentas', form.value);
    emit('recargarCuentas'); // Avisamos a App.vue que descargue las cuentas actualizadas
    
    // Limpiamos formulario
    form.value.nombre = '';
    form.value.cupo_aprobado = '';
    form.value.dia_corte = '';
    form.value.dia_pago = '';
  } catch (error) {
    console.error("Error al guardar cuenta:", error);
  }
};
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1 h-fit">
      <h2 class="text-lg font-bold mb-4">Añadir Cuenta / Tarjeta</h2>
      <form @submit.prevent="guardarCuenta" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre (Ej: Diners Club)</label>
          <input v-model="form.nombre" type="text" class="w-full border border-gray-300 rounded-lg p-2" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Cuenta</label>
          <select v-model="form.tipo" class="w-full border border-gray-300 rounded-lg p-2" required>
            <option value="debito">Débito / Efectivo / Ahorros</option>
            <option value="credito">Tarjeta de Crédito</option>
          </select>
        </div>

        <template v-if="form.tipo === 'credito'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cupo Aprobado ($)</label>
            <input v-model="form.cupo_aprobado" type="number" step="0.01" class="w-full border border-gray-300 rounded-lg p-2">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Día de Corte</label>
              <input v-model="form.dia_corte" type="number" min="1" max="31" class="w-full border border-gray-300 rounded-lg p-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Día de Pago</label>
              <input v-model="form.dia_pago" type="number" min="1" max="31" class="w-full border border-gray-300 rounded-lg p-2">
            </div>
          </div>
        </template>

        <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Guardar Cuenta</button>
      </form>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
      <h2 class="text-lg font-bold mb-4">Cuentas Registradas</h2>
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-gray-200 text-sm text-gray-500">
            <th class="pb-3">Nombre</th>
            <th class="pb-3">Tipo</th>
            <th class="pb-3 text-right">Cupo / Fechas</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in cuentas" :key="c.id" class="border-b border-gray-50">
            <td class="py-3 font-medium text-gray-800">{{ c.nombre }}</td>
            <td class="py-3">
              <span class="text-xs px-2 py-1 rounded-full" :class="c.tipo === 'credito' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'">
                {{ c.tipo.toUpperCase() }}
              </span>
            </td>
            <td class="py-3 text-right text-sm text-gray-600">
              <template v-if="c.tipo === 'credito'">
                Cupo: <strong>${{ c.cupo_aprobado }}</strong> <br>
                <span class="text-xs">Corte: {{ c.dia_corte }} | Pago: {{ c.dia_pago }}</span>
              </template>
              <template v-else>N/A</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>