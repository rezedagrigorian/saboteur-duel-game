import type { PlayerColor } from './player'

export interface ICardPort {
  group: number

  isRat?: boolean
  door?: PlayerColor
}

export type ICardRotation = boolean

/** Ровно четыре порта: по одному на каждую сторону карты. */
export type ICardPorts = [ICardPort?, ICardPort?, ICardPort?, ICardPort?]

export const CardStatus = {
  Deck: 'deck',
  Hand: 'hand',
  Placed: 'placed',
  Discarded: 'discarded',
} as const

export type CardStatus = (typeof CardStatus)[keyof typeof CardStatus]

export interface ICardBaseStyle {
  svg?: string
  goldSvg?: string
  doorSvg?: string
  ratSvg?: string
}

export const ToolKind = {
  Battery: 'battery',
  Navigation: 'navigation',
  Drilling: 'drilling',
} as const

export type ToolKind = (typeof ToolKind)[keyof typeof ToolKind]

export const ActionEffect = {
  Break: 'break',
  Fix: 'fix',
} as const

export type ActionEffect = (typeof ActionEffect)[keyof typeof ActionEffect]

export interface ICardAction {
  tool: ToolKind
  effect: ActionEffect
}

export interface ICardBase {
  id: string
  ports: ICardPorts
  /** [] у туннельных карт, 1 действие у обычных, 2 у двойных (выбор одного при розыгрыше). */
  actions: ICardAction[]

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
