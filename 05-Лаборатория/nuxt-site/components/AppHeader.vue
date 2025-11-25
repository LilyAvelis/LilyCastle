<template>
  <header class="sticky top-0 z-50 bg-stone-50/80 backdrop-blur-sm shadow-sm">
    <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
      <!-- Логотип -->
      <div class="text-2xl font-bold text-stone-800">
        SweetBouquet 🌹
      </div>
      
      <!-- Навигация -->
      <nav class="hidden md:flex gap-8">
        <a href="#catalog" class="text-stone-700 hover:text-rose-400 transition">Каталог</a>
        <a href="#about" class="text-stone-700 hover:text-rose-400 transition">О нас</a>
        <a href="#contacts" class="text-stone-700 hover:text-rose-400 transition">Контакты</a>
      </nav>
      
      <!-- Кнопка -->
      <button class="bg-rose-400 text-white px-6 py-2 rounded-lg hover:bg-rose-500 transition">
        Заказать
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
// Липкий заголовок готов
</script>
