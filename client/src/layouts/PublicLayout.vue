<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import Navbar from '@/components/public/Navbar.vue'
import Footer from '@/components/public/Footer.vue'

const route = useRoute()
const fullHeight = computed(() => route.meta.fullHeight === true)
</script>

<template>
	<div
		class="flex flex-col"
		:class="fullHeight ? 'h-dvh overflow-hidden' : 'min-h-dvh'"
	>
		<header class="shrink-0 w-full">
			<div class="max-w-5xl mx-auto flex items-center justify-between px-4 py-4 md:px-6">
				<RouterLink to="/"><img alt="madebyjoao" src="@/assets/logo.svg" width="56" height="56" /></RouterLink>
				<Navbar />
			</div>
		</header>

		<main class="flex-1" :class="fullHeight ? 'min-h-0 overflow-y-auto flex flex-col' : ''">
			<RouterView />
		</main>

		<Footer />
	</div>
</template>
