import { v4 as uuidv4 } from 'uuid'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { TGrid, TGridCell } from '@/types'

const DEFAULT_GRID_WIDTH = 5
const DEFAULT_GRID_HEIGHT = 5


function createGridCells(width: number, height: number): TGridCell[] {
  const cells: TGridCell[] = []

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

function createGrid(width = DEFAULT_GRID_WIDTH, height = DEFAULT_GRID_HEIGHT): TGrid {
  return {
    size: {
      width,
      height,
    },
    cells: createGridCells(width, height),
  }
}

export const useGridStore = defineStore('grid', () => {
  const grid = ref<TGrid>(createGrid())

  function initializeGrid(width = DEFAULT_GRID_WIDTH, height = DEFAULT_GRID_HEIGHT) {
    grid.value = createGrid(width, height)
  }

  function assignCardToCell(cellId: string, card: string) {
    const cell = grid.value.cells.find(c => c.id === cellId)
    if (cell && !cell.card) {
      cell.card = card
    }
  }

  return { grid, initializeGrid, assignCardToCell }
})
