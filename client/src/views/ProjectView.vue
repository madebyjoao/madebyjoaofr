<script setup>
import { computed, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const router = useRouter();

const project = ref(null);
const loading = ref(true);
const notFound = ref(false);

// re-runs when the slug changes — the router reuses this component
watchEffect(async () => {
  const slug = route.params.slug;
  if (!slug) return;
  loading.value = true;
  notFound.value = false;
  try {
    const { data } = await api.get(`/projects/${slug}`);
    project.value = data.project;
    document.title = `${data.project.title} — madebyjoao`;
  } catch (err) {
    project.value = null;
    notFound.value = true;
  } finally {
    loading.value = false;
  }
});

// redirect only once we KNOW it doesn't exist, never while loading
watchEffect(() => {
  if (notFound.value) router.replace({ name: "not-found" });
});

const storyBlocks = computed(() =>
  project.value
    ? [
        ["contexte", project.value.story.contexte],
        ["besoin", project.value.story.besoin],
        ["approche", project.value.story.approche],
        ["résultat", project.value.story.resultat],
      ]
    : [],
);
</script>

<template>
  <article v-if="project" class="px-4 md:px-6 py-18">
    <div class="max-w-6xl mx-auto">
      <span class="microlabel text-ink-soft">{{ project.client }} — {{ project.year }}</span>
      <h1 class="text-xl mt-4">{{ project.title }}</h1>
      <p class="text-md text-ink-soft mt-4 max-w-2xl">{{ project.summary }}</p>

      <div class="grid lg:grid-cols-2 gap-10 lg:gap-16 mt-16">
        <!-- récit -->
        <div class="space-y-10">
          <div v-for="[label, text] in storyBlocks" :key="label">
            <h2 class="microlabel text-accent">{{ label }}</h2>
            <p class="text-ink mt-3">{{ text }}</p>
          </div>

          <p class="microlabel">
            <a
              :href="project.link" target="_blank" rel="noopener"
              class="text-ink hover:text-accent
                     transition-colors duration-(--dur-fast) ease-out-machined"
            >
              Visiter le site <span class="text-accent">→</span>
            </a>
          </p>
        </div>

        <!-- galerie : 1 grande + 4 petites, reste visible pendant la lecture -->
        <div v-if="project.images?.length" class="lg:sticky lg:top-28 lg:self-start">
          <a
            :href="project.images[0]" target="_blank" rel="noopener"
            class="block border border-line hover:border-accent rounded-xs overflow-hidden
                   transition-colors duration-(--dur-fast) ease-out-machined"
          >
            <img
              :src="project.images[0]" :alt="`${project.title}, aperçu principal`"
              class="w-full aspect-video object-cover"
            />
          </a>

          <div v-if="project.images.length > 1" class="grid grid-cols-4 gap-3 mt-3">
            <a
              v-for="(img, i) in project.images.slice(1, 5)" :key="img"
              :href="img" target="_blank" rel="noopener"
              class="block border border-line hover:border-accent rounded-xs overflow-hidden
                     transition-colors duration-(--dur-fast) ease-out-machined"
            >
              <img
                :src="img" :alt="`${project.title}, aperçu ${i + 2}`"
                class="w-full aspect-4/3 object-cover"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>