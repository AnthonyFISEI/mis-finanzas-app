<script setup>
import { ref, computed, onMounted } from 'vue';
import api from './api';

// Componentes
import Login from './components/Login.vue';
import NavBar from './components/NavBar.vue';
import ResumenTarjetas from './components/ResumenTarjetas.vue';
import PanelGraficos from './components/PanelGraficos.vue';
import FormularioTransaccion from './components/FormularioTransaccion.vue';
import TablaMovimientos from './components/TablaMovimientos.vue';
import PanelTarjetas from './components/PanelTarjetas.vue';
import GestorCuentas from './components/GestorCuentas.vue';
import GestorPrestamos from './components/GestorPrestamos.vue';
import ProyeccionGastos from './components/ProyeccionGastos.vue';
import GestorUsuarios from './components/GestorUsuarios.vue';

// --- ESTADO DE AUTENTICACIÓN ---
const estaAutenticado = ref(false);
const usuarioLogueado = ref(null);
const transaccionesConjuntas = ref([]);

// Navegación
const moduloActivo = ref('finanzas');

// Estado global de datos
const categorias = ref([]);
const transacciones = ref([]);
const mesFiltro = ref(new Date().toISOString().slice(0, 7));
const cuentas = ref([]);
const prestamos = ref([]); 
const categoriaFiltroTabla = ref(null); 

// --- FUNCIONES DE AUTENTICACIÓN ---
const verificarAutenticacion = () => {
  const token = localStorage.getItem('token');
  const usuarioInfo = localStorage.getItem('usuario');
  
  if (token && usuarioInfo) {
    estaAutenticado.value = true;
    usuarioLogueado.value = JSON.parse(usuarioInfo);
    cargarDatos(); 
    
    // Si tiene pareja, cargamos el dashboard conjunto
    if (usuarioLogueado.value.pareja_id) {
      cargarDatosConjuntos();
    }
  } else {
    estaAutenticado.value = false;
  }
};

const cargarDatosConjuntos = async () => {
  try {
    const res = await api.get('/transacciones/conjunto');
    transaccionesConjuntas.value = res.data;
  } catch (error) {
    console.error("Error al cargar datos conjuntos:", error);
  }
};

const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  estaAutenticado.value = false;
  usuarioLogueado.value = null;
  
  // Limpiamos memoria
  categorias.value = [];
  transacciones.value = [];
  cuentas.value = [];
  prestamos.value = [];
  transaccionesConjuntas.value = [];
  moduloActivo.value = 'finanzas';
};

// --- PETICIONES A LA API ---
const recargarCuentas = async () => {
  try {
    const res = await api.get('/cuentas');
    cuentas.value = res.data;
  } catch (error) {
    console.error("Error recargando cuentas:", error);
  }
};

const recargarPrestamos = async () => {
  try {
    const res = await api.get('/prestamos');
    prestamos.value = res.data;
  } catch (error) {
    console.error("Error recargando préstamos:", error);
  }
};

const cargarDatos = async () => {
  try {
    const [resCat, resTrans, resCuentas, resPrestamos] = await Promise.all([
      api.get('/categorias'),
      api.get('/transacciones'),
      api.get('/cuentas'),
      api.get('/prestamos') 
    ]);
    categorias.value = resCat.data;
    transacciones.value = resTrans.data;
    cuentas.value = resCuentas.data;
    prestamos.value = resPrestamos.data;
  } catch (error) {
    console.error("Error de conexión:", error);
  }
};

// CORRECCIÓN: Refrescar datos conjuntos al guardar
const guardarTransaccion = async (nuevoRegistro) => {
  try {
    await api.post('/transacciones', nuevoRegistro);
    await cargarDatos();
    if (usuarioLogueado.value?.pareja_id) {
      await cargarDatosConjuntos();
    }
  } catch (error) {
    console.error("Error al guardar:", error);
  }
};

// CORRECCIÓN: Refrescar datos conjuntos al eliminar
const eliminarTransaccion = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este movimiento?')) return;
  try {
    await api.delete(`/transacciones/${id}`);
    await cargarDatos();
    if (usuarioLogueado.value?.pareja_id) {
      await cargarDatosConjuntos();
    }
  } catch (error) {
    console.error("Error al eliminar:", error);
  }
};

