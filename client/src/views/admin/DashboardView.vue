<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useRouter } from "vue-router";

const router = useRouter();

const requests = ref([]);
const loading = ref(true);
const error = ref("");

// pretty labels for the stored values
const TYPE_LABELS = {
  vitrine: "Site vitrine",
  "sur-mesure": "Outil sur mesure",
  refonte: "Refonte",
  autre: "Autre",
};

const STATUS_LABELS = {
  nouveau: "Nouveau",
  lu: "Lu",
  en_discussion: "En discussion",
  devis_envoye: "Devis envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
  archive: "Archivé",
};

const newCount = computed(
  () => requests.value.filter((r) => r.status === "nouveau").length
);

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function logout() {
  clearToken();
  router.push("/admin/login");
}

onMounted(async () => {
  try {
    const { data } = await api.get("/admin/requests");
    requests.value = data.requests;
  } catch (err) {
    error.value = "Impossible de charger les demandes.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="px-4 md:px-6 py-12">
    <div class="max-w-5xl mx-auto w-full">
      <!-- header -->
      <div class="flex items-center justify-between">
        <div>
          <span class="microlabel text-ink-soft">// administration</span>
          <h1 class="text-lg mt-2">Demandes</h1>
        </div>
        <button
          @click="logout"
          class="microlabel text-ink-soft hover:text-accent
                 transition-colors duration-(--dur-fast) ease-out-machined"
        >
          Déconnexion
        </button>
      </div>

      <!-- counters -->
      <p v-if="!loading && !error" class="microlabel text-ink-soft mt-6">
        <span class="tabular">{{ requests.length }}</span> demande(s) —
        <span class="text-accent tabular">{{ newCount }}</span> nouvelle(s)
      </p>

      <!-- states -->
      <p v-if="loading" class="microlabel text-ink-soft mt-12">Chargement…</p>
      <p v-else-if="error" class="microlabel text-accent mt-12">{{ error }}</p>
      <p v-else-if="!requests.length" class="text-ink-soft mt-12">
        Aucune demande pour le moment.
      </p>

      <!-- the list -->
      <div v-else class="mt-8 space-y-3">
        <article
          v-for="request in requests"
          :key="request.id"
          class="bg-surface-raised border border-line hover:border-line-hover rounded-xs p-5
                 transition-colors duration-(--dur-fast) ease-out-machined"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-3">
                <span class="microlabel tabular text-ink-soft">#{{ request.id }}</span>
                <span
                  class="microlabel"
                  :class="request.status === 'nouveau' ? 'text-accent' : 'text-ink-soft'"
                >{{ STATUS_LABELS[request.status] }}</span>
              </div>

              <h2 class="text-md mt-2">{{ request.nom }}</h2>
              <p class="microlabel text-ink-soft mt-1">
                {{ TYPE_LABELS[request.type] }} — {{ request.email }}
              </p>
              <p class="text-ink-soft mt-3 line-clamp-2">{{ request.description }}</p>
            </div>

            <div class="text-right shrink-0">
              <p class="microlabel tabular text-ink-soft">{{ formatDate(request.created_at) }}</p>
              <p v-if="request.images.length" class="microlabel text-accent mt-2">
                <span class="tabular">{{ request.images.length }}</span> croquis
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>