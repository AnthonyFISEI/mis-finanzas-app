<script setup>
import { computed } from 'vue';

const props = defineProps({
  transacciones: { type: Array, required: true },
  mesFiltro: { type: String, required: false, default: '' }
});

const emit = defineEmits(['eliminar']);

// LÓGICA DE ORDENAMIENTO: Ordena por fecha descendente (más nuevo primero)
// Si dos transacciones tienen la misma fecha, las ordena por el ID más alto (último creado)
const transaccionesOrdenadas = computed(() => {
  return [...props.transacciones].sort((a, b) => {
    const fechaA = new Date(a.fecha_transaccion).getTime();
    const fechaB = new Date(b.fecha_transaccion).getTime();
    
    if (fechaB !== fechaA) {
      return fechaB - fechaA; // Ordena de más reciente a más antiguo
    } else {
      return b.id - a.id; // Si es el mismo día, el último guardado va primero
    }
  });
});

// Función para evitar el desfase de zona horaria al formatear YYYY-MM-DD
const formatearFechaLocal = (fechaStr) => {
  if (!fechaStr) return '';
  const [year, month, day] = fechaStr.split('T')[0].split('-');
  return new Date(year, month - 1, day).toLocaleDateString();
};

// Función segura para obtener el día exacto de la fecha original
const obtenerDia = (fechaStr) => {
  if (!fechaStr) return 0;
  const [year, month, day] = fechaStr.split('T')[0].split('-');
  return parseInt(day, 10);
};
</script>

<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-3 overflow-x-auto h-fit">
    <h2 class="text-lg font-bold mb-4">Movimientos del Mes</h2>
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="border-b border-gray-200 text-sm text-gray-500">
          <th class="pb-3 font-medium">Fecha</th>
          <th class="pb-3 font-medium">Categoría</th>
          <th class="pb-3 font-medium">Descripción</th>
          <th class="pb-3 font-medium text-right">Monto</th>
          <th class="pb-3 font-medium text-center">Cuenta/Tarjeta</th>
          <th class="pb-3 font-medium text-center">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in transaccionesOrdenadas" :key="t.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
          
          <td class="py-3 text-sm text-gray-600">
            <div class="flex items-center gap-2">
              {{ formatearFechaLocal(t.fecha_transaccion) }}
              <span 
                v-if="t.cuenta_tipo === 'credito' && t.dia_corte && obtenerDia(t.fecha_transaccion) > t.dia_corte"
                class="cursor-help"
                :title="t.fecha_transaccion.startsWith(mesFiltro) ? 'Este gasto se paga el próximo mes' : 'Gasto arrastrado del mes anterior'"
              >
                <span v-if="t.fecha_transaccion.startsWith(mesFiltro) || !mesFiltro" class="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">⏭️ FUTURO</span>
                <span v-else class="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">⚠️ MES ANTERIOR</span>
              </span>
            </div>
          </td>      
          
          <td class="py-3">
            <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full text-white" :style="{ backgroundColor: t.color_hex }">
              {{ t.categoria_nombre }}
            </span>
          </td>
          
          <td class="py-3 text-sm text-gray-600">
            {{ t.descripcion || '-' }}
            <span v-if="t.cuota_actual" class="ml-2 text-[10px] font-bold bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
              📌 Cuota {{ t.cuota_actual }}/{{ t.cuotas_totales }}
            </span>
          </td>   
          
          <td class="py-3 text-sm font-bold text-right" :class="t.tipo === 'ingreso' ? 'text-green-600' : 'text-gray-900'">
            {{ t.tipo === 'ingreso' ? '+' : '-' }}${{ parseFloat(t.monto).toFixed(2) }}
          </td>
          
          <td class="py-3 text-center">
            <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200">
              {{ t.cuenta_nombre }}
            </span>
          </td>
          
          <td class="py-3 text-center">
            <button 
              @click="$emit('eliminar', t.id)" 
              class="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors text-xs font-bold"
              title="Eliminar registro"
            >
              Borrar
            </button>
          </td>

        </tr>
        
        <tr v-if="transaccionesOrdenadas.length === 0">
          <td colspan="6" class="py-8 text-center text-gray-400 text-sm">No hay movimientos en este periodo.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>