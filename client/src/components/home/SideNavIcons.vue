<script setup>
import { AngleDoubleUp, Microchip, Question } from '@primeicons/vue';
import { ref, onMounted, onUnmounted } from 'vue'

const iconMap = {
	AngleDoubleUp,
	Microchip,
	Question
}

const navItems = [
	{ id: 'hero', label: '01', mark: 'AngleDoubleUp'  },
	{ id: 'presentation', label: '02', mark: 'Microchip' },
	{ id: 'faq', label: '03', mark: 'Question' },
]


const activeId = ref(navItems[0].id)

let observer

onMounted(() => {
	observer = new IntersectionObserver(
		(entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) activeId.value = entry.target.id
		}
		},
		{ threshold: 0.5 },
	)
	navItems.forEach(({ id }) => {
		const el = document.getElementById(id)
		if (el) observer.observe(el)
	})
})


onUnmounted(() => observer?.disconnect())

const scrollToSection = (id) => {
  	document.getElementById(id)?.scrollIntoView()
}
</script>

<template>
    <nav
      aria-label="Page sections"
      class="fixed right-4 top-1/2 -translate-y-1/2 z-(--z-nav) flex flex-col gap-2 text-center"
    >
    
		<a
			v-for="item in navItems"
			:key="item.id"
			:href="'#' + item.id"
			:aria-current="activeId === item.id ? 'true' : undefined"
			@click.prevent="scrollToSection(item.id)"
			class="group relative tabular text-lg font-medium transition-colors duration-(--dur-fast) ease-out-machined"
			:class="activeId === item.id ? 'text-ink-soft' : 'text-accent hover:text-ink-soft' "
		>
		{{ item.label }}

		<component
			:is="iconMap[item.mark]"
			:size="36"
			class="absolute right-0 top-1/2 -translate-y-1/2  opacity-0 group-hover:opacity-100 transition-opacity bg-surface h-15 w-15"
		/>
		</a>
    </nav>
</template>