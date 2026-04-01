<script setup lang="ts">
import BoardGrid from '../components/board/BoardGrid.vue'
import CardList from '../components/cards/CardList.vue'
</script>

<template>
  <div class="mx-auto flex w-full max-w-[76rem] flex-wrap items-start gap-4 p-4 md:gap-6">
    <BoardGrid />
    <CardList />
  </div>
</template>
