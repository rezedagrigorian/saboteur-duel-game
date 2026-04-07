import { v4 as uuidv4 } from 'uuid'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { IGrid, IGridCell } from '@/types'
import { DEFAULT_GRID_HEIGHT, DEFAULT_GRID_WIDTH, START_CARD_ID } from '@/game-core/constants'
import { useCardStore } from './cardStore'

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

  function assignCardToCell(cellId: string, cardId: string, userId: string) {
    if (!userId.trim()) {
      return
    }
    const cell = getCellById(cellId)
    if (cell && !cell.card) {
      cell.card = cardId
      cardStore.markCardAsPlaced(cardId, userId)
      cardStore.clearSelection()
    }
  }

  return { grid, initializeGrid, assignCardToCell }
})
