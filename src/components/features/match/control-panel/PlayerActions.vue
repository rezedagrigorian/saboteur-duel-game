<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { ToolKind } from '@/types/card'

const props = defineProps<{
  playerId?: string
}>()

const emit = defineEmits<{
  (e: 'toolClick', tool: ToolKind): void
}>()

const TOOLS = [ToolKind.Battery, ToolKind.Navigation, ToolKind.Drilling]

const TOOL_ICON_NAMES: Record<ToolKind, string> = {
  [ToolKind.Battery]: 'battery',
  [ToolKind.Navigation]: 'navigation',
  [ToolKind.Drilling]: 'drill',
}

const playerStore = usePlayerStore()

const brokenTools = computed(() =>
  playerStore.players.find(player => player.id === props.playerId)?.brokenTools ?? []
)

function isBroken(tool: ToolKind): boolean {
  return brokenTools.value.includes(tool)
}

function iconSrc(tool: ToolKind): string {
  const name = TOOL_ICON_NAMES[tool]
  const prefix = isBroken(tool) ? 'broken-' : ''
  return `/cards/characters/action-icons/${prefix}${name}.svg`
}
</script>

<template>
  <div class="flex w-fit gap-4 border border-block-border/60 bg-grid-cell-border p-4">
    <button
      v-for="tool in TOOLS"
      :key="tool"
      type="button"
      class="relative size-14 shrink-0 cursor-pointer"
      :class="{ 'is-broken': isBroken(tool) }"
      @click="emit('toolClick', tool)"
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
      <div
        class="absolute inset-1.5 flex items-center justify-center border"
        :class="isBroken(tool)
          ? 'border-broken-frame bg-main-bg'
          : 'border-block-border bg-main-bg/40'"
      >
        <img
          :src="iconSrc(tool)"
          :alt="tool"
          class="max-h-full max-w-full p-1"
        >
        <span
          v-if="isBroken(tool)"
          class="broken-fill"
          aria-hidden="true"
        />
      </div>
    </button>
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

  .is-broken .corner {
    border-color: var(--color-broken-frame);
    filter: drop-shadow(0 0 3px color-mix(in srgb, var(--color-broken-frame) 60%, transparent));
  }

  .broken-fill {
    position: absolute;
    inset: 0;
    background-color: var(--color-broken-frame);
    opacity: 0.56;
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
