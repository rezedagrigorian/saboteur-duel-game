<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUiStore, UI_SCREENS } from './stores/uiStore'
import LobbyView from './components/views/LobbyView.vue'
import MatchView from './components/views/MatchView.vue'
import ResultView from './components/views/ResultView.vue'

const VIEW_BY_SCREEN = Object.freeze({
    [UI_SCREENS.LOBBY]: LobbyView,
    [UI_SCREENS.MATCH]: MatchView,
    [UI_SCREENS.RESULT]: ResultView
})

const uiStore = useUiStore()
const { currentScreen } = storeToRefs(uiStore)

const activeView = computed(() => VIEW_BY_SCREEN[currentScreen.value] ?? LobbyView)
</script>

<template>
  <div>
    <div class="flex gap-2 justify-center m-4">
      <button
        class="p-2 rounded-lg transition-all duration-200 hover:bg-neutral-200"
        type="button"
        @click="uiStore.goToLobby"
      >
        Lobby
      </button>
      <button
        class="p-2 rounded-lg transition-all duration-200 hover:bg-neutral-200"
        type="button"
        @click="uiStore.goToMatch"
      >
        Match
      </button>
      <button
        class="p-2 rounded-lg transition-all duration-200 hover:bg-neutral-200"
        type="button"
        @click="uiStore.goToResult"
      >
        Result
      </button>
    </div>
    <component :is="activeView" />
  </div>
</template>
