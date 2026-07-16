<template>
  <section id="hero" class="snap-start min-h-full flex flex-col justify-center px-4 md:px-6">
    <div class="max-w-5xl mx-auto w-full">
      <span class="tobular text-accent font-medium text-xl">// développeur web — cannes</span>

      <h1 class="tobular text-6xl mt-6 max-w-4xl ">
        Besoin d'un site?
        <span class="block mt-2">Je m'occupe de tout.</span>
      </h1>

      <p class="text-md text-ink-soft mt-6 max-w-4xl">
        Sites vitrines et outils sur mesure pour les entreprises
        qui veulent un travail précis.
      </p>

      <RouterLink
        to="/contact"
        class="inline-flex items-center gap-2 microlabel text-ink mt-12
               border border-line hover:border-line-hover rounded-xs px-6 py-3
               transition-colors duration-(--dur-fast) ease-out-machined"
      >
        Demander un devis <span class="text-accent">→</span>
      </RouterLink>
    </div>
  </section>
</template>