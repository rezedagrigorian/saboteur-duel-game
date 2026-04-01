import type { IGridSize } from './grid_size'
import type { IGridCell } from './grid_cell'

export interface IGrid {
  size: IGridSize
  cells: IGridCell[]
}
