<template>
  <div class="min-h-screen bg-green-100 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-green-800 mb-4">
        🐟 Скумбрия в Аквариуме
      </h1>
      <p class="text-xl text-green-600 mb-6">{{ message }}</p>
      <button
        @click="changeMessage"
        class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-700 transition"
      >
        Кликни на рыбу
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const message = ref("Привет, Скумбрия!");

const changeMessage = () => {
  message.value = "Ты кликнула на рыбу!";
};
</script>
