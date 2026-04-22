<script setup>
import { computed } from 'vue';

const props = defineProps({
  cuentas: { type: Array, required: true },
  transacciones: { type: Array, required: true }
});

// Calculamos las métricas de las tarjetas en tiempo real
const tarjetasCredito = computed(() => {
  // 1. Filtramos solo las cuentas de tipo crédito
  const tarjetas = props.cuentas.filter(c => c.tipo === 'credito');

  // 2. Calculamos la deuda y disponibilidad de cada una
  return tarjetas.map(tarjeta => {
    // Sumamos los gastos hechos con esta tarjeta específica
    const deuda = props.transacciones
      .filter(t => t.cuenta_nombre === tarjeta.nombre && t.tipo === 'gasto')
      .reduce((sum, t) => sum + parseFloat(t.monto), 0);

    const cupoTotal = parseFloat(tarjeta.cupo_aprobado) || 0;
    const cupoDisponible = cupoTotal - deuda;
    
    // Calculamos el porcentaje de uso (Ratio de Utilización)
    const porcentajeUso = cupoTotal > 0 ? (deuda / cupoTotal) * 100 : 0;

    // Reglas del Analista Financiero: 
    // < 30% (Verde/Sano), 30% - 50% (Amarillo/Alerta), > 50% (Rojo/Peligro)
    let colorBarra = 'bg-green-500';
    let colorTexto = 'text-green-600';
    let estado = 'Óptimo';

    if (porcentajeUso >= 30) {
      colorBarra = 'bg-yellow-500';
      colorTexto = 'text-yellow-600';
      estado = 'Precaución';
    }
    if (porcentajeUso >= 50) {
      colorBarra = 'bg-red-500';
      colorTexto = 'text-red-600';
      estado = 'Sobreendeudado';
    }

    return { 
      ...tarjeta, 
      deuda, 
      cupoTotal, 
      cupoDisponible, 
      porcentajeUso, 
      colorBarra,
      colorTexto,
      estado
    };
  });
});
</script>

<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100" v-if="tarjetasCredito.length > 0">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-800">Salud Crediticia</h2>
      <span class="text-sm text-gray-500">Uso de cupos aprobados</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="tc in tarjetasCredito" :key="tc.id" class="border border-gray-200 rounded-lg p-5 bg-gray-50">
        
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-bold text-lg text-gray-800">💳 {{ tc.nombre }}</h3>
            <p class="text-xs text-gray-500 mt-1">Corte: Día {{ tc.dia_corte || '--' }} | Pago: Día {{ tc.dia_pago || '--' }}</p>
          </div>
          <div class="text-right">
            <span :class="['text-xs font-bold px-2 py-1 rounded-full bg-white border', tc.colorTexto]">
              {{ tc.estado }}
            </span>
          </div>
        </div>

        <div class="flex justify-between text-sm mb-2">
          <span class="text-gray-600">Deuda Actual: <strong class="text-gray-900">${{ tc.deuda.toFixed(2) }}</strong></span>
          <span class="text-gray-600">Cupo: <strong>${{ tc.cupoTotal.toFixed(2) }}</strong></span>
        </div>

        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden flex">
          <div :class="['h-2.5 rounded-full transition-all duration-500', tc.colorBarra]" :style="{ width: `${Math.min(tc.porcentajeUso, 100)}%` }"></div>
        </div>

        <div class="flex justify-between items-center mt-3">
          <span class="text-xs font-bold text-gray-500">Utilización: {{ tc.porcentajeUso.toFixed(1) }}%</span>
          <span class="text-sm font-bold text-blue-600">Disponible: ${{ tc.cupoDisponible.toFixed(2) }}</span>
        </div>

      </div>
    </div>
  </div>
</template>