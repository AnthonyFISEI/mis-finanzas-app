<script setup>
import { computed } from 'vue';
import { Doughnut, Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  transacciones: { type: Array, required: true },
  ingresosTotales: { type: Number, required: true },
  gastosTotales: { type: Number, required: true }
});

// Opciones base
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } }
};

// Opciones específicas para barras horizontales
const horizontalBarOptions = {
  ...chartOptions,
  indexAxis: 'y', // Convierte las barras verticales en horizontales
  plugins: { legend: { display: false } } // Ocultamos leyenda por limpieza
};

// 1. Gráfico Existente: Fijos vs Variables
const datosFijosVariables = computed(() => {
  const gastos = props.transacciones.filter(t => t.tipo === 'gasto');
  let fijos = 0, variables = 0;
  gastos.forEach(t => t.es_fijo === 1 || t.es_fijo === true ? (fijos += parseFloat(t.monto)) : (variables += parseFloat(t.monto)));
  return {
    labels: ['Fijos', 'Variables'],
    datasets: [{ data: [fijos, variables], backgroundColor: ['#34495E', '#F1C40F'], borderWidth: 0 }]
  };
});

// 2. Gastos por Día (Barras Verticales)
const datosGastosPorDia = computed(() => {
  const gastos = props.transacciones.filter(t => t.tipo === 'gasto');
  const dias = {};
  
  // Agrupar montos por día del mes
  gastos.forEach(t => {
    // CORRECCIÓN: Primero cortamos la "T" de la hora, y luego sacamos el día
    const fechaCorta = t.fecha_transaccion.split('T')[0]; // Se convierte en "2026-04-16"
    const dia = fechaCorta.split('-')[2];                 // Extraemos solo el "16"
    
    if (!dias[dia]) dias[dia] = 0;
    dias[dia] += parseFloat(t.monto);
  });

  // Ordenar los días de menor a mayor
  const diasOrdenados = Object.keys(dias).sort((a, b) => parseInt(a) - parseInt(b));

  return {
    labels: diasOrdenados.map(d => `Día ${parseInt(d)}`), // parseInt quita el "0" inicial (ej. Día 05 -> Día 5)
    datasets: [{
      label: 'Gasto Diario',
      data: diasOrdenados.map(d => dias[d]),
      backgroundColor: '#E74C3C',
      borderRadius: 4
    }]
  };
});
// 3. NUEVO: Top Categorías (Barras Horizontales)
const datosTopCategorias = computed(() => {
  const gastos = props.transacciones.filter(t => t.tipo === 'gasto');
  const agrupados = {};
  
  gastos.forEach(t => {
    if (!agrupados[t.categoria_nombre]) agrupados[t.categoria_nombre] = { total: 0, color: t.color_hex };
    agrupados[t.categoria_nombre].total += parseFloat(t.monto);
  });

  // Ordenar de mayor a menor gasto para el ranking
  const ranking = Object.keys(agrupados).sort((a, b) => agrupados[b].total - agrupados[a].total);

  return {
    labels: ranking,
    datasets: [{
      label: 'Monto Gastado',
      data: ranking.map(k => agrupados[k].total),
      backgroundColor: ranking.map(k => agrupados[k].color),
      borderRadius: 4
    }]
  };
});

// 4. NUEVO: Gasto por Método de Pago (Anillo)
// 4. Dinámico: Gasto por Método de Pago (Anillo)
const datosMetodoPago = computed(() => {
  // Filtramos solo los gastos de las transacciones que ya vienen filtradas por mes
  const gastos = props.transacciones.filter(t => t.tipo === 'gasto');
  
  const agrupados = {};
  
  gastos.forEach(t => {
    // Si por alguna razón cuenta_nombre viene nulo, lo agrupamos en 'Otros'
    const nombreCuenta = t.cuenta_nombre || 'Efectivo/Otros';
    
    if (!agrupados[nombreCuenta]) {
      agrupados[nombreCuenta] = 0;
    }
    agrupados[nombreCuenta] += parseFloat(t.monto);
  });

  // Generamos una paleta de colores más amplia para soportar muchas tarjetas
  const paletaColores = [
    '#3498DB', // Azul (Visa)
    '#E67E22', // Naranja (Mastercard)
    '#9B59B6', // Morado (Diners)
    '#1ABC9C', // Turquesa
    '#F1C40F', // Amarillo
    '#E74C3C', // Rojo
    '#34495E', // Gris Oscuro
    '#2ECC71'  // Verde
  ];

  const etiquetas = Object.keys(agrupados);
  const valores = Object.values(agrupados);

  return {
    labels: etiquetas,
    datasets: [{
      data: valores,
      // Usamos solo los colores necesarios de la paleta
      backgroundColor: paletaColores.slice(0, etiquetas.length),
      hoverOffset: 15,
      borderWidth: 0
    }]
  };
});


</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 class="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider text-center">Rigidez (Fijos vs Var)</h2>
      <div class="h-64 relative">
        <Doughnut v-if="gastosTotales > 0" :data="datosFijosVariables" :options="chartOptions" />
        <div v-else class="flex h-full items-center justify-center text-sm text-gray-400">Sin datos</div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 class="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider text-center">Uso de Cuentas / Deuda</h2>
      <div class="h-64 relative">
        <Doughnut v-if="gastosTotales > 0" :data="datosMetodoPago" :options="chartOptions" />
        <div v-else class="flex h-full items-center justify-center text-sm text-gray-400">Sin datos</div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 class="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider text-center">Evolución del Gasto Diario</h2>
      <div class="h-64 relative">
        <Bar v-if="gastosTotales > 0" :data="datosGastosPorDia" :options="chartOptions" />
        <div v-else class="flex h-full items-center justify-center text-sm text-gray-400">Sin datos</div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 class="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider text-center">Fugas de Dinero (Top Categorías)</h2>
      <div class="h-64 relative">
        <Bar v-if="gastosTotales > 0" :data="datosTopCategorias" :options="horizontalBarOptions" />
        <div v-else class="flex h-full items-center justify-center text-sm text-gray-400">Sin datos</div>
      </div>
    </div>

  </div>
</template>