import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useGameStore = defineStore('game', () => {
    const isGameStarted = ref(false)
    const phase = ref('lobby')

    const canStartGame = computed(() => !isGameStarted.value)

    function startGame() {
        isGameStarted.value = true
        phase.value = 'playing'
    }

    function endGame() {
        isGameStarted.value = false
        phase.value = 'finished'
    }

    function resetGame() {
        isGameStarted.value = false
        phase.value = 'lobby'
    }

    return { isGameStarted, phase, canStartGame, startGame, endGame, resetGame }
})
