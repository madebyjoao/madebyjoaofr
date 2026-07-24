<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const project = ref(null);
const loading = ref(true);
const saving = ref(false);
const saved = ref(false);
const error = ref("");
const uploading = ref(false);
const dragIndex = ref(null);

const form = reactive({
  title: "", client: "", year: "", summary: "",
  services: "", stack: "",
  contexte: "", besoin: "", approche: "", resultat: "",
  link: "", status: "brouillon", sort_order: 0,
});

async function load() {
  loading.value = true;
  try {
    const { data } = await api.get(`/admin/projects/${route.params.id}`);
    project.value = data.project;
    for (const key of Object.keys(form)) form[key] = data.project[key] ?? "";
  } catch (err) {
    error.value = "Projet introuvable.";
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  saved.value = false;
  error.value = "";
  try {
    const payload = {};
    for (const [k, v] of Object.entries(form)) payload[k] = v === "" ? null : v;
    await api.patch(`/admin/projects/${route.params.id}`, payload);
    await load();
    saved.value = true;
  } catch (err) {
    error.value = "Enregistrement impossible.";
  } finally {
    saving.value = false;
  }
}

async function addImage(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append("image", file);
    await api.post(`/admin/projects/${route.params.id}/images`, fd);
    await load();
  } catch (err) {
    error.value = "Ajout de l'image impossible.";
  } finally {
    uploading.value = false;
    e.target.value = "";
  }
}

async function removeImage(imageId) {
  try {
    await api.delete(`/admin/projects/${route.params.id}/images/${imageId}`);
    await load();
  } catch (err) {
    error.value = "Suppression impossible.";
  }
}

// ── drag and drop ordering ──
function onDragStart(i) { dragIndex.value = i; }

function onDrop(i) {
  if (dragIndex.value === null || dragIndex.value === i) return;
  const imgs = [...project.value.images];
  const [moved] = imgs.splice(dragIndex.value, 1);
  imgs.splice(i, 0, moved);
  project.value.images = imgs;      // optimistic: reorder locally first
  dragIndex.value = null;
  persistOrder(imgs);
}

async function persistOrder(imgs) {
  try {
    await api.patch(`/admin/projects/${route.params.id}/images/order`, {
      order: imgs.map((img) => img.id),
    });
  } catch (err) {
    error.value = "Réordonnancement impossible.";
    await load();                   // server refused: snap back to truth
  }
}

const inputClass =
  "mt-2 w-full bg-surface-raised border border-line rounded-xs px-3 py-2 text-ink " +
  "transition-colors duration-(--dur-fast) ease-out-machined focus:outline-none focus:border-accent";

onMounted(load);
</script>

<template>
  <section class="px-4 md:px-6 py-8">
    <div class="max-w-4xl mx-auto w-full">
      <RouterLink
        :to="{ name: 'admin-projects' }"
        class="microlabel text-ink-soft hover:text-accent
               transition-colors duration-(--dur-fast) ease-out-machined"
      >← Retour aux projets</RouterLink>

      <p v-if="loading" class="microlabel text-ink-soft mt-8">Chargement…</p>

      <template v-else-if="project">
        <h1 class="text-lg mt-6">{{ project.title }}</h1>
        <p class="microlabel text-ink-soft mt-1">/{{ project.slug }}</p>

        <!-- images -->
        <div class="mt-8 border-t border-line pt-6">
          <span class="microlabel text-ink-soft">// images (glissez pour réordonner)</span>

          <div v-if="project.images?.length" class="grid grid-cols-3 md:grid-cols-5 gap-3 mt-3">
            <div
              v-for="(img, i) in project.images" :key="img.id"
              draggable="true"
              @dragstart="onDragStart(i)"
              @dragover.prevent
              @drop="onDrop(i)"
              class="border border-line rounded-xs p-2 cursor-move
                     hover:border-accent transition-colors duration-(--dur-fast) ease-out-machined"
            >
              <img
                :src="`/${img.path}`" :alt="img.original_name"
                class="w-full h-20 object-cover rounded-xs"
              />
              <div class="flex items-center justify-between mt-1">
                <span class="microlabel tabular text-ink-soft">{{ i + 1 }}</span>
                <button
                  @click="removeImage(img.id)"
                  class="microlabel text-ink-soft hover:text-accent
                         transition-colors duration-(--dur-fast) ease-out-machined"
                >×</button>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4 mt-4">
            <label
              class="microlabel text-ink border border-line hover:border-line-hover rounded-xs
                     px-3 py-2 cursor-pointer transition-colors duration-(--dur-fast) ease-out-machined"
            >
              Ajouter une image
              <input type="file" accept=".png,.jpg,.jpeg,.webp" class="hidden" @change="addImage" />
            </label>
            <span v-if="uploading" class="microlabel text-ink-soft">Envoi…</span>
          </div>
        </div>

        <!-- champs -->
        <div class="mt-8 border-t border-line pt-6 grid sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="microlabel text-ink-soft">Titre</label>
            <input v-model="form.title" type="text" :class="inputClass" />
          </div>
          <div>
            <label class="microlabel text-ink-soft">Client</label>
            <input v-model="form.client" type="text" :class="inputClass" />
          </div>
          <div>
            <label class="microlabel text-ink-soft">Année</label>
            <input v-model="form.year" type="number" :class="inputClass" />
          </div>
          <div class="sm:col-span-2">
            <label class="microlabel text-ink-soft">Résumé (carte)</label>
            <textarea v-model="form.summary" rows="2" :class="inputClass"></textarea>
          </div>
          <div>
            <label class="microlabel text-ink-soft">Services (séparés par des virgules)</label>
            <input v-model="form.services" type="text" :class="inputClass" />
          </div>
          <div>
            <label class="microlabel text-ink-soft">Stack (séparés par des virgules)</label>
            <input v-model="form.stack" type="text" :class="inputClass" />
          </div>

          <div class="sm:col-span-2">
            <label class="microlabel text-accent">Contexte</label>
            <textarea v-model="form.contexte" rows="3" :class="inputClass"></textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="microlabel text-accent">Besoin</label>
            <textarea v-model="form.besoin" rows="3" :class="inputClass"></textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="microlabel text-accent">Approche</label>
            <textarea v-model="form.approche" rows="3" :class="inputClass"></textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="microlabel text-accent">Résultat</label>
            <textarea v-model="form.resultat" rows="3" :class="inputClass"></textarea>
          </div>

          <div>
            <label class="microlabel text-ink-soft">Lien</label>
            <input v-model="form.link" type="text" :class="inputClass" />
          </div>
          <div>
            <label class="microlabel text-ink-soft">Ordre d'affichage</label>
            <input v-model="form.sort_order" type="number" :class="inputClass" />
          </div>
          <div class="sm:col-span-2">
            <label class="microlabel text-ink-soft">Statut</label>
            <select v-model="form.status" :class="inputClass">
              <option value="brouillon">Brouillon</option>
              <option value="publie">Publié</option>
            </select>
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
          <span v-if="error" class="microlabel text-accent">{{ error }}</span>
        </div>
      </template>
    </div>
  </section>
</template>