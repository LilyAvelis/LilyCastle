<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden group cursor-pointer">
    <!-- Image placeholder -->
    <div class="h-48 bg-gradient-to-br from-rose-200 to-orange-100 flex items-center justify-center text-6xl group-hover:scale-105 transition duration-300">
      🌸
    </div>

    <!-- Content -->
    <div class="p-6">
      <span class="text-xs font-semibold text-rose-400 uppercase tracking-wider">
        {{ category }}
      </span>
      <h3 class="text-xl font-bold text-stone-800 mt-2 mb-2">{{ title }}</h3>
      <p class="text-stone-600 text-sm mb-4">{{ description }}</p>

      <!-- Price and button -->
      <div class="flex justify-between items-center">
        <span class="text-2xl font-bold text-rose-400">₽{{ price }}</span>
        <button class="bg-rose-400 text-white px-4 py-2 rounded-lg hover:bg-rose-500 transition text-sm font-medium">
          Заказать
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  price: number
  category: string
  description: string
}>()
</script>
