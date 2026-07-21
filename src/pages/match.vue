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
  <div class="flex w-full  gap-4">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
      <ShadowCard v-if="cardStore.selectedCardId" />
      <div class="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
        <BoardGrid class="shrink-0" />
      </div>
    </div>
    <!-- <RouterLink
      :to="{ name: '/(lobby)' }"
      class="text-text-link"
    >
      ← Back to lobby
    </RouterLink> -->
    <PlayerHand :player-id="playerId" />
  </div>
</template>
