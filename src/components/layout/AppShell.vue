<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div>
    <nav class="flex gap-2 justify-center m-4">
      <RouterLink
        :to="{ name: '/(lobby)' }"
        class="p-2 rounded-lg transition-all duration-200 hover:bg-neutral-200"
        active-class="bg-neutral-200"
      >
        Lobby
      </RouterLink>
      <RouterLink
        :to="{ name: '/match' }"
        class="p-2 rounded-lg transition-all duration-200 hover:bg-neutral-200"
        active-class="bg-neutral-200"
      >
        Match
      </RouterLink>
      <RouterLink
        :to="{ name: '/result' }"
        class="p-2 rounded-lg transition-all duration-200 hover:bg-neutral-200"
        active-class="bg-neutral-200"
      >
        Result
      </RouterLink>
    </nav>
    <RouterView />
  </div>
</template>
