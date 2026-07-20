<script setup>
import { projects } from '@/data/projects'
</script>

<template>
  <section id="travaux" class="snap-start min-h-full flex flex-col justify-center px-4 md:px-6 ">
    <div class="max-w-5xl mx-auto w-full md:py-20 md:px-2 overflow-y-scroll">
      <span class="microlabel text-ink-soft">03 / travaux</span>
      <hr class="border-line" />
      <h2 class="text-lg mt-4">Projets sélectionnés</h2>

      <div class="grid md:grid-cols-2 gap-4 md:gap-8 mt-12">
        <RouterLink
          v-for="(project, i) in projects"
          :key="project.slug"
          :to="{ name: 'project', params: { slug: project.slug } }"
          class="group block bg-surface-raised border border-line hover:border-line-hover
                 rounded-xs p-6 transition-colors duration-(--dur-fast) ease-out-machined"
        >
          <span class="microlabel tabular text-ink-soft">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3 class="text-md mt-4">{{ project.title }}</h3>
          <p class="text-ink-soft mt-4">{{ project.summary }}</p>
          <p class="microlabel text-ink-soft mt-6">{{ project.services.join(' · ') }}</p>
          <span class="microlabel text-ink mt-6 inline-block">
            Voir le projet <span class="text-accent">→</span>
          </span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>