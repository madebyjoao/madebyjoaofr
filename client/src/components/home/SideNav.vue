<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// static data — plain const
const navItems = [
  { id: 'hero', label: '01' },
  { id: 'presentation', label: '02' },
]

// state that changes — ref
const activeId = ref(navItems[0].id)

let observer

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeId.value = entry.target.id
      }
    },
    { threshold: 0.5 }, // ≥50% visible = the active section, unique by geometry
  )
  navItems.forEach(({ id }) => {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  })
})

// subscribers must unsubscribe — SideNav really unmounts (v-if)
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
            class="tabular text-lg font-medium transition-colors duration-(--dur-fast) ease-out-machined"
            :class="activeId === item.id ? 'text-ink-soft' : 'text-accent hover:text-ink-soft'"
            >
        {{ item.label }}
        </a>
    </nav>
</template>