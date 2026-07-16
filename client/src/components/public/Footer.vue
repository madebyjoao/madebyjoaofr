<script setup>
import { ref } from 'vue'
import { ChevronUp } from '@primeicons/vue'

const isFooterOpen = ref(false)
const toggleFooter = () => (isFooterOpen.value = !isFooterOpen.value)
</script>

<template>
  <!-- one moving unit: wrapper slides, button rides on its shoulder -->
  <div
    class="fixed bottom-0 left-0 w-full z-(--z-nav) transition-transform duration-(--dur-base) ease-out-machined"
    :class="isFooterOpen ? 'translate-y-0' : 'translate-y-full'"
  >
    <button
      class="absolute -top-12 left-1/2 -translate-x-1/2 p-3
             transition-transform duration-(--dur-fast) ease-out-machined
             hover:-translate-y-1"
      :aria-expanded="isFooterOpen"
      aria-controls="site-footer"
      @click="toggleFooter"
    >
      <ChevronUp
        class="transition-transform duration-(--dur-base) ease-out-machined"
        :class="isFooterOpen && 'rotate-180'"
      />
      <span class="sr-only">Toggle footer</span>
    </button>

    <footer id="site-footer" class="bg-inverse border-t border-inverse-line">
        <div class="max-w-5xl mx-auto px-4 md:px-6 py-6">
            <p class="microlabel text-inverse-ink-soft">© 2026 madebyjoao — 43.70°N 7.26°E</p>
        </div>
    </footer>
  </div>
</template>