<script setup>
import { ref, reactive, watch } from "vue";
import api from "@/lib/api";

const props = defineProps({ id: { type: [String, Number], required: true } });
const emit = defineEmits(["updated"]);

const request = ref(null);
const loading = ref(true);
const loadError = ref("");
const saveError = ref("");
const saving = ref(false);
const saved = ref(false);

const form = reactive({
  status: "", phone: "", phone_secondary: "", address: "", current_website: "",
  budget: "", quote_amount: "", approved_amount: "", timeline: "",
  follow_up_date: "", notes: "",
});

const TYPE_LABELS = {
  vitrine: "Site vitrine", "sur-mesure": "Outil sur mesure",
  refonte: "Refonte", autre: "Autre",
};

const STATUSES = [
  { value: "nouveau", label: "Nouveau" },
  { value: "lu", label: "Lu" },
  { value: "en_discussion", label: "En discussion" },
  { value: "devis_envoye", label: "Devis envoyé" },
  { value: "accepte", label: "Accepté" },
  { value: "refuse", label: "Refusé" },
  { value: "archive", label: "Archivé" },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// re-fetch whenever the selected id changes — the component is reused, not remounted
async function load(id) {
  loading.value = true;
  saved.value = false;
  loadError.value = "";
  try {
    const { data } = await api.get(`/admin/requests/${id}`);
    request.value = data.request;
    for (const key of Object.keys(form)) form[key] = data.request[key] ?? "";
  } catch (err) {
    loadError.value = "Demande introuvable.";
    request.value = null;
  } finally {
    loading.value = false;
  }
}

watch(() => props.id, load, { immediate: true });

async function save() {
  saving.value = true;
  saved.value = false;
  saveError.value = "";
  try {
    const payload = {};
    for (const [k, v] of Object.entries(form)) payload[k] = v === "" ? null : v;

    await api.patch(`/admin/requests/${props.id}`, payload);
    await load(props.id);      // re-read server truth — the panel always shows what's stored
    saved.value = true;
  } catch (err) {
    console.error("SAVE ERROR:", err);
    saveError.value = "Enregistrement impossible.";
  } finally {
    saving.value = false;
  }
  if (saved.value && request.value) emit("updated", request.value);
}

const inputClass =
  "mt-2 w-full bg-surface border border-line rounded-xs px-3 py-2 text-ink " +
  "transition-colors duration-(--dur-fast) ease-out-machined focus:outline-none focus:border-accent";
</script>

<template>
  <div class="bg-surface-raised border border-line rounded-xs p-5">
    <p v-if="loading" class="microlabel text-ink-soft">Chargement…</p>
    <p v-else-if="!request" class="microlabel text-accent">{{ loadError }}</p>

    <template v-else>
      <!-- client's original inquiry — read-only record -->
      <div class="flex items-baseline justify-between gap-4">
        <h2 class="text-md">{{ request.nom }}</h2>
        <span class="microlabel tabular text-ink-soft shrink-0">
          #{{ request.id }} — {{ formatDate(request.created_at) }}
        </span>
      </div>
      <p class="microlabel text-ink-soft mt-2">
        {{ TYPE_LABELS[request.type] }} —
        <a :href="`mailto:${request.email}`" class="text-accent">{{ request.email }}</a>
      </p>
      <p class="text-ink mt-4 whitespace-pre-line">{{ request.description }}</p>

      <!-- sketches -->
      <div v-if="request.images?.length" class="mt-6 border-t border-line pt-6">
        <span class="microlabel text-ink-soft">// croquis</span>
        <div class="grid grid-cols-3 gap-3 mt-3">
          <a
            v-for="img in request.images"
            :key="img.id"
            :href="`http://localhost:3000/${img.path}`"
            target="_blank"
            rel="noopener"
            class="block border border-line hover:border-accent rounded-xs p-2
                   transition-colors duration-(--dur-fast) ease-out-machined"
          >
            <img
              v-if="!img.path.endsWith('.pdf')"
              :src="`http://localhost:3000/${img.path}`"
              :alt="img.original_name"
              class="w-full h-20 object-cover rounded-xs"
            />
            <p class="microlabel text-ink-soft mt-1 truncate">{{ img.original_name }}</p>
          </a>
        </div>
      </div>

      <!-- the CRM half — editable -->
      <div class="mt-6 border-t border-line pt-6">
        <span class="microlabel text-accent">// suivi</span>

        <div class="grid sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label class="microlabel text-ink-soft">Statut</label>
            <select v-model="form.status" :class="inputClass">
              <option v-for="s in STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
          <div>
            <label class="microlabel text-ink-soft">Relance prévue le</label>
            <input v-model="form.follow_up_date" type="date" :class="inputClass" />
          </div>
          <div>
            <label class="microlabel text-ink-soft">Téléphone</label>
            <input v-model="form.phone" type="tel" :class="inputClass" />
          </div>
          <div>
            <label class="microlabel text-ink-soft">Téléphone 2</label>
            <input v-model="form.phone_secondary" type="tel" :class="inputClass" />
          </div>
          <div class="sm:col-span-2">
            <label class="microlabel text-ink-soft">Adresse</label>
            <input v-model="form.address" type="text" :class="inputClass" />
          </div>
          <div class="sm:col-span-2">
            <label class="microlabel text-ink-soft">Site actuel</label>
            <input v-model="form.current_website" type="text" :class="inputClass" />
          </div>
          <div>
            <label class="microlabel text-ink-soft">Budget annoncé</label>
            <input v-model="form.budget" type="text" :class="inputClass" />
          </div>
          <div>
            <label class="microlabel text-ink-soft">Délais</label>
            <input v-model="form.timeline" type="text" :class="inputClass" />
          </div>
          <div>
            <label class="microlabel text-ink-soft">Devis (€)</label>
            <input v-model="form.quote_amount" type="number" step="0.01" :class="inputClass" />
          </div>
          <div>
            <label class="microlabel text-ink-soft">Montant accepté (€)</label>
            <input v-model="form.approved_amount" type="number" step="0.01" :class="inputClass" />
          </div>
          <div class="sm:col-span-2">
            <label class="microlabel text-ink-soft">Notes privées</label>
            <textarea v-model="form.notes" rows="4" :class="inputClass"></textarea>
          </div>
        </div>

        <div class="flex items-center gap-4 mt-6">
          <button
            @click="save" :disabled="saving"
            class="inline-flex items-center gap-2 microlabel text-ink
                   border border-line hover:border-line-hover rounded-xs px-5 py-2.5
                   transition-colors duration-(--dur-fast) ease-out-machined disabled:opacity-50"
          >
            {{ saving ? "Enregistrement…" : "Enregistrer" }}
            <span class="text-accent">→</span>
          </button>
          <span v-if="saved" class="microlabel text-accent">enregistré ✓</span>
          <span v-if="saveError" class="microlabel text-accent">{{ saveError }}</span>
        </div>
      </div>
    </template>
  </div>
</template>