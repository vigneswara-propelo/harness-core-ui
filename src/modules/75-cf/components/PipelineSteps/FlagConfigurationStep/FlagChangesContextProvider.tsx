/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, FC, PropsWithChildren, useContext } from 'react'
import { Feature } from 'services/cf'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { FeatureFlagConfigurationInstruction } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'

export interface FlagChangesContextProviderProps {
  flag: Feature | string
  environmentIdentifier: string
  mode: StepViewType
  readonly?: boolean
  initialInstructions?: FeatureFlagConfigurationInstruction[]
}

const FlagChangesContext = createContext<FlagChangesContextProviderProps>({
  flag: '',
  environmentIdentifier: '',
  mode: StepViewType.Edit,
  initialInstructions: []
})

const FlagChangesContextProvider: FC<PropsWithChildren<FlagChangesContextProviderProps>> = ({
  flag,
  environmentIdentifier,
  mode,
  readonly,
  initialInstructions = [],
  children
}) => {
  return (
    <FlagChangesContext.Provider value={{ flag, environmentIdentifier, mode, readonly, initialInstructions }}>
      {children}
    </FlagChangesContext.Provider>
  )
}

export const useFlagChanges = (): FlagChangesContextProviderProps => {
  return useContext(FlagChangesContext)
}

export default FlagChangesContextProvider
