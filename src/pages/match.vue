<script setup lang="ts">
import { storeToRefs } from 'pinia'

import BoardGrid from '../components/board/BoardGrid.vue'
import ShadowCard from '../components/cards/ShadowCard.vue'
import PlayerHand from '../components/features/match/control-panel/PlayerHand.vue'
import { useCardStore } from '../stores/cardStore'
import { usePlayerStore } from '../stores/playerStore'

const cardStore = useCardStore()
const { currentPlayerId: playerId } = storeToRefs(usePlayerStore())
</script>

<template>
  <div
    class="grid min-h-0 w-full flex-1 grid-cols-1 gap-6
           lg:grid-cols-[minmax(0,1fr)_clamp(20rem,28%,28rem)] lg:grid-rows-[minmax(0,1fr)]"
  >
    <ShadowCard v-if="cardStore.selectedCardId" />
    <BoardGrid class="min-h-0" />
    <!-- <RouterLink
      :to="{ name: '/(lobby)' }"
      class="text-text-link"
    >
      ← Back to lobby
    </RouterLink> -->
    <PlayerHand :player-id="playerId" />
  </div>
</template>
