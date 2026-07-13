<script setup lang="ts">
import { ChevronLeft } from '@primeicons/vue';

</script>

<template>
    <section class="flex-1 flex flex-col items-center justify-center px-6">
        <span class="microlabel text-accent">error 404 page not found</span>
        <h1 class="text-xl mt-4">Coordinates unknown</h1>
        <RouterLink to="/" class="flex items-center gap-2 microlabel mt-8 text-ink-soft hover:text-ink transition-colors duration-(--dur-fast) ease-out-machined">
            <ChevronLeft /> Return home
        </RouterLink>
    </section>
</template>