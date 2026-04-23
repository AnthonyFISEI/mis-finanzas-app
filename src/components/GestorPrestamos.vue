<script setup>
import { ref } from 'vue';
import api from '../api';

const props = defineProps({ prestamos: Array });
const emit = defineEmits(['recargarPrestamos']);

const form = ref({
  nombre: '',
  monto_total: '',
  cuotas_totales: '',
  valor_cuota: '',
  fecha_inicio: new Date().toISOString().split('T')[0]
});

const guardarPrestamo = async () => {
  try {
    await api.post('/prestamos', form.value);
    emit('recargarPrestamos');
    // Limpiar campos
    form.value = { nombre: '', monto_total: '', cuotas_totales: '', valor_cuota: '', fecha_inicio: new Date().toISOString().split('T')[0] };
  } catch (error) {
    console.error("Error al guardar:", error);
  }
};
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
      <h2 class="text-lg font-bold mb-4 text-gray-800">Nuevo Préstamo</h2>
      <form @submit.prevent="guardarPrestamo" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Institución / Cooperativa</label>
          <input v-model="form.nombre" type="text" placeholder="Ej: Cooperativa Ambato" class="w-full border-gray-300 rounded-lg p-2 text-sm" required>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Monto Total</label>
            <input v-model="form.monto_total" type="number" step="0.01" class="w-full border-gray-300 rounded-lg p-2 text-sm" required>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Plazo (Meses)</label>
            <input v-model="form.cuotas_totales" type="number" class="w-full border-gray-300 rounded-lg p-2 text-sm" required>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Cuota Mensual ($)</label>
          <input v-model="form.valor_cuota" type="number" step="0.01" class="w-full border-gray-300 rounded-lg p-2 text-sm" required>
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">Registrar Obligación</button>
      </form>
    </div>

    <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 class="text-lg font-bold mb-4 text-gray-800">Préstamos Vigentes</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="p in prestamos" :key="p.id" class="p-4 border border-gray-100 rounded-xl bg-gray-50 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-2 bg-blue-100 text-blue-700 text-[10px] font-bold px-3">ACTIVO</div>
          <h3 class="font-bold text-gray-800">{{ p.nombre }}</h3>
          <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="block text-[10px] text-gray-400 uppercase">Cuota Mensual</span>
              <span class="font-black text-gray-900">${{ p.valor_cuota }}</span>
            </div>
            <div>
              <span class="block text-[10px] text-gray-400 uppercase">Total meses</span>
              <span class="font-bold text-gray-700">{{ p.cuotas_totales }} meses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>