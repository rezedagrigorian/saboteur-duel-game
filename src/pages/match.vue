<script setup lang="ts">
import BoardGrid from '../components/board/BoardGrid.vue'
import CardList from '../components/cards/CardList.vue'
</script>

<template>
  <div class="mx-auto flex flex-col gap-4 lg:flex-row lg:items-start">
    <div class="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
      <BoardGrid class="shrink-0" />
    </div>

    <CardList class="min-w-0 lg:flex-1" />
  </div>
</template>
