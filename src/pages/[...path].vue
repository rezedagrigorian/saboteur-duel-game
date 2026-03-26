<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="my-6 text-center">
    <p class="mb-4 text-neutral-600">
      Page not found
    </p>
    <RouterLink
      :to="{ name: '/(lobby)' }"
      class="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
    >
      Back to lobby
    </RouterLink>
  </div>
</template>
