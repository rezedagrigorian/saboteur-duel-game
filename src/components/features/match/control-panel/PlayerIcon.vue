<script setup lang="ts">
import iconCircleSrc from '@/assets/icon-circle.svg'

defineProps<{
  playerId?: string
  avatarSrc?: string
}>()
</script>

<template>
  <div class="inline-flex shrink-0 flex-col items-center overflow-visible">
    <div class="relative w-[120px] rounded-full">
      <img
        :src="iconCircleSrc"
        alt=""
        class="relative z-10 block max-w-full h-auto pointer-events-none"
      >
      <div
        class="absolute inset-0 z-20 bottom-[-20px] flex items-center justify-center pointer-events-none"
      >
        <img
          :src="avatarSrc"
          alt=""
          class="pointer-events-none max-w-none w-[calc(100%-6px)]"
        >
      </div>
    </div>
  </div>
</template>
