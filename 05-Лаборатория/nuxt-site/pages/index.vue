<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Header (sticky) -->
    <AppHeader />

    <!-- Main content -->
    <main class="pt-20">
      <!-- Hero section -->
      <HeroSection />

      <!-- Features -->
      <div class="bg-white py-20">
        <FeatureList />
      </div>

      <!-- Product catalog -->
      <div class="py-20">
        <ProductCatalog />
      </div>
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import HeroSection from '~/components/HeroSection.vue'
import FeatureList from '~/components/FeatureList.vue'
import ProductCatalog from '~/components/ProductCatalog.vue'
import AppFooter from '~/components/AppFooter.vue'
</script>
