<script setup lang="ts">
defineProps<{
  playerId?: string
}>()
</script>

<template>
  <div class="flex w-fit gap-4 border border-block-border/60 bg-grid-cell-border p-4">
    <div
      v-for="n in 3"
      :key="n"
      class="relative size-14 shrink-0"
    >
      <span
        class="corner corner-tl"
        aria-hidden="true"
      />
      <span
        class="corner corner-tr"
        aria-hidden="true"
      />
      <span
        class="corner corner-bl"
        aria-hidden="true"
      />
      <span
        class="corner corner-br"
        aria-hidden="true"
      />
      <div class="absolute inset-1.5 border border-block-border bg-main-bg/40" />
    </div>
  </div>
</template>

<style scoped>
  .corner {
    position: absolute;
    width: 30%;
    height: 30%;
    border: 0 solid var(--color-block-border);
    filter: drop-shadow(0 0 3px rgb(0 235 235 / 0.6));
    pointer-events: none;
  }

  .corner-tl {
    top: 0;
    left: 0;
    border-top-width: 3px;
    border-left-width: 3px;
  }

  .corner-tr {
    top: 0;
    right: 0;
    border-top-width: 3px;
    border-right-width: 3px;
  }

  .corner-bl {
    bottom: 0;
    left: 0;
    border-bottom-width: 3px;
    border-left-width: 3px;
  }

  .corner-br {
    bottom: 0;
    right: 0;
    border-bottom-width: 3px;
    border-right-width: 3px;
  }
</style>
