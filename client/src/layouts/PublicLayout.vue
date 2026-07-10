<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import Navbar from '@/components/public/Navbar.vue'
import Footer from '@/components/public/Footer.vue'

const route = useRoute()
const fullHeight = computed(() => route.meta.fullHeight === true)
</script>

<template>
  <div
    class="flex flex-col"
    :class="fullHeight ? 'h-dvh overflow-hidden' : 'min-h-dvh'"
  >
    <header class="shrink-0 flex w-full md:items-center md:justify-around">
      <img alt="Logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
      <Navbar />
    </header>

    <main class="flex-1" :class="fullHeight ? 'min-h-0 overflow-y-auto' : ''">
      <RouterView />
    </main>

    <Footer />
  </div>
</template>
