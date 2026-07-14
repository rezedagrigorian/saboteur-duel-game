<script setup lang="ts">
import { computed } from 'vue'
import PlayerIcon from '@/components/features/match/control-panel/PlayerIcon.vue'
import DiscardHudButton from '@/components/features/match/DiscardHudButton.vue'
import diamondIconSrc from '@/assets/diamond-icon.svg'
import { usePlayerStore } from '@/stores/playerStore'

const props = defineProps<{
  playerId: string
}>()

const playerStore = usePlayerStore()
const player = computed(() =>
  playerStore.players.find(p => p.id === props.playerId)
)
const gold = computed(() => player.value?.gold ?? 0)
</script>

<template>
  <div class="m-3 flex flex-col gap-4 border border-block-border bg-board-surface text-left pr-2">
    <div class="flex flex-wrap items-center gap-4 justify-between sm:justify-start">
      <div class="clip-btn flex shrink-0 items-center gap-2">
        <span
          class="size-2.5 shrink-0 rounded-full"
          :class="player?.color === 2 ? 'bg-purple-400' : 'bg-yellow-400'"
          aria-hidden="true"
        />
        {{ player?.name ?? 'You' }}
      </div>
      <div
        class="flex shrink-0 items-center gap-1.5 text-base text-block-border"
        aria-label="Gold"
      >
        <img
          :src="diamondIconSrc"
          alt="Gold"
          class="size-5 shrink-0 select-none"
          width="20"
          height="18"
        >
        <span class="tabular-nums leading-none">{{ gold }}</span>
      </div>
    </div>

    <div class="flex w-full flex-wrap items-center justify-between gap-4">
      <PlayerIcon :player-id="playerId" />
      <DiscardHudButton
        class="max-w-1/6 shrink-0"
        label="Discard"
      />
    </div>
  </div>
</template>

<style scoped>
  .clip-btn {
    position: relative;
    padding: 6px 12px;
    color: var(--color-block-border);
    background: transparent;
    border: none;
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: default;
    isolation: isolate;
  }
 
  .clip-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--color-grid-cell-border);
    clip-path: polygon(
      0 0,
      100% 0,
      100% calc(100% - 18px),
      calc(100% - 18px) 100%,
      0 100%
    );
    z-index: -2;
  }
 
  .clip-btn::after {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--color-block-border);
    clip-path: polygon(
      100% 0,
      100% calc(100% - 18px),
      calc(100% - 18px) 100%,
      0 100%,
      /* внутренний контур, отступ 2px */
      1px calc(100% - 1px),
      calc(100% - 18px - 0.5px) calc(100% - 1px),
      calc(100% - 1px) calc(100% - 18px - 0.5px),
      calc(100% - 1px) 0
    );
    z-index: -1;
  }

</style>
