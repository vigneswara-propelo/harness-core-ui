/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, FC, PropsWithChildren, useContext } from 'react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { Feature } from 'services/cf'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { FeatureFlagConfigurationInstruction } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'

export interface FlagChangesContextProviderProps {
  flag: Feature | string
  environmentIdentifier: string
  projectIdentifier?: string
  accountIdentifier?: string
  orgIdentifier?: string
  mode: StepViewType
  readonly?: boolean
  initialInstructions?: FeatureFlagConfigurationInstruction[] | typeof RUNTIME_INPUT_VALUE
  allRuntime?: boolean
}

const FlagChangesContext = createContext<FlagChangesContextProviderProps>({
  flag: '',
  environmentIdentifier: '',
  projectIdentifier: '',
  accountIdentifier: '',
  orgIdentifier: '',
  mode: StepViewType.Edit,
  initialInstructions: [],
  allRuntime: false
})

const FlagChangesContextProvider: FC<PropsWithChildren<FlagChangesContextProviderProps>> = ({
  flag,
  environmentIdentifier,
  accountIdentifier,
  projectIdentifier,
  orgIdentifier,
  mode,
  readonly,
  initialInstructions = [],
  allRuntime = false,
  children
}) => {
  return (
    <FlagChangesContext.Provider
      value={{
        flag,
        environmentIdentifier,
        projectIdentifier,
        accountIdentifier,
        orgIdentifier,
        mode,
        readonly,
        initialInstructions,
        allRuntime
      }}
    >
      {children}
    </FlagChangesContext.Provider>
  )
}

export const useFlagChanges = (): FlagChangesContextProviderProps => {
  return useContext(FlagChangesContext)
}

export default FlagChangesContextProvider
