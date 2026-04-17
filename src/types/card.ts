export interface ICardPort {
  group: number
  isTroll: boolean
  isGold: boolean
}

export type ICardRotation = boolean

/** Ровно четыре порта: по одному на каждую сторону карты. */
export type ICardPorts = [ICardPort?, ICardPort?, ICardPort?, ICardPort?]

export enum CardStatus {
  Deck = 'deck',
  Hand = 'hand',
  Placed = 'placed',
}

export interface ICardBase {
  id: string
  ports: ICardPorts
  isGolden: boolean
}

export interface ICard extends ICardBase {
  status: CardStatus
  owner: string | null
  rotation: ICardRotation
}
