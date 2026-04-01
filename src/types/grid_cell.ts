import type { ICoordinate } from './coordinate'

export interface IGridCell {
  coordinate: ICoordinate
  id: string
  card?: string
}
