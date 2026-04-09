import { v4 as uuidv4 } from 'uuid'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { ICard } from '@/types'
import type { IGrid, IGridCell } from '@/types'

import { DEFAULT_GRID_HEIGHT, DEFAULT_GRID_WIDTH, START_CARD_ID } from '@/game-core/constants'
import { useCardStore } from './cardStore'

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

const cardStore = useCardStore()
const startCard = cardStore.getCardById(START_CARD_ID)

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

function getCellIndex(x: number, y: number, width: number) {
  return y * width + x
}

function placeStartCard(grid: IGrid) {
  const startCellIndex = getCellIndex(grid.size.width - 2, Math.floor((grid.size.height - 1) / 2), grid.size.width)
  const startCell = grid.cells[startCellIndex]
  if (startCell) {
    startCell.card = START_CARD_ID
  }
}

function createGrid(width = DEFAULT_GRID_WIDTH, height = DEFAULT_GRID_HEIGHT): IGrid {
  const grid: IGrid = {
    size: {
      width,
      height,
    },
    cells: createGridCells(width, height),
  }
  placeStartCard(grid)
  return grid
}

export const useGridStore = defineStore('grid', () => {
  const grid = ref<IGrid>(createGrid())
  const cardStore = useCardStore()

  function initializeGrid(width = DEFAULT_GRID_WIDTH, height = DEFAULT_GRID_HEIGHT) {
    grid.value = createGrid(width, height)
  }

  function getCellById(cellId: string) {
    return grid.value.cells.find(c => c.id === cellId)
  }

  function getCell(x: number, y: number) {
    return grid.value.cells.find(c => c.coordinate.x === x && c.coordinate.y === y)
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

  function trace(cardId: string, cell: IGridCell): boolean {
    const queue: ITraceChunk[] = []

    const startPorts = cardStore.getPortsByCardID(cardId)
    for (const [index, port] of startPorts.entries()) {
      if (port) {
        queue.push({
          portIndex: index,
          cardID: cardId,
          x: cell.coordinate.x,
          y: cell.coordinate.y,
        })
      }
    }
    console.log('startPorts', queue)    

    while (queue.length > 0) {
      console.log('queue', JSON.stringify(queue))
      const { portIndex, cardID, x, y } = queue.shift()!
      if (cardID === START_CARD_ID) {
        console.log('found start card')
        return true
      }
      const neighbour = getNeighborCardByDirection(x, y, portIndex)
      if (!neighbour) {
        continue
      }
      const outPorts = cardStore.getOutPortsByCardIDAndPortIndex(neighbour.id, PORT_MAPPING[portIndex])
      if (!outPorts) {
        continue
      }
      outPorts.forEach((outPort, index) => {
        if (outPort) {
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

  function assignCardToCell(cellId: string, cardId: string, userId: string) {
    if (!userId.trim()) {
      return
    }
    const cell = getCellById(cellId)
    if(!cell) return
    
    if (!trace(cardId, cell)) {
      return
    }

    if (!cell.card) {
      cell.card = cardId
      cardStore.markCardAsPlaced(cardId, userId)
      cardStore.clearSelection()
    }
  }

  return { grid, initializeGrid, assignCardToCell }
})