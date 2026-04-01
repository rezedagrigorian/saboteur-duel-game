export interface ICardPort {
  group: number
  isTroll: boolean
  isGold: boolean
}

export type ICardRotation = boolean

/** Ровно четыре порта: по одному на каждую сторону карты. */
export type ICardPorts = [ICardPort?, ICardPort?, ICardPort?, ICardPort?]

export interface ICard {
  id: string
  ports: ICardPorts
  rotation: ICardRotation
  isGolden: boolean
  user: string
}
