<script setup>
import { ref } from 'vue'

const open = ref(0)

function toggle(i) {
  open.value = open.value === i ? null : i
}

const faq = [
  {
    q: "Combien coûte un site ?",
    a: "Un site vitrine simple, avec accueil, présentation et contact, démarre à 800 €. Vous recevez un devis fixe avant qu'on commence : pas de surprise en cours de route.",
  },
  {
    q: "Combien de temps faut-il ?",
    a: "Deux semaines pour un site vitrine, une fois vos contenus réunis. Pour un outil sur mesure, ça dépend de ce qu'il doit faire. On en parle ensemble et je vous donne une date.",
  },
  {
    q: "À qui appartient le site ?",
    a: "À vous. Le nom de domaine est à votre nom, le site vous appartient, et vous partez avec si un jour vous changez de prestataire. Pour l'hébergement, je peux m'en occuper ou vous laisser la main, comme vous préférez.",
  },
  {
    q: "Et si je veux modifier un texte après la mise en ligne ?",
    a: "Vous m'écrivez, je m'en occupe. Le forfait à 40 €/mois couvre l'hébergement, les mises à jour et vos modifications courantes. C'est fait pour que vous n'ayez jamais à toucher au site vous-même.",
  },
  {
    q: "Je n'ai ni textes ni photos. C'est un problème ?",
    a: "Non. Si vous avez vos contenus, parfait. Sinon je m'en charge : rédaction, mise en page, choix des images. En pratique, la plupart des projets sont un mélange des deux.",
  },
  {
    q: "Vous travaillez uniquement sur la Côte d'Azur ?",
    a: "Je suis basé à Cannes et je me déplace volontiers à Nice, Antibes, Grasse ou Mougins. Le reste se passe très bien à distance, où que vous soyez.",
  },
]
</script>

<template>
  <section
    id="faq"
    class="snap-start min-h-full flex flex-col justify-center px-4 md:px-6"
  >
    <div class="max-w-3xl mx-auto w-full">
      <span class="microlabel text-ink-soft">04 / questions fréquentes</span>
      <h2 class="text-lg mt-4">Les questions qu'on me pose souvent</h2>

      <div class="mt-10 divide-y divide-line border-t border-b border-line">
        <div v-for="(item, i) in faq" :key="i">
          <button
            @click="toggle(i)"
            :aria-expanded="open === i"
            class="w-full flex items-start justify-between gap-6 text-left py-4
                   transition-colors duration-(--dur-fast) ease-out-machined
                   hover:text-accent"
            :class="open === i ? 'text-accent' : 'text-ink'"
          >
            <span class="text-md">{{ item.q }}</span>
            <span
              class="microlabel shrink-0 mt-1 transition-transform duration-(--dur-base) ease-out-machined"
              :class="open === i && 'rotate-45'"
              aria-hidden="true"
            >+</span>
          </button>

          <div
            class="grid transition-all duration-(--dur-base) ease-out-machined"
            :class="open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
          >
            <div class="overflow-hidden">
              <p class="text-ink-soft pb-5 pr-10">{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>

      <p class="microlabel text-ink-soft mt-10">
        Une autre question&nbsp;?
        <RouterLink to="/contact" class="text-accent">Écrivez-moi →</RouterLink>
      </p>
    </div>
  </section>
</template>