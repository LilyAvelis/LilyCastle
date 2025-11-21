<script lang="ts">
  let message = 'Привет, Камбала!';
</script>

<div class="min-h-screen bg-blue-200 flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-blue-800 mb-4">🐟 Камбала в Аквариуме</h1>
    <p class="text-xl text-blue-600 mb-6">{message}</p>
    <button
      on:click={() => message = 'Ты кликнула на рыбу!'}
      class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
    >
      Кликни на рыбу
    </button>
  </div>
</div>
