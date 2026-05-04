<script setup>
defineProps({
  ingresos: { type: Number, required: true },
  gastos: { type: Number, required: true },
  gastosFuturos: { type: Number, default: 0 },
  saldo: { type: Number, required: true }
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 class="text-sm font-medium text-gray-500 uppercase">Ingresos</h3>
      <p class="text-2xl font-bold text-green-600">${{ ingresos.toFixed(2) }}</p>
    </div>
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 class="text-sm font-medium text-gray-500 uppercase" title="Gastos a pagar este mes">Liquidación Actual</h3>
      <p class="text-2xl font-bold text-red-600">${{ gastos.toFixed(2) }}</p>
    </div>
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 class="text-sm font-medium text-gray-500 uppercase" title="Gastos realizados después de la fecha de corte (a pagar el próximo mes)">Proyección Próximo Mes</h3>
      <p class="text-2xl font-bold text-orange-500">${{ gastosFuturos.toFixed(2) }}</p>
    </div>
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 class="text-sm font-medium text-gray-500 uppercase">Saldo Neto</h3>
      <p class="text-2xl font-bold" :class="saldo >= 0 ? 'text-gray-900' : 'text-red-600'">
        ${{ saldo.toFixed(2) }}
      </p>
    </div>
  </div>
</template>