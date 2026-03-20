import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useConnectionStore = defineStore('connection', () => {
    const status = ref('idle')
    const connection = ref(null)

    const isConnected = computed(() => status.value === 'connected')

    function connect(client = null) {
        status.value = 'connecting'
        connection.value = client
        status.value = 'connected'
    }

    function disconnect() {
        status.value = 'idle'
        connection.value = null
    }

    function setError() {
        status.value = 'error'
    }

    return { status, connection, isConnected, connect, disconnect, setError }
})
