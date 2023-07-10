import { isEmpty } from 'lodash-es'
import React, { ReactElement, ReactNode, useEffect } from 'react'
import { parseJSON } from './utils'
export interface StepsProgress {
  [key: string]: {
    stepData: any
    isComplete?: boolean
  }
}

export interface OnboardingStoreContextProps {
  children?: ReactNode
  activeStepId?: string
  stepsProgress: StepsProgress
  localStorageKey?: string
  updateOnboardingStore: (data: OnboardingStoreState) => void
}

type OnboardingStoreState = Omit<OnboardingStoreContextProps, 'updateOnboardingStore'>
export const OnboardingStoreContext = React.createContext<OnboardingStoreContextProps>({
  stepsProgress: {},
  updateOnboardingStore: () => void 0
})

export function useOnboardingStore(): OnboardingStoreContextProps {
  return React.useContext(OnboardingStoreContext)
}
export function OnboardingStoreProvider(props: React.PropsWithChildren<OnboardingStoreContextProps>): ReactElement {
  const [state, setState] = React.useState<OnboardingStoreState>((): OnboardingStoreState => {
    if (props.localStorageKey) {
      const data = parseJSON(localStorage.getItem(props.localStorageKey) as string)
      if (!isEmpty(data)) {
        return data as OnboardingStoreState
      }
    }
    return {
      stepsProgress: {}
    }
  })

  useEffect(() => {
    if (props.localStorageKey) {
      localStorage.setItem(props.localStorageKey, JSON.stringify(state))
    }
  }, [state, props.localStorageKey])

  const updateOnboardingStore = React.useCallback(function updateOnboardingStore(data: OnboardingStoreState): void {
    setState(prevState => ({
      ...prevState,
      ...data
    }))
  }, [])
  return (
    <OnboardingStoreContext.Provider
      value={{
        ...state,
        updateOnboardingStore
      }}
    >
      {props.children}
    </OnboardingStoreContext.Provider>
  )
}