// --- LÓGICA DE FILTRADO Y CÁLCULOS (INDIVIDUAL) ---
const transaccionesFiltradas = computed(() => {
  if (!mesFiltro.value) return transacciones.value;

  const [year, month] = mesFiltro.value.split('-');
  const fechaAnterior = new Date(year, month - 2, 1);
  const mesAnteriorStr = `${fechaAnterior.getFullYear()}-${String(fechaAnterior.getMonth() + 1).padStart(2, '0')}`;

  return transacciones.value.filter(t => {
    if (!t.fecha_transaccion) return false;

    // Transacciones normales del mes seleccionado
    if (t.fecha_transaccion.startsWith(mesFiltro.value)) {
      // Opcional: Podríamos excluir las que son FUTURO de ESTE mes para que no sumen al gasto actual,
      // pero las dejaremos para que el usuario sepa que las hizo.
      return true;
    }

    // Transacciones del mes anterior que son FUTURO (deben cobrarse en el mes seleccionado)
    if (t.fecha_transaccion.startsWith(mesAnteriorStr) && t.cuenta_tipo === 'credito' && t.dia_corte) {
      const diaCompra = parseInt(t.fecha_transaccion.split('T')[0].split('-')[2], 10);
      if (diaCompra > t.dia_corte) {
        return true;
      }
    return false;
  });
});

// Transacciones para la tabla (aplica filtro de categoría si existe)
const transaccionesTablaFiltradas = computed(() => {
  let trans = transaccionesFiltradas.value;
  if (categoriaFiltroTabla.value) {
    trans = trans.filter(t => t.categoria_nombre === categoriaFiltroTabla.value);
  }
  return trans;
});

const toggleFiltroCategoria = (categoria) => {
  if (categoriaFiltroTabla.value === categoria) {
    categoriaFiltroTabla.value = null; // Toggle off
  } else {
    categoriaFiltroTabla.value = categoria; // Toggle on
  }
};

const totalIngresos = computed(() => transaccionesFiltradas.value.filter(t => t.tipo === 'ingreso').reduce((sum, t) => sum + parseFloat(t.monto), 0));
const totalGastos = computed(() => transaccionesFiltradas.value.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + parseFloat(t.monto), 0));
const saldoNeto = computed(() => totalIngresos.value - totalGastos.value);

// --- CÁLCULOS CONJUNTOS ---
const transaccionesConjuntasFiltradas = computed(() => {
  if (!mesFiltro.value) return transaccionesConjuntas.value;

  const [year, month] = mesFiltro.value.split('-');
  const fechaAnterior = new Date(year, month - 2, 1);
  const mesAnteriorStr = `${fechaAnterior.getFullYear()}-${String(fechaAnterior.getMonth() + 1).padStart(2, '0')}`;

  return transaccionesConjuntas.value.filter(t => {
    if (!t.fecha_transaccion) return false;

    // Transacciones normales del mes seleccionado
    if (t.fecha_transaccion.startsWith(mesFiltro.value)) {
      return true;
    }

    // Transacciones del mes anterior que son FUTURO (deben cobrarse en el mes seleccionado)
    if (t.fecha_transaccion.startsWith(mesAnteriorStr) && t.cuenta_tipo === 'credito' && t.dia_corte) {
      const diaCompra = parseInt(t.fecha_transaccion.split('T')[0].split('-')[2], 10);
      if (diaCompra > t.dia_corte) {
        return true;
      }
    }

    return false;
  });
});

const totalIngresosConjuntos = computed(() => transaccionesConjuntasFiltradas.value.filter(t => t.tipo === 'ingreso').reduce((sum, t) => sum + parseFloat(t.monto), 0));
const totalGastosConjuntos = computed(() => transaccionesConjuntasFiltradas.value.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + parseFloat(t.monto), 0));
const saldoNetoConjunto = computed(() => totalIngresosConjuntos.value - totalGastosConjuntos.value);

// Iniciamos verificando si el usuario ya tiene una sesión guardada
onMounted(verificarAutenticacion);
</script>

