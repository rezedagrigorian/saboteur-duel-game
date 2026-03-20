import { defineStore } from 'pinia'
import { ref } from 'vue'

export const UI_SCREENS = Object.freeze({
    LOBBY: 'lobby',
    MATCH: 'match',
    RESULT: 'result'
})

export const useUiStore = defineStore('ui', () => {
    const currentScreen = ref(UI_SCREENS.LOBBY)

    function goToLobby() {
        currentScreen.value = UI_SCREENS.LOBBY
    }

    function goToMatch() {
        currentScreen.value = UI_SCREENS.MATCH
    }

    function goToResult() {
        currentScreen.value = UI_SCREENS.RESULT
    }

    return { currentScreen, goToLobby, goToMatch, goToResult }
})
