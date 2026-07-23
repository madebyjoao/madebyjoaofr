<script setup>
const offers = [
  {
    title: 'Site vitrine',
    text: "Votre activité, présentée avec précision. Un site rapide et élégant, pensé pour vos clients.",
    tags: ['design sur mesure', 'responsive', 'seo de base'],
  },
  {
    title: 'Outil sur mesure',
    text: "Tableau de bord, gestion, CRM : un outil qui travaille comme vous, pas l'inverse.",
    tags: ['interface simple', 'adapté à votre métier', 'évolutif'],
  },
  {
    title: 'Refonte',
    text: "Votre site a vieilli ? Repartons sur des bases saines, sans rien perdre au passage.",
    tags: ['audit de l’existant', 'design moderne', 'migration incluse'],
  },
]

</script>

<template>
  <section id="services" class="snap-start min-h-full flex flex-col justify-center px-4 md:px-6">
    <div class="max-w-5xl mx-auto w-full">
      <span class="microlabel text-ink-soft">02 / services</span>
      <hr class="border-line" />
      <h2 class="text-lg mt-4">Ce que je peux faire pour vous</h2>

      <div class="grid md:grid-cols-3 gap-4 md:gap-8 mt-12">
        <article
          v-for="offer in offers"
          :key="offer.title"
          class="bg-surface-raised border border-line hover:border-line-hover rounded-xs p-6
                 transition-colors duration-(--dur-fast) ease-out-machined"
        >
          <h3 class="text-md">{{ offer.title }}</h3>
          <p class="text-ink-soft mt-4">{{ offer.text }}</p>
          <p class="microlabel text-ink-soft mt-6">{{ offer.tags.join(' · ') }}</p>
        </article>
      </div>

      <p class="microlabel text-accent mt-12">
        Dans tous les cas&nbsp;: nom de domaine, hébergement et mise en ligne inclus.
      </p>
    </div>
  </section>
</template>