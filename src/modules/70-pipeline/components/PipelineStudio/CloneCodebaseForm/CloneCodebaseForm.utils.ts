/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { SelectOption } from '@harness/uicore'
import { isRuntimeInput } from '@modules/70-pipeline/utils/CIUtils'
import { ConnectorRefWidth } from '@modules/70-pipeline/utils/constants'
import { UseStringsReturn } from 'framework/strings'
import { TypesRepository } from 'services/code'

export const runtimeInputGearWidth = 58

export const getConnectorWidth = ({
  connectorWidth,
  connectorRef
}: {
  connectorWidth?: number
  connectorRef?: string
}): number | undefined => {
  if (connectorWidth) {
    // connectorRef will be undefined for use in Steps and never subtract runtimeInputGearWidth
    return !isRuntimeInput(connectorRef) ? connectorWidth : connectorWidth - runtimeInputGearWidth
  }
  return (!isRuntimeInput(connectorRef) && ConnectorRefWidth.RightBarView) || undefined
}

export const getRepositoryOptions = ({
  gitnessRepositoriesData,
  fetchingGitnessRepos,
  getString
}: {
  gitnessRepositoriesData: TypesRepository[] | null
  fetchingGitnessRepos: boolean
  getString: UseStringsReturn['getString']
}): SelectOption[] => {
  if (fetchingGitnessRepos) {
    return [{ label: getString('common.loading'), value: 'loading' }]
  }
  if (gitnessRepositoriesData?.length) {
    return gitnessRepositoriesData.map((repoData: TypesRepository) => {
      const { uid = '' } = repoData
      return {
        label: uid,
        value: uid
      }
    })
  }
  return []
}