<template>
  <div>
    <Login v-if="!estaAutenticado" @loginExitoso="verificarAutenticacion" />

    <div v-else class="min-h-screen bg-gray-50 text-gray-800">
      
      <NavBar 
        :moduloActivo="moduloActivo" 
        :usuario="usuarioLogueado"
        @cambiarModulo="(m) => moduloActivo = m" 
        @cerrarSesion="cerrarSesion"
      />

      <div class="max-w-7xl mx-auto px-4 pb-8 space-y-6 mt-6">
        
        <div v-if="moduloActivo === 'finanzas'" class="space-y-6">
          <header class="flex justify-between items-center">
            <h2 class="text-2xl font-bold">Gestión Financiera</h2>
            <div class="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border">
              <input v-model="mesFiltro" type="month" class="text-sm border-none focus:ring-0">
            </div>
          </header>

          <ResumenTarjetas :ingresos="totalIngresos" :gastos="totalGastos" :saldo="saldoNeto" />
          <ProyeccionGastos :transacciones="transacciones" :mesFiltro="mesFiltro" />
          <PanelTarjetas :cuentas="cuentas" :transacciones="transaccionesFiltradas" />
          <PanelGraficos :transacciones="transaccionesFiltradas" :ingresosTotales="totalIngresos" :gastosTotales="totalGastos" @filtrarCategoria="toggleFiltroCategoria" />
          
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div class="lg:col-span-1">
              <FormularioTransaccion 
                :categorias="categorias" 
                :cuentas="cuentas" 
                :prestamos="prestamos" 
                @guardar="guardarTransaccion" 
              />
            </div>
            <div class="lg:col-span-3">
              <!-- Banner de filtro activo -->
              <div v-if="categoriaFiltroTabla" class="mb-4 bg-indigo-50 p-4 rounded-xl border border-indigo-200 flex justify-between items-center shadow-sm">
                <div>
                  <span class="text-sm text-indigo-800 font-bold">Mostrando solo: </span>
                  <span class="bg-indigo-600 text-white px-2 py-1 rounded text-sm font-bold shadow-sm">{{ categoriaFiltroTabla }}</span>
                  <span class="ml-4 text-sm font-bold text-indigo-900">Subtotal Gastos: <strong class="text-lg">${{ transaccionesTablaFiltradas.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + parseFloat(t.monto), 0).toFixed(2) }}</strong></span>
                </div>
                <button @click="categoriaFiltroTabla = null" class="text-sm bg-white border border-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-100 text-indigo-700 font-bold transition shadow-sm">
                  ✖ Limpiar Filtro
                </button>
              </div>
              <TablaMovimientos :transacciones="transaccionesTablaFiltradas" :mesFiltro="mesFiltro" @eliminar="eliminarTransaccion" />
            </div>
          </div>
        </div>

        <div v-else-if="moduloActivo === 'prestamos'" class="space-y-6">
          <header>
            <h2 class="text-2xl font-bold">Gestión de Préstamos</h2>
            <p class="text-gray-500">Registra tus obligaciones para automatizar el control de cuotas.</p>
          </header>
          <GestorPrestamos :prestamos="prestamos" @recargarPrestamos="recargarPrestamos" />
        </div>

        <div v-else-if="moduloActivo === 'configuracion'" class="space-y-6">
          <header>
            <h2 class="text-2xl font-bold">Gestión de Medios de Pago</h2>
            <p class="text-gray-500">Administra tus tarjetas, cupos y fechas de corte para proyectar tus pagos.</p>
          </header>
          <GestorCuentas :cuentas="cuentas" @recargarCuentas="recargarCuentas" />
        </div>

        <div v-else-if="moduloActivo === 'vehiculos'" class="bg-white p-12 rounded-xl shadow-sm text-center">
          <div class="text-6xl mb-4">🚗</div>
          <h2 class="text-2xl font-bold">Registro de Gastos Vehiculares</h2>
          <p class="text-gray-500">Mantenimiento, combustible y servicios. Próximamente.</p>
        </div>

        <div v-else-if="moduloActivo === 'usuarios'" class="space-y-6">
          <header>
            <h2 class="text-2xl font-bold">Panel de Administración</h2>
            <p class="text-gray-500">Gestiona los accesos y roles de la plataforma.</p>
          </header>
          <GestorUsuarios />
        </div>

        <div v-else-if="moduloActivo === 'conjunto'" class="space-y-6">
          <header class="flex justify-between items-center bg-indigo-50 p-6 rounded-xl border border-indigo-100">
            <div>
              <h2 class="text-2xl font-black text-indigo-900">Economía Familiar 💍</h2>
              <p class="text-indigo-600 text-sm mt-1">Visión consolidada de tus finanzas y las de tu pareja.</p>
            </div>
            <div class="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-indigo-200">
              <input v-model="mesFiltro" type="month" class="text-sm border-none focus:ring-0 text-indigo-900 font-bold">
            </div>
          </header>

          <ResumenTarjetas :ingresos="totalIngresosConjuntos" :gastos="totalGastosConjuntos" :saldo="saldoNetoConjunto" />
          
<div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <h3 class="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Desglose de Aportes (Ingresos)</h3>
              
              <div class="grid grid-cols-2 gap-4">
                
                <div class="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center flex flex-col justify-center">
                  <span class="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Aporte de {{ usuarioLogueado?.nombre }}</span>
                  <span class="font-black text-blue-600 text-2xl">
                    ${{ transaccionesConjuntasFiltradas.filter(t => t.usuario_id === usuarioLogueado.id && t.tipo === 'ingreso').reduce((s, t) => s + parseFloat(t.monto), 0).toFixed(2) }}
                  </span>
                </div>

                <div class="p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-center flex flex-col justify-center">
                  <span class="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-1">Aporte de Pareja</span>
                  <span class="font-black text-indigo-600 text-2xl">
                    ${{ transaccionesConjuntasFiltradas.filter(t => t.usuario_id === usuarioLogueado.pareja_id && t.tipo === 'ingreso').reduce((s, t) => s + parseFloat(t.monto), 0).toFixed(2) }}
                  </span>
                </div>
                
              </div>
            </div>
          
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold mb-4">Movimientos Compartidos</h3>
            <TablaMovimientos 
              :transacciones="transaccionesConjuntasFiltradas" 
              :mesFiltro="mesFiltro"
              @eliminar="eliminarTransaccion" 
            />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>