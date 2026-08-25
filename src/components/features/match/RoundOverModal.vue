<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCountdown } from '@vueuse/core'
import HudModal from '@/components/ui/HudModal.vue'
import PlayerBadge from '@/components/features/match/control-panel/PlayerBadge.vue'
import DiamondCounter from '@/components/features/match/control-panel/DiamondCounter.vue'
import { usePlayerStore } from '@/stores/playerStore'
import { ROUND_RESTART_DELAY_MS } from '@/game-core/constants'

const playerStore = usePlayerStore()
const { players, winner } = storeToRefs(playerStore)

const TOTAL_SECONDS = ROUND_RESTART_DELAY_MS / 1000

const { remaining: secondsLeft, start } = useCountdown(TOTAL_SECONDS)

start()

const remainingRatio = computed(() => secondsLeft.value / TOTAL_SECONDS)
</script>

<template>
  <HudModal
    title="Round Over"
    meta="SYS://ROUND_END"
    size="lg"
    :closable="false"
  >
    <p class="verdict">
      <template v-if="winner">
        <span
          class="verdict-dot"
          :class="winner.color === 2 ? 'text-purple-400' : 'text-yellow-400'"
          aria-hidden="true"
        />
        <span class="verdict-name">{{ winner.name }}</span>
        <span class="verdict-word">wins</span>
      </template>
      <span
        v-else
        class="verdict-word is-draw"
      >Draw</span>
    </p>

    <ul class="scores">
      <li
        v-for="player in players"
        :key="player.id"
        class="score"
        :class="{ 'is-winner': player.id === winner?.id }"
      >
        <PlayerBadge
          :name="player.name"
          :color="player.color"
        />
        <DiamondCounter
          :gold="player.gold"
          width="7rem"
        />
      </li>
    </ul>

    <template #footer>
      <p class="countdown-label">
        New round in <span class="countdown-value">{{ secondsLeft }}</span>s
      </p>
      <span class="countdown-track">
        <span
          class="countdown-bar"
          :style="{ transform: `scaleX(${remainingRatio})` }"
        />
      </span>
    </template>
  </HudModal>
</template>

<style scoped>
.verdict,
.countdown-label {
  margin: 0;
  font-family: var(--font-hud);
  text-transform: uppercase;
}

.verdict {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 1.25rem;
  letter-spacing: 0.12em;
}

.verdict-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.verdict-name {
  font-weight: 700;
  color: var(--color-hud-text);
}

.verdict-word {
  color: var(--color-block-border);
}

.verdict-word.is-draw {
  font-weight: 700;
  letter-spacing: 0.2em;
}

.scores {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0.625rem 1.25rem 0.625rem 0;
  border: 1px solid transparent;
  background: rgba(0, 0, 0, 0.14);
}

.score.is-winner {
  border-color: rgba(1, 207, 207, 0.45);
  background: var(--color-grid-cell-border);
  box-shadow: 0 0 0.75rem rgba(0, 235, 235, 0.12);
}

.countdown-label {
  font-size: 0.8125rem;
  letter-spacing: 0.16em;
  color: var(--color-hud-text-soft);
}

.countdown-value {
  display: inline-block;
  min-width: 2ch;
  text-align: right;
  font-weight: 700;
  color: var(--color-block-border);
  font-variant-numeric: tabular-nums;
}

.countdown-track {
  width: 100%;
  height: 3px;
  background: var(--color-grid-cell-border);
  overflow: hidden;
}

.countdown-bar {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, rgba(1, 207, 207, 0.5), var(--color-block-border));
  box-shadow: 0 0 8px rgba(0, 235, 235, 0.55);
  transform-origin: left center;
  transition: transform 1s linear;
}

@media (prefers-reduced-motion: reduce) {
  .countdown-bar {
    transition: none;
  }
}
</style>
