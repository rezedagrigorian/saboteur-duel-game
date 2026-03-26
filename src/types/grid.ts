import type { TGridSize } from './grid_size'
import type { TGridCell } from './grid_cell'

export type TGrid = {
  size: TGridSize
  cells: TGridCell[]
}
