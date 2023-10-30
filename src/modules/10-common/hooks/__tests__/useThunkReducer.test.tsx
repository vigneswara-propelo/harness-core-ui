import { act, renderHook } from '@testing-library/react-hooks'
import { cleanup } from '@testing-library/react'
import { ThunkAction, useThunkReducer } from '../useThunkReducer'

interface ReducerState {
  count: number
}

interface IncrementAction {
  type: 'increment'
}

interface DecrementAction {
  type: 'decrement'
}

type Actions = IncrementAction | DecrementAction

function reducer(state: ReducerState, { type }: Actions): ReducerState {
  switch (type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    default:
      return state
  }
}

function increment(): IncrementAction {
  return {
    type: 'increment'
  }
}

function decrement(): DecrementAction {
  return {
    type: 'decrement'
  }
}

describe('useThunkReducer tests', () => {
  afterEach(cleanup)

  test('initializes state properly', () => {
    const { result } = renderHook(() => useThunkReducer(reducer, { count: 0 }))

    expect(result.current[0]).toEqual({ count: 0 })
  })

  test('return state and dispatcher', () => {
    const { result } = renderHook(() => useThunkReducer(reducer, { count: 0 }))

    expect(result.current).toHaveLength(3)
    expect(result.current[0]).toEqual({ count: 0 })
    expect(result.current[1]).toBeInstanceOf(Function)
  })

  test('dispatches action', () => {
    const { result } = renderHook(() => useThunkReducer(reducer, { count: 0 }))
    const [, dispatch] = result.current

    expect(result.current[0].count).toEqual(0)
    act(() => dispatch(increment()))
    expect(result.current[0].count).toEqual(1)
  })

  test('dispatches several actions', () => {
    const { result } = renderHook(() => useThunkReducer(reducer, { count: 0 }))
    const [, dispatch] = result.current

    expect(result.current[0].count).toEqual(0)
    act(() => dispatch(increment()))
    act(() => dispatch(increment()))
    act(() => dispatch(increment()))
    act(() => dispatch(decrement()))
    expect(result.current[0].count).toEqual(2)
  })

  test('dispatches thunk action', () => {
    function incrementThunk(): ThunkAction<ReducerState, Actions> {
      return async (dispatch, getState) => {
        const stateA = getState()
        expect(stateA.count).toEqual(0)

        act(() => dispatch(increment()))

        const stateB = getState()
        expect(stateA.count).toEqual(0)
        expect(stateB.count).toEqual(1)
      }
    }

    const { result } = renderHook(() => useThunkReducer(reducer, { count: 0 }))
    const [, dispatch] = result.current

    expect(result.current[0].count).toEqual(0)
    act(() => dispatch(incrementThunk()))
    expect(result.current[0].count).toEqual(1)
  })

  test('dispatches nested actions', () => {
    function incrementInner(): ThunkAction<ReducerState, Actions> {
      return async dispatch => {
        act(() => dispatch(increment()))
      }
    }

    function incrementOuter(): ThunkAction<ReducerState, Actions> {
      return async dispatch => {
        act(() => dispatch(incrementInner()))
      }
    }

    const { result } = renderHook(() => useThunkReducer(reducer, { count: 0 }))
    const [, dispatch] = result.current

    expect(result.current[0].count).toEqual(0)
    act(() => dispatch(incrementOuter()))
    expect(result.current[0].count).toEqual(1)
  })

  test('dispatches asynchronous action', done => {
    function incrementThunkAsync(): ThunkAction<ReducerState, Actions> {
      return async (dispatch, getState) => {
        const stateOne = getState()
        expect(stateOne.count).toEqual(0)

        setTimeout(() => {
          const stateTwo = getState()
          expect(stateOne.count).toEqual(0)
          expect(stateTwo.count).toEqual(1)
          act(() => dispatch(increment()))
          const stateC = getState()
          expect(stateOne.count).toEqual(0)
          expect(stateTwo.count).toEqual(1)
          expect(stateC.count).toEqual(2)
          done()
        }, 100)
      }
    }

    const { result } = renderHook(() => useThunkReducer(reducer, { count: 0 }))
    const [, dispatch] = result.current

    expect(result.current[0].count).toEqual(0)
    act(() => dispatch(incrementThunkAsync()))
    act(() => dispatch(increment()))
    expect(result.current[0].count).toEqual(1)
  })
})
