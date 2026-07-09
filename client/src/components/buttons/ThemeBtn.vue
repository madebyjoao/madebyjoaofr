<script setup>
    import { ref, onMounted } from 'vue';
    import Moon from '@primeicons/vue/moon';
    import Sun from '@primeicons/vue/sun';

    const theme = ref('light')

    function applyTheme(value) {
        theme.value = value
        document.documentElement.classList.toggle('dark', value === 'dark')
        localStorage.setItem('theme', value)
    }

    function toggleTheme() {
        applyTheme(theme.value === 'dark' ? 'light' : 'dark')
    }

    onMounted(() => {
        const themeSaved = localStorage.getItem('theme')
        const preferred = themeSaved ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        applyTheme(preferred)
    })

</script>

<template>
    <button @click="toggleTheme">

        <Sun color="white"
            size="20"
            v-if="theme === 'dark'"/> 
        <Moon v-else/>
    
    </button>
</template>