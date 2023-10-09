/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { connect } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType, AllowedTypes, Layout } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { isValueRuntimeInput } from '@common/utils/utils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ECSServiceSetupStepElementConfig } from '@pipeline/utils/types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface ECSServiceSetupStepInputSetProps {
  allowableTypes: AllowedTypes
  inputSetData: {
    template?: ECSServiceSetupStepElementConfig
    path?: string
    readonly?: boolean
    allValues?: ECSServiceSetupStepElementConfig
  }
}

const ECSServiceSetupStepInputSet = (props: ECSServiceSetupStepInputSetProps): React.ReactElement => {
  const { inputSetData, allowableTypes } = props
  const { template, path, readonly } = inputSetData
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeDurationField
            name={`${prefix}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            disabled={readonly}
          />
        </div>
      )}

      {isValueRuntimeInput(template?.spec?.sameAsAlreadyRunningInstances) && (
        <Layout.Horizontal
          flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
          className={cx(stepCss.formGroup, stepCss.md)}
          margin={{ top: 'medium' }}
        >
          <FormMultiTypeCheckboxField
            className={stepCss.checkboxInputSetView}
            name={`${prefix}spec.sameAsAlreadyRunningInstances`}
            label={getString('cd.ecsRollingDeployStep.sameAsAlreadyRunningInstances')}
            disabled={readonly}
            multiTypeTextbox={{
              expressions,
              allowableTypes,
              disabled: readonly,
              defaultValueToReset: false
            }}
            setToFalseWhenEmpty={true}
          />
        </Layout.Horizontal>
      )}
    </>
  )
}

export const ECSServiceSetupStepInputSetMode = connect(ECSServiceSetupStepInputSet)
