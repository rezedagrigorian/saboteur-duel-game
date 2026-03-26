import { v4 as uuidv4 } from 'uuid'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { TCard, TCardPort } from '@/types'

function generateRandomPort(): TCardPort | undefined {
    const isEmpty = Math.random() < 0.2
    if (isEmpty) return undefined

    return {
        group: Math.floor(Math.random() * 3),
        isTroll: Math.random() < 0.5,
        isGold: Math.random() < 0.5,
    }
}


export const useCardStore = defineStore('cards', () => {
    const cards = ref<Map<string, TCard>>(new Map())

    function createRandomCard(id: string): string {
        const card: TCard = {
            id,
            ports: [
                generateRandomPort(),
                generateRandomPort(),
                generateRandomPort(),
                generateRandomPort(),
            ],
            rotation: false,
            user: uuidv4(),
            isGolden: Math.random() < 0.5,
        }
        cards.value.set(id, card)
        return id
    }

    function getCardById(id: string): TCard | undefined {
        return cards.value.get(id)
    }

    return { cards, createRandomCard, getCardById }   
})