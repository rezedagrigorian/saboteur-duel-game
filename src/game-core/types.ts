export interface GameState {
  id: string
  mode: string
  status: string
  turn: number
  currentPlayer: string
  winnerId: string | null
}

export const GAME_STATE: GameState = {
  id: 'match_001',
  mode: 'solo',
  status: 'active',
  turn: 1,
  currentPlayer: 'player_1',
  winnerId: null,
}
