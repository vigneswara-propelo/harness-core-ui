/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

export const ConfigurationContext = React.createContext({})

interface ConfigurationContextValue {
  fetchMonitoredService?: () => void
  isTemplateByReference?: boolean
}

export const useConfigurationContext = (): ConfigurationContextValue => React.useContext(ConfigurationContext)

export const ConfigurationContextProvider = (
  props: React.PropsWithChildren<ConfigurationContextValue>
): JSX.Element => {
  return <ConfigurationContext.Provider value={{ ...props }}>{props.children}</ConfigurationContext.Provider>
}
