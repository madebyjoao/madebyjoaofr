<script setup>
    import { RouterLink } from 'vue-router'
    import ThemeBtn from '../buttons/ThemeBtn.vue'
</script>

<template>
    <nav class="flex items-center justify-between gap-1 md:gap-4 ">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/contact">Contact</RouterLink>
        <div class="w-5">
            <ThemeBtn />
        </div>
    </nav>
</template>