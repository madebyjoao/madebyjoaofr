<script setup>
import HomeFAQ from '@/components/home/HomeFAQ.vue';
import HomeHero from '@/components/home/HomeHero.vue';
import HomePresentation from '@/components/home/HomePresentation.vue';


</script>

<template>
	<!-- no <main> wrapper: the layout owns <main> -->
	<HomeHero />
	<HomePresentation />
	<HomeFAQ />
</template>