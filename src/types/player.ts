export interface IPlayer {
  id: string
  name: string
  avatar: string
  gold: number
  entranceCardId: string
  color: PlayerColor
}

export type PlayerColor = 1 | 2
