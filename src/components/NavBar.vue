<script setup>
defineProps(['moduloActivo', 'usuario']);
defineEmits(['cambiarModulo', 'cerrarSesion']);
</script>

<template>
  <nav class="bg-gray-900 text-white shadow-lg mb-6">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between h-16">
        <div class="flex items-center gap-8">
          <div class="text-xl font-bold flex items-center gap-2">
            <span class="text-blue-400">📊</span> MisFinanzas
          </div>
          
          <div class="flex gap-4">
            <button 
              @click="$emit('cambiarModulo', 'finanzas')"
              :class="['px-3 py-2 rounded-md text-sm font-medium transition-colors', 
                       moduloActivo === 'finanzas' ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800']"
            >
              Finanzas
            </button>
          <button 
              @click="$emit('cambiarModulo', 'configuracion')"
              :class="['px-3 py-2 rounded-md text-sm font-medium transition-colors', 
                       moduloActivo === 'configuracion' ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800']"
            >
              Tarjetas y Cuentas
            </button>
            <button 
              @click="$emit('cambiarModulo', 'vehiculos')"
              :class="['px-3 py-2 rounded-md text-sm font-medium transition-colors', 
                       moduloActivo === 'vehiculos' ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800']"
            >
              Vehículos
            </button>
            <button 
            @click="$emit('cambiarModulo', 'prestamos')"
            :class="['px-3 py-2 rounded-md text-sm font-medium transition-colors', 
                    moduloActivo === 'prestamos' ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800']"
          >
            Mis Préstamos
          </button>
              <button 
            v-if="usuario && usuario.pareja_id"
            @click="$emit('cambiarModulo', 'conjunto')"
            :class="['px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2', 
                    moduloActivo === 'conjunto' ? 'bg-indigo-900 text-indigo-400' : 'hover:bg-gray-800 text-indigo-300']"
          >
            <span class="text-xs">💍</span> Resumen Conjunto
          </button>
          <button 
              v-if="usuario && usuario.rol === 'admin'"
              @click="$emit('cambiarModulo', 'usuarios')"
              :class="['px-3 py-2 rounded-md text-sm font-medium transition-colors', 
                       moduloActivo === 'usuarios' ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 text-purple-200']"
            >
              👥 Usuarios
            </button>
          </div>
        </div>
        
      <div v-if="usuario" class="flex items-center gap-4 hidden md:flex">
        <span class="text-sm text-gray-300">Hola, {{ usuario.nombre }}</span>
        <button @click="$emit('cerrarSesion')" class="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors">
          Salir
        </button>
      </div>
      </div>
    </div>
  </nav>
</template>