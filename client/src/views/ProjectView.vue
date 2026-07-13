<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
// TODO: look up route.params.slug in projects.js;
// if not found → router.replace({ name: 'not-found' })
</script>

<template>
  <section class="px-4 md:px-6 py-16">
    <span class="microlabel text-ink-soft">work / {{ route.params.slug }}</span>
    <h1 class="text-xl mt-4">Project page — under construction</h1>
  </section>
</template>