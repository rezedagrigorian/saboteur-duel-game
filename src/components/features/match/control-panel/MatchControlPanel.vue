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
import { ActionEffect, type ToolKind } from '@/types/card'

const playerStore = usePlayerStore()
const cardStore = useCardStore()

const { localPlayerId, localPlayer, opponent, currentPlayerId } = storeToRefs(playerStore)

const playerCards = computed(() => cardStore.handOf(localPlayerId.value))

const isLocalTurn = computed(() => currentPlayerId.value === localPlayerId.value)

const notMyTurnClass = computed(() => isLocalTurn.value ? '' : 'pointer-events-none opacity-50')

function onDiscard(playerId: string) {
  if (playerId !== currentPlayerId.value) return

  cardStore.discardSelectedCard(playerId)
}

// clicking a tool on your own panel plays a fix card, on the opponent's panel — a break card
function onToolClick(panelOwnerId: string, tool: ToolKind) {
  if (!cardStore.selectedCardId) return

  const effect = panelOwnerId === localPlayerId.value ? ActionEffect.Fix : ActionEffect.Break
  cardStore.playActionCard(localPlayerId.value, cardStore.selectedCardId, tool, effect, panelOwnerId)
}

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
      <PlayerIcon
        :player-id="localPlayerId"
        :avatar-src="localPlayer?.avatar"
      />
      <div class="flex min-w-0 flex-col gap-3">
        <DiamondCounter :gold="localPlayer?.gold ?? 0" />
        <PlayerActions
          :player-id="localPlayerId"
          :class="notMyTurnClass"
          @tool-click="tool => onToolClick(localPlayerId, tool)"
        />
      </div>
    </div>

    <HandFrame class="min-w-0">
      <CardHand
        :player-cards="playerCards"
        :player-id="localPlayerId"
        class="min-w-0"
        :class="notMyTurnClass"
      />
      <template #footer>
        <DiscardHudButton
          label="Discard"
          @click="onDiscard(localPlayerId)"
        />
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
        <PlayerIcon
          :player-id="opponent.id"
          :avatar-src="opponent.avatar"
        />
        <div class="flex min-w-0 flex-col gap-3">
          <DiamondCounter :gold="opponent.gold" />
          <PlayerActions
            :player-id="opponent.id"
            :class="notMyTurnClass"
            @tool-click="tool => onToolClick(opponent!.id, tool)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
