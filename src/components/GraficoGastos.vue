<script setup>
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

defineProps({
  datosGrafico: { type: Object, required: true }
});

const opcionesGrafico = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } }
};
</script>

<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 class="text-lg font-bold mb-4">Distribución de Gastos</h2>
    <div class="h-64 relative">
      <Doughnut v-if="datosGrafico.datasets && datosGrafico.datasets[0].data.length > 0" :data="datosGrafico" :options="opcionesGrafico" />
      <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm text-center">
        No hay gastos en el mes seleccionado
      </div>
    </div>
  </div>
</template>