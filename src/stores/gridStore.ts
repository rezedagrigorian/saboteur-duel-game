import { v4 as uuidv4 } from 'uuid'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { ICard, ICardPort, IPlayer } from '@/types'
import type { IGrid, IGridCell } from '@/types'
import type { PlayerColor } from '@/types/player'

import { 
  DEFAULT_GRID_HEIGHT,
  DEFAULT_GRID_WIDTH,
  ENTRANCE_X_OFFSET,
  GOAL_POSITIONS,
  LAVANDER_ENTRANCE_CARD_ID,
  YELLOW_ENTRANCE_CARD_ID } from '@/game-core/constants'
import { useCardStore } from './cardStore'
import { usePlayerStore } from './playerStore'


const DIRECTIONS = [
  { dx: -1, dy: 0 }, // левый сосед
  { dx: 0, dy: -1 }, // верхний сосед
  { dx: 1, dy: 0 }, // правый сосед
  { dx: 0, dy: 1 }, // нижний сосед
] as const

interface ITraceChunk {
  portIndex: number
  cardID: string

  x: number
  y: number
}

const PORT_MAPPING = [2, 3, 0, 1] as const

// 0 -> 2, 1 -> 3, 2 -> 0, 3 -> 1

// a rat blocks the passage for everyone, a door only for the opposite color
function isPortPassable(port: ICardPort | undefined, color: PlayerColor): port is ICardPort {
  if (!port) return false
  if (port.isRat) return false
  return !port.door || port.door === color
}

function createGridCells(width: number, height: number): IGridCell[] {
  const cells: IGridCell[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push({
        id: uuidv4(),
        coordinate: { x, y },
      })
    }
  }

  return cells
}

function getCellIndex(x: number, y: number, width: number): number {
  return y * width + x
}

function placeEntranceCards(grid: IGrid): void {
  const { width, height } = grid.size
  const x = width - ENTRANCE_X_OFFSET
  const centerY = Math.floor(height / 2)

  const lavanderCell = grid.cells[getCellIndex(x, centerY - 2, width)]
  const yellowCell = grid.cells[getCellIndex(x, centerY, width)]

  if (lavanderCell) lavanderCell.card = LAVANDER_ENTRANCE_CARD_ID
  if (yellowCell) yellowCell.card = YELLOW_ENTRANCE_CARD_ID
}

function createGrid(width = DEFAULT_GRID_WIDTH, height = DEFAULT_GRID_HEIGHT): IGrid {
  const grid: IGrid = {
    size: {
      width,
      height,
    },
    cells: createGridCells(width, height),
  }
  placeEntranceCards(grid)
  return grid
}

