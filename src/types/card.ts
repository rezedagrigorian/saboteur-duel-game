import type { PlayerColor } from './player'



export interface ICardPort {
  group: number

  isRat?: boolean
  door?: PlayerColor
}

export type ICardRotation = boolean

/** Ровно четыре порта: по одному на каждую сторону карты. */
export type ICardPorts = [ICardPort?, ICardPort?, ICardPort?, ICardPort?]

export enum CardStatus {
  Deck = 'deck',
  Hand = 'hand',
  Placed = 'placed',
}

export interface ICardBaseStyle {
  svg?: string
  goldSvg?: string
  doorSvg?: string
  ratSvg?: string
}

export enum CardAction {
  BreakFlashlight = 'break_flashlight',
  FixFlashlight = 'fix_flashlight',
  BreakWagon = 'break_wagon',
  FixWagon = 'fix_wagon',
}

export interface ICardBase {
  id: string
  ports: ICardPorts
  action: CardAction | null

  // gold is a mapping from group number to gold amount, if any
  gold?: Record<number, number>
  // gold owners is a mapping from group number to player id 
  goldOwners?: Record<number, string>

  isGolden: boolean
  style: ICardBaseStyle
}

export interface ICard extends ICardBase {
  status: CardStatus
  owner: string | null
  rotation: ICardRotation
  isRevealed: boolean
}
