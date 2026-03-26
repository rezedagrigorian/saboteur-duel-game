<script setup lang="ts">
import type { TGridCell } from '@/types'

import { useGridStore } from '../../stores/gridStore'
import { useCardStore } from '../../stores/cardStore'
import Card from '../cards/Card.vue'

const props = defineProps<TGridCell>()

const { assignCardToCell } = useGridStore()
const cardStore = useCardStore()

function handleClick() {
  const cardId = cardStore.createRandomCard(props.id)
  assignCardToCell(props.id, cardId)
}
</script>

<template>
  <button
    type="button"
    class="aspect-[5/7] w-full min-w-0 border border-neutral-900 p-2"
    @click="handleClick"
  >
    <div style="font-size: 10px">
      <h6>{{ id }}</h6>
      <Card
        v-if="card"
        :card-id="card"
      />
    </div>
  </button>
</template>
