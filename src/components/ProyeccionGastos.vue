<script setup>
import { computed } from 'vue';

const props = defineProps({
  transacciones: { type: Array, required: true },
  mesFiltro: { type: String, required: false, default: '' }
});

const balances = computed(() => {
  let inmediato = 0;
  let proyectado = 0;

  let filtro = props.mesFiltro;
  if (!filtro) {
    const hoy = new Date();
    filtro = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  }

  const [year, month] = filtro.split('-');
  const fechaAnterior = new Date(year, month - 2, 1);
  const mesAnteriorStr = `${fechaAnterior.getFullYear()}-${String(fechaAnterior.getMonth() + 1).padStart(2, '0')}`;

  props.transacciones.forEach(t => {
    if (t.tipo !== 'gasto') return;
    
    const monto = parseFloat(t.monto);
    
    if (!t.fecha_transaccion) return;
    const [tYear, tMonth, tDay] = t.fecha_transaccion.split('T')[0].split('-');
    const mesTransaccion = `${tYear}-${tMonth}`;
    const diaCompra = parseInt(tDay, 10);

    const esCredito = t.cuenta_tipo === 'credito';
    const esDespuesDelCorte = esCredito && t.dia_corte && diaCompra > t.dia_corte;

    if (mesTransaccion === filtro) {
      if (esDespuesDelCorte) {
        proyectado += monto;
      } else {
        inmediato += monto;
      }
    } else if (mesTransaccion === mesAnteriorStr) {
      if (esDespuesDelCorte) {
        inmediato += monto;
      }
    }
  });

  return { inmediato, proyectado };
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
    <div class="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
        <span class="w-2 h-2 rounded-full bg-red-500"></span>
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest">Liquidación Actual</h3>
      </div>
      <p class="text-3xl font-black text-gray-900">${{ balances.inmediato.toFixed(2) }}</p>
      <p class="text-[10px] text-gray-400 mt-2 italic">Gastos que debes cubrir en el corte presente.</p>
    </div>

    <div class="bg-gradient-to-br from-white to-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
        <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        <h3 class="text-xs font-bold text-blue-600 uppercase tracking-widest">Proyección Próximo Mes</h3>
      </div>
      <p class="text-3xl font-black text-blue-700">${{ balances.proyectado.toFixed(2) }}</p>
      <p class="text-[10px] text-blue-400 mt-2 italic">Consumos que "jineteas" para el siguiente periodo.</p>
    </div>
  </div>
</template>