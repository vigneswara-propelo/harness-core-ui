/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty } from 'lodash-es'
import { useFormikContext } from 'formik'
import { Spinner } from '@blueprintjs/core'

import { AllowedTypes, getMultiTypeFromValue, Layout, MultiTypeInputType, useToaster } from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { useDeepCompareEffect } from '@common/hooks'
import { isValueFixed } from '@common/utils/utils'

import { MultiTypeEnvironmentGroupField } from '@pipeline/components/FormMultiTypeEnvironmentGroupField/FormMultiTypeEnvironmentGroupField'

import type { DeployEnvironmentEntityConfig } from '../DeployEnvironmentEntityStep/types'
import { useGetEnvironmentGroupsData } from '../DeployEnvironmentEntityStep/DeployEnvironmentGroup/useGetEnvironmentGroupsData'

import css from './DeployEnvironmentGroupStep.module.scss'

export interface DeployEnvironmentGroupInputStepProps {
  allowableTypes: AllowedTypes
  inputSetData?: {
    template?: DeployEnvironmentEntityConfig
    path?: string
    readonly?: boolean
    allValues?: DeployEnvironmentEntityConfig
  }
  gitOpsEnabled: boolean
}

export default function DeployEnvironmentGroupInputStep({
  allowableTypes,
  inputSetData
}: DeployEnvironmentGroupInputStepProps): React.ReactElement {
  const { getString } = useStrings()
  const { showWarning } = useToaster()
  const formik = useFormikContext<DeployEnvironmentEntityConfig>()

  const pathPrefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
  const environmentGroupValue = get(formik.values, `${pathPrefix}environmentGroup.envGroupRef`)

  // API
  const {
    loadingEnvironmentGroupsList,
    // This is required only when updating the entities list
    updatingEnvironmentGroupsList,
    nonExistingEnvironmentGroupIdentifiers
  } = useGetEnvironmentGroupsData({
    environmentGroupIdentifiers:
      isValueFixed(environmentGroupValue) && !isEmpty(environmentGroupValue) ? [environmentGroupValue] : []
  })

  useDeepCompareEffect(() => {
    if (nonExistingEnvironmentGroupIdentifiers.length) {
      showWarning(
        getString('cd.identifiersDoNotExist', {
          entity: getString('common.environmentGroup.label'),
          nonExistingIdentifiers: nonExistingEnvironmentGroupIdentifiers.join(', ')
        })
      )
    }
  }, [nonExistingEnvironmentGroupIdentifiers])

  const loading = loadingEnvironmentGroupsList || updatingEnvironmentGroupsList

  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.environmentGroup?.envGroupRef) === MultiTypeInputType.RUNTIME && (
        <Layout.Horizontal spacing="medium" style={{ alignItems: 'flex-end' }}>
          <MultiTypeEnvironmentGroupField
            tooltipProps={{ dataTooltipId: 'specifyYourEnvironmentGroup' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironmentGroup')}
            name={`${pathPrefix}environmentGroup.envGroupRef`}
            placeholder={getString('cd.pipelineSteps.environmentTab.selectEnvironmentGroup')}
            setRefValue
            multiTypeProps={{
              allowableTypes: (allowableTypes as MultiTypeInputType[])?.filter(
                item => item !== MultiTypeInputType.EXPRESSION && item !== MultiTypeInputType.EXECUTION_TIME
              ) as AllowedTypes
            }}
            disabled={inputSetData?.readonly}
            className={css.inputWidth}
          />
          {loading ? <Spinner className={css.inputSetSpinner} size={16} /> : null}
        </Layout.Horizontal>
      )}
    </>
  )
}
