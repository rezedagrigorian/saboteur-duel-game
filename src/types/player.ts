import type { ToolKind } from './card'

export interface IPlayer {
  id: string
  name: string
  avatar: string
  gold: number
  entranceCardId: string
  color: PlayerColor
  brokenTools: ToolKind[]
  totalGold: number
}

export type PlayerColor = 1 | 2
