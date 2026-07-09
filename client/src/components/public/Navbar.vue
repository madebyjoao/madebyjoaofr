<script setup>
    import { RouterLink } from 'vue-router'
    import ThemeBtn from '../buttons/ThemeBtn.vue'
</script>

<template>
    <nav class="flex md:gap-4 ">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/contact">Contact</RouterLink>
        <ThemeBtn />
    </nav>
</template>