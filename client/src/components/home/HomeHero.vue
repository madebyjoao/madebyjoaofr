<template>

	<section id="hero" class="snap-start min-h-full flex flex-col justify-center px-4 md:px-6">
		<div class="max-w-5xl mx-auto w-full">
			<span class="microlabel text-base text-accent">// développeur web — cannes</span>

				<h1 class="text-4xl mt-6 max-w-4xl">
					Besoin d'un site&nbsp;?
					<span class="block mt-2">Je m'occupe de tout.</span>
				</h1>

				<p class="text-md text-ink-soft mt-6 max-w-2xl">
					Sites vitrines et outils sur mesure, du nom de domaine à la mise en ligne —
					pour tous qui veulent un travail précis.
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