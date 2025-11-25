<template>
  <section id="catalog" class="max-w-6xl mx-auto px-6 py-20">
    <h2 class="text-4xl font-bold text-stone-800 mb-12 text-center">
      Популярные композиции
    </h2>

    <div class="grid md:grid-cols-3 gap-8">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :title="product.title"
        :price="product.price"
        :category="product.category"
        :description="product.description"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Product {
  id: number
  title: string
  price: number
  category: string
  description: string
}

const products: Product[] = [
  {
    id: 1,
    title: 'Розовый рай',
    price: 2500,
    category: 'Клубника',
    description: 'Букет из клубники и роз'
  },
  {
    id: 2,
    title: 'Tropical Dreams',
    price: 3000,
    category: 'Экзот',
    description: 'Манго, ананас и цветы'
  },
  {
    id: 3,
    title: 'Chocolate Love',
    price: 2800,
    category: 'Шоколад',
    description: 'Клубника в шоколаде'
  },
  {
    id: 4,
    title: 'Цветочный микс',
    price: 3200,
    category: 'Премиум',
    description: 'Ягоды и свежие цветы'
  },
  {
    id: 5,
    title: 'Sweet Berries',
    price: 2600,
    category: 'Ягоды',
    description: 'Ежевика, малина, смородина'
  }
]
</script>
