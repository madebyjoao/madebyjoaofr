<script setup>

const navItems = [
    { id: 'hero', label: '01' },
    { id: 'presentation', label: '02' },
]

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
            @click.prevent="scrollToSection(item.id)"
            class="tabular text-lg text-accent hover:text-ink
                    transition-opacity duration-(--dur-fast) ease-out-machined"
            >
        {{ item.label }}
        </a>
    </nav>
</template>