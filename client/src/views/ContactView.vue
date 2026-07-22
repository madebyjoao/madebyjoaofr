<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { contactSchema, validateContact, PROJECT_TYPES } from '@/schemas/contact'
import api from "@/lib/api";

// ── form state ──────────────────────────────────────────────────────────────
const form = reactive({
  nom: '',
  email: '',
  type: '',
  description: '',
  website: '', // honeypot — never shown to humans
})

// Three visible states: 'form' → 'validated' (upload revealed) → 'done'
const stage = ref('form')

const errors = ref({})           // { field: message }
const touched = reactive({})     // { field: true } — only show errors after blur
const submitting = ref(false)
const serverError = ref('')      // filled by a failed request (later)

// Live validation: re-check on every change, but only surface an error for a
// field the user has already left (touched) — no scolding while they type.
watch(
  form,
  () => {
    const { errors: e } = validateContact(form)
    errors.value = e
  },
  { deep: true, immediate: true },
)

const isValid = computed(() => Object.keys(errors.value).length === 0)

function showError(field) {
  return touched[field] ? errors.value[field] : ''
}

// ── STEP ONE submit ───────────────────────────────────────────────────────
async function submitStepOne() {
  // mark all fields touched so any remaining errors surface
  for (const f of ['nom', 'email', 'type', 'description']) touched[f] = true
  const { success } = validateContact(form)
  if (!success) return

  submitting.value = true
  serverError.value = ''
  try {
    await api.post("/contact", {
      nom: form.nom,
      email: form.email,
      type: form.type,
      description: form.description,
    });
    stage.value = "validated";
  } catch (err) {
    serverError.value = "Un problème est survenu. Réessayez.";
  } finally {
    submitting.value = false;
  }
}

// ── STEP TWO (optional file) ────────────────────────────────────────────────
const file = ref(null)
const fileError = ref('')
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
const MAX_BYTES = 10 * 1024 * 1024

function onFilePick(e) {
  fileError.value = ''
  const picked = e.target.files?.[0]
  if (!picked) return
  // Frontend courtesy checks — the server re-checks by magic numbers later.
  if (!ACCEPTED.includes(picked.type)) {
    fileError.value = 'Formats acceptés : PNG, JPG, WEBP ou PDF.'
    return
  }
  if (picked.size > MAX_BYTES) {
    fileError.value = 'Fichier trop lourd (10 Mo maximum).'
    return
  }
  file.value = picked
}

async function submitStepTwo() {
  submitting.value = true
  serverError.value = ''
  try {
    // TODO: wire to backend.
    //   const fd = new FormData()
    //   fd.append('sketch', file.value)
    //   await api.post('/api/contact/upload', fd, { headers: { 'X-Devis-Token': token } })
    //   server verifies the TOKEN from step one, then validates the file.
    await new Promise((r) => setTimeout(r, 400))
    stage.value = 'done'
  } catch (err) {
    serverError.value = "L'envoi du fichier a échoué. Réessayez."
  } finally {
    submitting.value = false
  }
}

function skipUpload() {
  stage.value = 'done'
}
</script>

