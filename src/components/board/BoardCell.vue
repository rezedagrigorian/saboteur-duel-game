<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'

import type { IGridCell } from '@/types'

import { useCardStore } from '@/stores/cardStore'
import { useGridStore } from '@/stores/gridStore'

import Card from '../cards/Card.vue'

const props = defineProps<IGridCell>()

const { assignCardToCell } = useGridStore()
const cardStore = useCardStore()

function handleClick() {
  if (props.card) {
    return
  }
  const cardId = uuidv4()
  cardStore.createRandomCard(cardId)
  assignCardToCell(props.id, cardId)
}
</script>

<template>
  <button
    type="button"
    class="aspect-[5/7] w-full min-w-0 border border-neutral-900 p-2 transition-colors"
    @click="handleClick"
  >
    <Card
      v-if="card"
      :card-id="card"
    />
  </button>
</template>
