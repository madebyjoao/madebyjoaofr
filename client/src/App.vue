<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import Navbar from './components/public/Navbar.vue'
</script>

<template>

  <header class="flex w-full md:items-center md:justify-around ">
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="">

        <Navbar />

    </div>

  </header>

  <RouterView />

</template>


