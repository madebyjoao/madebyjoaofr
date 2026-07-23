<script setup>
import { ref } from 'vue'
import { useProjects } from '@/composables/useProjects'


const { projects, error } = useProjects()

const track = ref(null)

function scroll(direction) {
  const el = track.value
  if (!el) return
  // no behavior argument: the track's CSS scroll-behavior decides,
  // so reduced-motion is respected automatically
  el.scrollBy({ left: direction * el.clientWidth * 0.85 })
}
</script>

<template>
  <section
    id="travaux"
    class="snap-start min-h-full flex flex-col justify-center px-4 md:px-6"
  >
    <div class="max-w-5xl mx-auto w-full">
      <div class="flex items-end justify-between gap-6">
        <div>
          <span class="microlabel text-ink-soft">03 / travaux</span>
          <h2 class="text-lg mt-4">Projets</h2>
        </div>

        <div v-if="projects?.length > 3" class="hidden md:flex items-center gap-2 shrink-0">
          <button
            @click="scroll(-1)"
            aria-label="Projets précédents"
            class="microlabel text-ink-soft hover:text-accent border border-line
                   hover:border-line-hover rounded-xs px-3 py-2
                   transition-colors duration-(--dur-fast) ease-out-machined"
          >←</button>
          <button
            @click="scroll(1)"
            aria-label="Projets suivants"
            class="microlabel text-ink-soft hover:text-accent border border-line
                   hover:border-line-hover rounded-xs px-3 py-2
                   transition-colors duration-(--dur-fast) ease-out-machined"
          >→</button>
        </div>
      </div>


      <p v-if="error" class="microlabel text-accent mt-10">{{ error }}</p>

      <div v-else-if="!projects" class="flex gap-4 md:gap-6 mt-10">
        <div
          v-for="n in 3" :key="n"
          class="shrink-0 w-[85%] sm:w-[48%] lg:w-[31.5%] h-56
                bg-surface-raised border border-line rounded-xs opacity-60"
        ></div>
      </div>

      <div
        v-else
        ref="track"
        class="flex gap-4 md:gap-6 mt-10 overflow-x-auto snap-x snap-mandatory
              no-scrollbar motion-safe:scroll-smooth pb-1"
      >
        <RouterLink
          v-for="(project, i) in projects"
          :key="project.slug + i"
          :to="{ name: 'project', params: { slug: project.slug } }"
          class="group snap-start shrink-0 w-[85%] sm:w-[48%] lg:w-[31.5%]
                 bg-surface-raised border border-line hover:border-line-hover
                 rounded-xs p-6 transition-colors duration-(--dur-fast) ease-out-machined"
        >
          <span class="microlabel tabular text-ink-soft">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <h3 class="text-md mt-4">{{ project.title }}</h3>
          <p class="text-ink-soft mt-4">{{ project.summary }}</p>
          <p class="microlabel text-ink-soft mt-6">{{ project.services.join(' · ') }}</p>
          <span class="microlabel text-ink mt-6 inline-block">
            Voir le projet <span class="text-accent">→</span>
          </span>
        </RouterLink>
      </div>

      <p v-if="projects?.length > 3" class="microlabel text-ink-soft mt-6 md:hidden">
        Faites glisser pour voir plus →
      </p>
    </div>
  </section>
</template>