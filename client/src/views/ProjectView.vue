<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { projects } from '@/data/projects'

const route = useRoute()
const router = useRouter()

// computed, not a one-time lookup: the router REUSES this component
// between /work/a and /work/b — only the param changes
const project = computed(() =>
  projects.find((p) => p.slug === route.params.slug),
)

// existence check + per-project title, re-run whenever the slug changes
watchEffect(() => {
  if (!project.value) {
    router.replace({ name: 'not-found' }) // replace: dead URL stays out of history
  } else {
    document.title = `${project.value.title} — madebyjoao`
  }
})

const storyBlocks = computed(() =>
  project.value
    ? [
        ['contexte', project.value.story.contexte],
        ['besoin', project.value.story.besoin],
        ['approche', project.value.story.approche],
        ['résultat', project.value.story.resultat],
      ]
    : [],
)
</script>

<template>
  <article v-if="project" class="px-4 md:px-6 py-18">
    <div class="max-w-5xl mx-auto">
      <span class="microlabel text-ink-soft">{{ project.client }} — {{ project.year }}</span>
      <h1 class="text-xl mt-4">{{ project.title }}</h1>
      <p class="text-md text-ink-soft mt-4 max-w-2xl">{{ project.summary }}</p>

      <div class="mt-16 space-y-12 max-w-2xl">
        <div v-for="[label, text] in storyBlocks" :key="label">
          <h2 class="microlabel text-accent">{{ label }}</h2>
          <p class="text-ink mt-4">{{ text }}</p>
        </div>
      </div>

      <p class="microlabel mt-16">
        <a :href="project.link" target="_blank" rel="noopener" class="text-ink hover:text-accent
           transition-colors duration-(--dur-fast) ease-out-machined">
          Visiter le site <span class="text-accent">→</span>
        </a>
      </p>
    </div>
  </article>
</template>