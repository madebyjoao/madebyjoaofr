<script setup>
    import { RouterLink } from 'vue-router'
    import ThemeBtn from '../buttons/ThemeBtn.vue'
</script>

<template>
    <nav class="flex items-center justify-between gap-1 md:gap-4 tabular text-lg font-medium">
        <RouterLink :to="{ name: 'home' }">Accueil</RouterLink>
        <RouterLink :to="{ name: 'contact' }">Contact</RouterLink>
        <div class="flex items-center w-5">
            <ThemeBtn />
        </div>
    </nav>
</template>