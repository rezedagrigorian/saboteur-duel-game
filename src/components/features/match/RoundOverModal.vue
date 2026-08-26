<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCountdown } from '@vueuse/core'
import HudModal from '@/components/ui/HudModal.vue'
import MatchStandings from '@/components/features/match/MatchStandings.vue'
import { usePlayerStore } from '@/stores/playerStore'
import { ROUND_RESTART_DELAY_MS } from '@/game-core/constants'

const router = useRouter()
const playerStore = usePlayerStore()
const { players, winner, roundWinner, gameOver, roundNumber } = storeToRefs(playerStore)

const TOTAL_SECONDS = ROUND_RESTART_DELAY_MS / 1000

const { remaining: secondsLeft, start } = useCountdown(TOTAL_SECONDS)

if (!gameOver.value) start()

const remainingRatio = computed(() => secondsLeft.value / TOTAL_SECONDS)

const displayWinner = computed(() => (gameOver.value ? winner.value : roundWinner.value))

const roundTitle = computed(() => (gameOver.value ? 'Game Over' : `Round ${roundNumber.value} Over`))

const metaLabel = computed(() => (gameOver.value ? 'SYS://GAME_END' : 'SYS://ROUND_END'))

function goToResults() {
  router.push({ name: '/result' })
}
</script>

<template>
  <HudModal
    :title="roundTitle"
    :meta="metaLabel"
    size="lg"
    :closable="false"
  >
    <p
      class="verdict"
      :class="{ 'is-final': gameOver }"
    >
      <template v-if="displayWinner">
        <span
          class="verdict-dot"
          :class="displayWinner.color === 2 ? 'text-purple-400' : 'text-yellow-400'"
          aria-hidden="true"
        />
        <span class="verdict-name">{{ displayWinner.name }}</span>
        <span class="verdict-word">wins</span>
      </template>
      <span
        v-else
        class="verdict-word is-draw"
      >Draw</span>
    </p>

    <MatchStandings
      :players="players"
      :winner-id="displayWinner?.id"
      :total="gameOver"
    />

    <template #footer>
      <template v-if="gameOver">
        <button
          type="button"
          class="results-btn"
          @click="goToResults"
        >
          View Results
        </button>
      </template>
      <template v-else>
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

.verdict.is-final {
  font-size: 1.5rem;
}

.verdict.is-final .verdict-dot {
  width: 12px;
  height: 12px;
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
  box-shadow: var(--shadow-glow-accent);
  transform-origin: left center;
  transition: transform 1s linear;
}

@media (prefers-reduced-motion: reduce) {
  .countdown-bar {
    transition: none;
  }
}

.results-btn {
  padding: 0.625rem 1.75rem;
  border: 1px solid rgba(1, 207, 207, 0.45);
  background: var(--color-grid-cell-border);
  color: var(--color-block-border);
  font-family: var(--font-hud);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition:
    border-color 140ms ease,
    background 140ms ease,
    box-shadow 140ms ease;
}

.results-btn:hover,
.results-btn:focus-visible {
  border-color: var(--color-block-border);
  background: var(--color-cell-hover);
  box-shadow: var(--shadow-glow-focus);
}

.results-btn:focus-visible {
  outline: 2px solid rgba(1, 207, 207, 0.75);
  outline-offset: 2px;
}
</style>
