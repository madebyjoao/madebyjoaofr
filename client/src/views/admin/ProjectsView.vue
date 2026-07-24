<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/lib/api";

const router = useRouter();
const projects = ref([]);
const loading = ref(true);
const error = ref("");
const newTitle = ref("");
const creating = ref(false);

async function load() {
  try {
    const { data } = await api.get("/admin/projects");
    projects.value = data.projects;
  } catch (err) {
    error.value = "Impossible de charger les projets.";
  } finally {
    loading.value = false;
  }
}

async function create() {
  if (!newTitle.value.trim()) return;
  creating.value = true;
  try {
    const { data } = await api.post("/admin/projects", { title: newTitle.value });
    router.push({ name: "admin-project", params: { id: data.project.id } });
  } catch (err) {
    error.value = "Création impossible.";
  } finally {
    creating.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section class="px-4 md:px-6 py-8">
    <div class="max-w-4xl mx-auto w-full">
      <span class="microlabel text-ink-soft">// administration</span>
      <h1 class="text-lg mt-2">Projets</h1>

      <div class="flex items-center gap-3 mt-8">
        <input
          v-model="newTitle" type="text" placeholder="Titre du nouveau projet"
          @keyup.enter="create"
          class="flex-1 bg-surface-raised border border-line rounded-xs px-4 py-2.5 text-ink
                 transition-colors duration-(--dur-fast) ease-out-machined
                 focus:outline-none focus:border-accent"
        />
        <button
          @click="create" :disabled="creating || !newTitle.trim()"
          class="microlabel text-ink border border-line hover:border-line-hover rounded-xs
                 px-4 py-2.5 transition-colors duration-(--dur-fast) ease-out-machined
                 disabled:opacity-50"
        >Créer</button>
      </div>

      <p v-if="loading" class="microlabel text-ink-soft mt-8">Chargement…</p>
      <p v-else-if="error" class="microlabel text-accent mt-8">{{ error }}</p>

      <div v-else class="mt-8 space-y-2">
        <RouterLink
          v-for="p in projects" :key="p.id"
          :to="{ name: 'admin-project', params: { id: p.id } }"
          class="block bg-surface-raised border border-line hover:border-line-hover
                 rounded-xs p-4 transition-colors duration-(--dur-fast) ease-out-machined"
        >
          <div class="flex items-center justify-between gap-4">
            <span class="text-ink">{{ p.title }}</span>
            <span class="microlabel" :class="p.status === 'publie' ? 'text-accent' : 'text-ink-soft'">
              {{ p.status === 'publie' ? 'Publié' : 'Brouillon' }}
            </span>
          </div>
          <p class="microlabel text-ink-soft mt-1">/{{ p.slug }}</p>
        </RouterLink>
      </div>
    </div>
  </section>
</template>