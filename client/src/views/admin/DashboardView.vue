<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/lib/api";
import { clearToken } from "@/lib/auth";
import RequestDetail from "@/components/admin/RequestDetail.vue";

const route = useRoute();
const router = useRouter();

const requests = ref([]);
const loading = ref(true);
const error = ref("");

const selectedId = computed(() => route.params.id ?? null);

const TYPE_LABELS = {
  vitrine: "Site vitrine", "sur-mesure": "Outil sur mesure",
  refonte: "Refonte", autre: "Autre",
};
const STATUS_LABELS = {
  nouveau: "Nouveau", lu: "Lu", en_discussion: "En discussion",
  devis_envoye: "Devis envoyé", accepte: "Accepté",
  refuse: "Refusé", archive: "Archivé",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

function select(id) {
  router.push({ name: "admin-request", params: { id } });
}
function clearSelection() {
  router.push({ name: "admin-dashboard" });
}
function logout() {
  clearToken();
  router.push("/admin/login");
}

// keep the list in sync when the detail saves
function onUpdated(fresh) {
  const i = requests.value.findIndex((r) => r.id === fresh.id);
  if (i !== -1) requests.value[i] = { ...requests.value[i], ...fresh };
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
  <section class="px-4 md:px-6 py-8">
    <div class="max-w-6xl mx-auto w-full">
      <div class="flex items-center justify-between">
        <div>
          <span class="microlabel text-ink-soft">// administration</span>
          <h1 class="text-lg mt-2">Demandes</h1>
        </div>
        <button @click="logout"
          class="microlabel text-ink-soft hover:text-accent
                 transition-colors duration-(--dur-fast) ease-out-machined">
          Déconnexion
        </button>
      </div>

      <p v-if="loading" class="microlabel text-ink-soft mt-10">Chargement…</p>
      <p v-else-if="error" class="microlabel text-accent mt-10">{{ error }}</p>

      <div v-else class="grid md:grid-cols-[280px_1fr] gap-6 mt-8">
        <!-- LIST (hidden on mobile when a lead is open) -->
        <div :class="selectedId ? 'hidden md:block' : 'block'">
          <p class="microlabel text-ink-soft mb-3">
            <span class="tabular">{{ requests.length }}</span> demande(s)
          </p>
          <div class="space-y-2">
            <button
              v-for="r in requests" :key="r.id"
              @click="select(r.id)"
              class="w-full text-left bg-surface-raised border rounded-xs p-3
                     transition-colors duration-(--dur-fast) ease-out-machined"
              :class="String(r.id) === String(selectedId)
                ? 'border-accent' : 'border-line hover:border-line-hover'"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="microlabel"
                  :class="r.status === 'nouveau' ? 'text-accent' : 'text-ink-soft'">
                  {{ STATUS_LABELS[r.status] }}
                </span>
                <span class="microlabel tabular text-ink-soft">{{ formatDate(r.created_at) }}</span>
              </div>
              <p class="text-ink mt-1 truncate">{{ r.nom }}</p>
              <p class="microlabel text-ink-soft truncate">{{ TYPE_LABELS[r.type] }}</p>
            </button>
          </div>
        </div>

        <!-- DETAIL -->
        <div :class="selectedId ? 'block' : 'hidden md:block'">
          <button v-if="selectedId" @click="clearSelection"
            class="microlabel text-ink-soft hover:text-accent md:hidden mb-3
                   transition-colors duration-(--dur-fast) ease-out-machined">
            ← Retour à la liste
          </button>

          <RequestDetail v-if="selectedId" :id="selectedId" @updated="onUpdated" />

          <div v-else class="border border-line border-dashed rounded-xs p-10 text-center">
            <p class="microlabel text-ink-soft">Sélectionnez une demande</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>