<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import PlayerBadge from '@/components/features/match/control-panel/PlayerBadge.vue'
import PlayerIcon from '@/components/features/match/control-panel/PlayerIcon.vue'
import DiamondCounter from '@/components/features/match/control-panel/DiamondCounter.vue'
import PlayerActions from '@/components/features/match/control-panel/PlayerActions.vue'
import HandFrame from '@/components/features/match/control-panel/HandFrame.vue'
import DiscardHudButton from '@/components/features/match/DiscardHudButton.vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useCardStore } from '@/stores/cardStore'
import CardHand from '@/components/cards/CardHand.vue'

const playerStore = usePlayerStore()
const cardStore = useCardStore()

const { localPlayerId, localPlayer, opponent, currentPlayerId } = storeToRefs(playerStore)

const playerCards = computed(() => cardStore.handOf(localPlayerId.value))
const opponentCards = computed(() =>
  opponent.value ? cardStore.handOf(opponent.value.id) : []
)

// dev toggle: show the opponent's hand to play both sides during development
const SHOW_OPPONENT_HAND = true
</script>

<template>
  <div
    class="flex min-h-0 w-full min-w-0 flex-col gap-3 overflow-y-auto px-2.5 text-left
           scrollbar-gutter-stable lg:h-full"
  >
    <PlayerBadge
      :name="localPlayer?.name"
      :color="localPlayer?.color"
    />
    <div class="flex items-start gap-4">
      <PlayerIcon :player-id="localPlayerId" />
      <div class="flex min-w-0 flex-col gap-3">
        <DiamondCounter :gold="localPlayer?.gold ?? 0" />
        <PlayerActions :player-id="localPlayerId" />
      </div>
    </div>

    <HandFrame class="min-w-0">
      <CardHand
        :player-cards="playerCards"
        :player-id="localPlayerId"
        class="min-w-0"
        :class="{ 'pointer-events-none opacity-50': currentPlayerId !== localPlayerId }"
      />
      <template #footer>
        <DiscardHudButton label="Discard" />
      </template>
    </HandFrame>
    <div
      v-if="opponent"
      class="flex flex-col gap-3 border border-block-border p-2.5 lg:mt-6"
    >
      <PlayerBadge
        :name="opponent.name"
        :color="opponent.color"
      />
      <div class="flex items-start gap-4">
        <PlayerIcon :player-id="opponent.id" />
        <div class="flex min-w-0 flex-col gap-3">
          <DiamondCounter :gold="opponent.gold" />
          <PlayerActions :player-id="opponent.id" />
        </div>
      </div>
      <HandFrame
        v-if="SHOW_OPPONENT_HAND"
        class="min-w-0"
      >
        <CardHand
          :player-cards="opponentCards"
          :player-id="opponent.id"
          class="min-w-0"
          :class="{ 'pointer-events-none opacity-50': currentPlayerId !== opponent.id }"
        />
        <template #footer>
          <DiscardHudButton label="Discard" />
        </template>
      </HandFrame>
    </div>
  </div>
</template>
