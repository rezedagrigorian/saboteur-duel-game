export type TCardPort = {
    group: number
    isTroll: boolean
    isGold: boolean
}

export type TCardRotation = boolean

/** Ровно четыре порта: по одному на каждую сторону карты. */
export type TCardPorts = [TCardPort?, TCardPort?, TCardPort?, TCardPort?]

export type TCard = {
  id: string
  ports: TCardPorts
  rotation: TCardRotation
  isGolden: boolean
  user: string
}