export const useGridStore = defineStore('grid', () => {
  const grid = ref<IGrid>(createGrid())
  const boardCellSize = ref(70)
  const cardStore = useCardStore()
  const playerStore = usePlayerStore()

  function initializeGrid(width = DEFAULT_GRID_WIDTH, height = DEFAULT_GRID_HEIGHT):void {
    grid.value = createGrid(width, height)
  }

  function getCellById(cellId: string): IGridCell | undefined {
    return grid.value.cells.find(c => c.id === cellId)
  }

  function getCell(x: number, y: number): IGridCell | undefined {
    return grid.value.cells.find(c => c.coordinate.x === x && c.coordinate.y === y)
  }

  function placeGoalCards(goalCardIds: string []): void {
    goalCardIds.forEach((cardId, index) => {
      const pos = GOAL_POSITIONS[index]
      if (!pos) return
      const cell = getCell(pos.x, pos.y)
      if (cell) cell.card = cardId
    })
    cardStore.markCardsAsPlaced(goalCardIds)
  }

  function startRound(goalCardIds: string[]): void {
    placeGoalCards(goalCardIds)
    cardStore.dealInitialHands(playerStore.sortedPlayerIds)
  }

  // keeps cell ids stable so the board patches instead of remounting every cell
  function resetForNewRound(): void {
    grid.value.cells.forEach(cell => { cell.card = undefined })
    placeEntranceCards(grid.value)
    cardStore.resetCards()
    playerStore.resetRoundState()
  }

  function hostStartGame(): {deckOrder: string [], goalCardIds: string []} {
    resetForNewRound()
    const goalCardIds = cardStore.pickGoalCards(GOAL_POSITIONS.length)
    cardStore.buildDeck()
    const deckOrder = [...cardStore.deckOrder]
    startRound(goalCardIds)
    return { deckOrder, goalCardIds }
  }

  function applyStartGame(deckOrder: string[], goalCardIds: string[]): void {
    resetForNewRound()
    cardStore.deckOrder = [...deckOrder]
    startRound(goalCardIds)
  }

  function getNeighborCardByDirection(x: number, y: number, directionIndex: number) : ICard | undefined {
    const direction = DIRECTIONS[directionIndex]
    if (!direction) {
      return undefined
    }
    const neighbor = getCell(x + direction.dx, y + direction.dy)
    if (neighbor && neighbor.card) {
      return cardStore.getCardById(neighbor.card)
    }
    return undefined
  }

  function isCompatibleWithNeighbors(cardId: string, cell: IGridCell): boolean {
    const ports = cardStore.getPortsByCardID(cardId)

    for (const [index, port] of ports.entries()) {
      const neighbor = getNeighborCardByDirection(cell.coordinate.x, cell.coordinate.y, index)
      if (!neighbor) {
        continue
      }
      const neighborPorts = cardStore.getPortsByCardID(neighbor.id)
      const neighborHasPort = !!neighborPorts[PORT_MAPPING[index]]

      if (port && !neighborHasPort || !port && neighborHasPort) {
        return false
      }
    }
    return true
  }

  function goldTrace(player:IPlayer) {
    const queue: ITraceChunk[] = []
    const visited = new Set<string>()
    const countedGold = new Set<string>()

    const entranceCardId = player.entranceCardId
    if (!entranceCardId) return 0

    const startCardCell = grid.value.cells.find(c => c.card === entranceCardId)
    if (!startCardCell) return 0

    const startPorts = cardStore.getPortsByCardID(entranceCardId)

    for(const [index, port] of startPorts.entries()) {
      if(isPortPassable(port, player.color)) {
        queue.push({
          portIndex: index,
          cardID: entranceCardId,
          x: startCardCell.coordinate.x,
          y: startCardCell.coordinate.y,
        })
      }
    }

    let total = 0

    while(queue.length > 0) {
      const { portIndex, cardID, x, y } = queue.shift()!
      const stateKey = `${x},${y},${cardID},${portIndex}`

      if (visited.has(stateKey)) {
        continue
      }
      visited.add(stateKey)

      const neighbour = getNeighborCardByDirection(x, y, portIndex)
      if (!neighbour) {
        continue
      }

      const inPort = neighbour.ports[PORT_MAPPING[portIndex]]
      if (!isPortPassable(inPort, player.color)) continue

      const goldAmount = neighbour.gold?.[inPort.group]
      if (goldAmount !== undefined) {
        const owner = neighbour.goldOwners?.[inPort.group]

        if (owner === undefined || owner === player.id) {
          const goldKey = `${neighbour.id}:${inPort.group}`

          if (!countedGold.has(goldKey)) {
            total += goldAmount
            countedGold.add(goldKey)

            if (owner === undefined) {
              if (!neighbour.goldOwners) neighbour.goldOwners = {}
              neighbour.goldOwners[inPort.group] = player.id
            }
          }
        }
      }

      const outPorts = cardStore.getOutPortsByCardIDAndPortIndex(neighbour.id, PORT_MAPPING[portIndex])
      if (!outPorts) {
        continue
      }
      outPorts.forEach((outPort, index) => {
        if (isPortPassable(outPort, player.color)) {
          queue.push({
            portIndex: index,
            cardID: neighbour.id,
            x: x + DIRECTIONS[portIndex].dx,
            y: y + DIRECTIONS[portIndex].dy,
          })
        }
      })
    }

    playerStore.setGold(player.id, total)
    return total
  }


  function trace(cardId: string, cell: IGridCell): boolean | undefined {
    const queue: ITraceChunk[] = []
    const visited = new Set<string>()

    const startPorts = cardStore.getPortsByCardID(cardId)
    for (const [index, port] of startPorts.entries()) {
      if (isPortPassable(port, playerStore.currentPlayerColor)) {
        queue.push({
          portIndex: index,
          cardID: cardId,
          x: cell.coordinate.x,
          y: cell.coordinate.y,
        })
      }
    }

    while (queue.length > 0) {
      const { portIndex, cardID, x, y } = queue.shift()!

      const stateKey = `${x},${y},${cardID},${portIndex}`
      if (visited.has(stateKey)) {
        continue
      }
      visited.add(stateKey)

      if (cardID === playerStore.currentPlayer?.entranceCardId) {
        return true
      }
      const neighbour = getNeighborCardByDirection(x, y, portIndex)
      if (!neighbour) {
        continue
      }
      const inPort = neighbour.ports[PORT_MAPPING[portIndex]]
      if (!isPortPassable(inPort, playerStore.currentPlayerColor)) continue

      const outPorts = cardStore.getOutPortsByCardIDAndPortIndex(neighbour.id, PORT_MAPPING[portIndex])
      if (!outPorts) {
        continue
      }
      outPorts.forEach((outPort, index) => {
        if (isPortPassable(outPort, playerStore.currentPlayerColor)) {
          queue.push({
            portIndex: index,
            cardID: neighbour.id,
            x: x + DIRECTIONS[portIndex].dx,
            y: y + DIRECTIONS[portIndex].dy,
          })
        }
      })
    }
    return false
  }

  function assignCardToCell(cellId: string, cardId: string, playerId: string): boolean {
    if(playerId !== playerStore.currentPlayerId) return false
    if (playerStore.currentPlayer?.brokenTools.length) return false

    const cell = getCellById(cellId)
    if(!cell) return false
    if (cell.card) return false

    if (!isCompatibleWithNeighbors(cardId, cell)) {
      return false
    }

    if (!trace(cardId, cell)) {
      return false
    }

    cell.card = cardId
    cardStore.markCardAsPlaced(cardId, playerId)
    cardStore.clearSelection()
    cardStore.drawCard(playerId)

    // the player who placed the card claims contested gold first, so both clients agree on the order
    const placingPlayer = playerStore.currentPlayer
    const others = playerStore.players.filter(player => player.id !== playerId)
    if (placingPlayer) goldTrace(placingPlayer)
    others.forEach(player => goldTrace(player))

    playerStore.endTurn()
    return true
  }

  return {
    grid,
    boardCellSize,
    initializeGrid,
    assignCardToCell,
    getCell,
    hostStartGame,
    applyStartGame,
    getCellById,
  }
})