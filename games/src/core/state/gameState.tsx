import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { ScoreState } from '../systems/scoring';
import { applyCorrect, applyWrong } from '../systems/scoring';

type GameState = ScoreState & { secondsLeft: number };

type Action =
  | { type: 'TICK' }
  | { type: 'RESET'; seconds: number }
  | { type: 'CORRECT'; attempts: number }
  | { type: 'WRONG' };

const initialState: GameState = {
  score: 0,
  combo: 0,
  stage: 1,
  stars: 0,
  secondsLeft: 75,
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'TICK':
      return { ...state, secondsLeft: Math.max(0, state.secondsLeft - 1) };
    case 'RESET':
      return { ...initialState, secondsLeft: action.seconds };
    case 'CORRECT':
      return { ...state, ...applyCorrect(state, action.attempts) };
    case 'WRONG':
      return { ...state, ...applyWrong(state) };
    default:
      return state;
  }
}

const GameStateContext = createContext<GameState>(initialState);
const GameDispatchContext = createContext<Dispatch<Action>>(() => undefined);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GameDispatchContext.Provider value={dispatch}>
      <GameStateContext.Provider value={state}>{children}</GameStateContext.Provider>
    </GameDispatchContext.Provider>
  );
}

export function useGameState() {
  return useContext(GameStateContext);
}

export function useGameDispatch() {
  return useContext(GameDispatchContext);
}
