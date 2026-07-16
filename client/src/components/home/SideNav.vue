<script setup>
import { ref } from 'vue';

// Your data table
const navItems = ref([
  { id: 'hero', label: 'Hero' },
  { id: 'presentation', label: 'Prese' },
  { id: 'services', label: 'Services' }, // Example extra
  { id: 'contact', label: 'Contact' }    // Example extra
]);


const scrollToSection = (id) => {

  const element = document.getElementById(id);
  if (element) {

    element.scrollIntoView({ behavior: 'smooth' });

  }
};
</script>

<template>
    <section class="fixed right-0 h-full z-50 pointer-events-auto">

        <div class="absolute flex flex-col right-4 top-1/2 -translate-y-1/2 p-4 microlabel text-accent gap-2 text-center">
        
            <a 
                v-for="item in navItems" 
                :key="item.id"
                :href="'#' + item.id"
                @click.prevent="scrollToSection(item.id)"
                class="cursor-pointer hover:opacity-100 opacity-60 transition-opacity"
            >
                {{ item.label }}
            </a>

        
        </div>

    </section>
</template>