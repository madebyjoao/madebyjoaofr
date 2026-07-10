<script setup>
const users = Array.from({ length: 60 }, (_, i) => `user-${i + 1}@example.com`)
</script>

<template>

    <h1 class="text-2xl font-bold mb-4">Users</h1>

    <ul class="flex flex-col gap-1">

        <li v-for="u in users" :key="u" class="border-b py-1">{{ u }}</li>

    </ul>
    
</template>