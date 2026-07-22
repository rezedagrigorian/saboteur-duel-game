<script setup lang="ts">
import { computed } from 'vue'
import PlayerIcon from '@/components/features/match/control-panel/PlayerIcon.vue'
import DiamondCounter from '@/components/features/match/control-panel/DiamondCounter.vue'
import PlayerActions from '@/components/features/match/control-panel/PlayerActions.vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useCardStore } from '@/stores/cardStore'
import CardHand from '@/components/cards/CardHand.vue'

const props = defineProps<{
  playerId: string
}>()

const playerStore = usePlayerStore()
const cardStore = useCardStore()

const player = computed(() =>
  playerStore.players.find(p => p.id === props.playerId)
)
const gold = computed(() => player.value?.gold ?? 0)

const playerCards = computed(() => cardStore.handOf(props.playerId))
</script>

<template>
  <div
    class="flex min-h-0 w-full min-w-0 flex-col gap-4 overflow-y-auto text-left
           [scrollbar-gutter:stable] lg:max-h-full lg:self-start"
  >
    <div class="clip-btn flex w-fit shrink-0 items-center gap-3 self-start">
      <svg
        class="clip-btn-shape"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon points="0,0 85,0 100,30 100,100 0,100" />
      </svg>
      <span
        class="size-2.5 shrink-0 rounded-full"
        :class="player?.color === 2 ? 'bg-purple-400' : 'bg-yellow-400'"
        aria-hidden="true"
      />
      {{ player?.name ?? 'You' }}
    </div>
    <div class="flex items-start gap-4">
      <PlayerIcon :player-id="playerId" />
      <div class="flex min-w-0 flex-col gap-4">
        <DiamondCounter
          :gold="gold"
        />
        <PlayerActions :player-id="playerId" />
      </div>
    </div>

    <div class="flex w-full flex-col items-center justify-between gap-4" />
    <CardHand
      :player-cards="playerCards"
      :player-id="playerId"
      class="min-w-0 lg:flex-1"
    />
    <!-- <DiscardHudButton
      class="shrink-0"
      label="Discard"
    /> -->
  </div>
</template>

<style scoped>
  .clip-btn {
    position: relative;
    padding: 14px 28px 14px 20px;
    color: var(--color-block-border);
    font-family: "Kode Mono", ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 18px;
    line-height: 1;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    white-space: nowrap;
    cursor: default;
  }

  .clip-btn-shape {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .clip-btn-shape polygon {
    fill: var(--color-grid-cell-border);
    stroke: var(--color-block-border);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }
</style>