<template>
  <section class="px-4 md:px-6 py-16">
    <div class="max-w-2xl mx-auto w-full">
      <span class="microlabel text-ink-soft">// contact</span>
      <h1 class="text-xl mt-4">Demander un devis</h1>

      <!-- ── STAGE 1 + 2 share the summary; stage gates what's interactive ── -->
      <template v-if="stage !== 'done'">
        <p class="text-ink-soft mt-4">
          Décrivez votre projet en quelques lignes.
          <span class="text-ink-soft">
            Vous pourrez joindre un croquis ou une maquette après validation
            (optionnel).
          </span>
        </p>

        <!-- STEP ONE FORM -->
        <div class="mt-12 space-y-6" :class="stage === 'validated' && 'opacity-60 pointer-events-none'">
          <!-- nom -->
          <div>
            <label class="microlabel text-ink-soft" for="nom">Nom</label>
            <input
              id="nom" v-model="form.nom" type="text"
              @blur="touched.nom = true"
              class="mt-2 w-full bg-surface-raised border rounded-xs px-4 py-3 text-ink
                     transition-colors duration-(--dur-fast) ease-out-machined
                     focus:outline-none focus:border-accent"
              :class="showError('nom') ? 'border-accent' : 'border-line'"
            />
            <p v-if="showError('nom')" class="microlabel text-accent mt-2">{{ showError('nom') }}</p>
          </div>

          <!-- email -->
          <div>
            <label class="microlabel text-ink-soft" for="email">E-mail</label>
            <input
              id="email" v-model="form.email" type="email"
              @blur="touched.email = true"
              class="mt-2 w-full bg-surface-raised border rounded-xs px-4 py-3 text-ink
                     transition-colors duration-(--dur-fast) ease-out-machined
                     focus:outline-none focus:border-accent"
              :class="showError('email') ? 'border-accent' : 'border-line'"
            />
            <p v-if="showError('email')" class="microlabel text-accent mt-2">{{ showError('email') }}</p>
          </div>

          <!-- type — built from the same list the schema validates against -->
          <div>
            <label class="microlabel text-ink-soft" for="type">Type de projet</label>
            <select
              id="type" v-model="form.type"
              @blur="touched.type = true"
              class="mt-2 w-full bg-surface-raised border rounded-xs px-4 py-3 text-ink
                     transition-colors duration-(--dur-fast) ease-out-machined
                     focus:outline-none focus:border-accent"
              :class="showError('type') ? 'border-accent' : 'border-line'"
            >
              <option value="" disabled>Choisissez…</option>
              <option v-for="t in PROJECT_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
            <p v-if="showError('type')" class="microlabel text-accent mt-2">{{ showError('type') }}</p>
          </div>

          <!-- description -->
          <div>
            <label class="microlabel text-ink-soft" for="description">Votre projet</label>
            <textarea
              id="description" v-model="form.description" rows="5"
              @blur="touched.description = true"
              class="mt-2 w-full bg-surface-raised border rounded-xs px-4 py-3 text-ink resize-y
                     transition-colors duration-(--dur-fast) ease-out-machined
                     focus:outline-none focus:border-accent"
              :class="showError('description') ? 'border-accent' : 'border-line'"
            ></textarea>
            <p v-if="showError('description')" class="microlabel text-accent mt-2">{{ showError('description') }}</p>
          </div>

          <!-- honeypot: visually hidden, off the tab order, but in the DOM for bots -->
          <div aria-hidden="true" class="absolute w-px h-px overflow-hidden -left-[9999px]">
            <label>Ne pas remplir<input v-model="form.website" type="text" tabindex="-1" autocomplete="off" /></label>
          </div>
        </div>

        <!-- STEP ONE button (only while still on stage 1) -->
        <button
          v-if="stage === 'form'"
          @click="submitStepOne"
          :disabled="submitting"
          class="inline-flex items-center gap-2 microlabel text-ink mt-8
                 border border-line hover:border-line-hover rounded-xs px-6 py-3
                 transition-colors duration-(--dur-fast) ease-out-machined
                 disabled:opacity-50"
        >
          {{ submitting ? 'Envoi…' : 'Valider ma demande' }}
          <span class="text-accent">→</span>
        </button>

        <!-- STEP TWO: optional upload, revealed after step one validates -->
        <div v-if="stage === 'validated'" class="mt-8 border-t border-line pt-8">
          <span class="microlabel text-accent">// étape 2 — optionnel</span>
          <p class="text-ink mt-4">
            Demande reçue. Vous pouvez joindre un croquis ou une maquette
            (PNG, JPG, WEBP ou PDF), ou passer cette étape.
          </p>

          <label
            class="mt-6 flex items-center gap-3 bg-surface-raised border border-line
                   hover:border-line-hover rounded-xs px-4 py-3 cursor-pointer
                   transition-colors duration-(--dur-fast) ease-out-machined w-fit"
          >
            <span class="microlabel text-ink">Choisir un fichier</span>
            <input type="file" accept=".png,.jpg,.jpeg,.webp,.pdf" class="hidden" @change="onFilePick" />
          </label>

          <p v-if="file" class="microlabel text-ink-soft mt-3">{{ file.name }}</p>
          <p v-if="fileError" class="microlabel text-accent mt-3">{{ fileError }}</p>

          <div class="flex items-center gap-4 mt-8">
            <button
              @click="submitStepTwo" :disabled="submitting || !file"
              class="inline-flex items-center gap-2 microlabel text-ink
                     border border-line hover:border-line-hover rounded-xs px-6 py-3
                     transition-colors duration-(--dur-fast) ease-out-machined
                     disabled:opacity-50"
            >
              {{ submitting ? 'Envoi…' : 'Joindre et terminer' }}
              <span class="text-accent">→</span>
            </button>
            <button
              @click="skipUpload" :disabled="submitting"
              class="microlabel text-ink-soft hover:text-ink
                     transition-colors duration-(--dur-fast) ease-out-machined"
            >
              Passer
            </button>
          </div>
        </div>

        <p v-if="serverError" class="microlabel text-accent mt-6">{{ serverError }}</p>
      </template>

      <!-- ── STAGE 3 — done ── -->
      <div v-else class="mt-12">
        <span class="microlabel text-accent">// reçu — 200 ok</span>
        <h2 class="text-lg mt-4">Merci, votre demande est bien partie.</h2>
        <p class="text-ink-soft mt-4">
          Je reviens vers vous rapidement<span v-if="file"> — croquis joint</span>.
        </p>
      </div>
    </div>
  </section>
</template>