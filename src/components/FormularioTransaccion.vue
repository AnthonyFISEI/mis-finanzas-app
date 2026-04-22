<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  categorias: { type: Array, required: true },
  cuentas: { type: Array, required: true },
  prestamos: { type: Array, required: false, default: () => [] }
});

const emit = defineEmits(['guardar']);

const categoriasOrdenadas = computed(() => {
  return [...props.categorias].sort((a, b) => a.nombre.localeCompare(b.nombre));
});

const form = ref({
  categoria_id: '',
  cuenta_id: '',
  prestamo_id: '',
  monto: '',
  fecha_transaccion: new Date().toISOString().split('T')[0],
  descripcion: '',
  es_fijo: false,
  es_diferido: false,    // NUEVO CAMPO
  meses_diferido: 3      // NUEVO CAMPO (Valor por defecto)
});

// Resetea diferidos si cambias a cuenta de débito
watch(() => form.value.cuenta_id, (nuevaCuentaId) => {
  const cuenta = props.cuentas.find(c => c.id == nuevaCuentaId);
  if (cuenta && cuenta.tipo !== 'credito') {
    form.value.es_diferido = false;
  }
});

watch(() => form.value.prestamo_id, (nuevoId) => {
  if (nuevoId) {
    const prestamo = props.prestamos.find(p => p.id == nuevoId);
    if (prestamo) {
      form.value.monto = prestamo.valor_cuota;
      form.value.es_fijo = true;
      form.value.descripcion = `Pago cuota ${prestamo.nombre}`;
    }
  }
});

const esCuentaCredito = computed(() => {
  const cuenta = props.cuentas.find(c => c.id == form.value.cuenta_id);
  return cuenta && cuenta.tipo === 'credito';
});

const esGastoSeleccionado = computed(() => {
  if (!form.value.categoria_id) return false;
  const categoria = props.categorias.find(c => c.id == form.value.categoria_id);
  return categoria && categoria.tipo === 'gasto';
});

const esPrestamoSeleccionado = computed(() => {
  if (!form.value.categoria_id) return false;
  const categoria = props.categorias.find(c => c.id == form.value.categoria_id);
  return categoria && categoria.nombre === 'Préstamos y Créditos';
});

const cuotaDiferido = computed(() => {
  if (!form.value.monto || !form.value.meses_diferido) return 0;
  return (parseFloat(form.value.monto) / form.value.meses_diferido).toFixed(2);
});

// LÓGICA DE IMPACTO MEJORADA CON DIFERIDOS
const infoImpacto = computed(() => {
  const cuenta = props.cuentas.find(c => c.id == form.value.cuenta_id);
  if (!cuenta || cuenta.tipo !== 'credito' || !cuenta.dia_corte) return null;

  const [year, month, day] = form.value.fecha_transaccion.split('-');
  const diaCompra = parseInt(day, 10);
  const esProximoMes = diaCompra > parseInt(cuenta.dia_corte, 10);
  
  const fechaPago = new Date(year, parseInt(month) - 1, diaCompra);
  if (esProximoMes) {
    fechaPago.setMonth(fechaPago.getMonth() + 1);
  }
  const mesPago = fechaPago.toLocaleString('es-ES', { month: 'long' });

  return {
    esProximoMes,
    mesPago,
    esDiferido: form.value.es_diferido,
    cuota: cuotaDiferido.value
  };
});

const enviarFormulario = () => {
  if (!form.value.categoria_id || !form.value.monto || !form.value.cuenta_id) {
    alert('Completa los campos obligatorios');
    return;
  }
  
  const datosAGuardar = { 
    ...form.value,
    prestamo_id: esPrestamoSeleccionado.value ? form.value.prestamo_id : null,
    es_fijo: esGastoSeleccionado.value ? form.value.es_fijo : false,
    meses_diferido: form.value.es_diferido ? form.value.meses_diferido : 1
  };

  emit('guardar', datosAGuardar);
  
  // Limpieza rápida
  form.value.monto = '';
  form.value.descripcion = '';
  form.value.es_diferido = false;
  form.value.prestamo_id = '';
};
</script>

<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 class="text-lg font-bold mb-4">Nueva Transacción</h2>
    <form @submit.prevent="enviarFormulario" class="space-y-4">
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select v-model="form.categoria_id" class="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500" required>
          <option value="" disabled>Seleccionar...</option>
          <optgroup label="Ingresos">
            <option v-for="c in categoriasOrdenadas.filter(cat => cat.tipo === 'ingreso')" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </optgroup>
          <optgroup label="Gastos">
            <option v-for="c in categoriasOrdenadas.filter(cat => cat.tipo === 'gasto')" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </optgroup>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
        <select v-model="form.cuenta_id" class="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500" required>
          <option v-for="cuenta in cuentas" :key="cuenta.id" :value="cuenta.id">
            💳 {{ cuenta.nombre }}
          </option>
        </select>
      </div>

      <div v-if="esCuentaCredito && !esPrestamoSeleccionado" class="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
        <label class="flex items-center gap-2 cursor-pointer mb-2">
          <input type="checkbox" v-model="form.es_diferido" class="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4">
          <span class="text-sm font-bold text-indigo-900">Diferir el pago de esta compra</span>
        </label>
        
        <div v-if="form.es_diferido" class="mt-3 pl-6 border-l-2 border-indigo-200">
          <label class="block text-xs font-bold text-indigo-700 uppercase mb-1">Meses a diferir</label>
          <div class="flex items-center gap-4">
            <input v-model="form.meses_diferido" type="number" min="2" max="36" class="w-24 border-gray-300 rounded-md p-1 text-sm">
            <span class="text-sm text-indigo-800 font-medium">Cuota est.: <strong class="text-indigo-900">${{ cuotaDiferido }}</strong>/mes</span>
          </div>
        </div>
      </div>

      <div v-if="esPrestamoSeleccionado" class="p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-inner">
        <label class="block text-sm font-bold text-blue-800 mb-2">Selecciona el Préstamo a Pagar</label>
        <select v-model="form.prestamo_id" class="w-full border-blue-300 rounded-lg shadow-sm p-2 text-blue-900 bg-white focus:ring-blue-500" required>
          <option value="" disabled>Elegir préstamo vigente...</option>
          <option v-for="p in prestamos" :key="p.id" :value="p.id">
            🏦 {{ p.nombre }} (Cuota: ${{ p.valor_cuota }})
          </option>
        </select>
      </div>

      <div v-if="infoImpacto" 
           :class="['p-3 rounded-lg border text-sm transition-all', 
                    infoImpacto.esProximoMes ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-amber-50 border-amber-200 text-amber-700']">
        <div class="flex items-start gap-2">
          <span class="text-lg">{{ infoImpacto.esProximoMes ? '💡' : '⚠️' }}</span>
          <div>
            <p>
              La <strong>{{ infoImpacto.esDiferido ? 'primera cuota' : 'facturación' }}</strong> de este consumo impactará en tu estado de cuenta de <strong class="capitalize">{{ infoImpacto.mesPago }}</strong>.
            </p>
            <p v-if="infoImpacto.esDiferido" class="mt-1 text-xs font-bold">
              Proyección: {{ form.meses_diferido }} pagos de ${{ infoImpacto.cuota }}.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Monto Total ($)</label>
        <input v-model="form.monto" type="number" step="0.01" min="0" class="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500" required>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Compra</label>
        <input v-model="form.fecha_transaccion" type="date" class="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500" required>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <input v-model="form.descripcion" type="text" class="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500">
      </div>

      <button type="submit" class="w-full bg-gray-900 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors">Guardar</button>
      
    </form>
  </div>
</template>