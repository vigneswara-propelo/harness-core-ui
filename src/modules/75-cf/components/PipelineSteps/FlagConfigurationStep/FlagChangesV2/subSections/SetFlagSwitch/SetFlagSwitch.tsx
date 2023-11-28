/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import * as Yup from 'yup'
import { FormInput, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { CFPipelineInstructionType, FeatureFlagConfigurationInstruction } from '../../../types'
import SubSection from '../../SubSection'
import type { SubSectionComponent } from '../../subSection.types'
import { useFlagChanges } from '../../../FlagChangesContextProvider'
import { getAllowableTypes } from '../../utils/getAllowableTypes'
import { withPrefix } from '../../utils/withPrefix'

import css from './SetFlagSwitch.module.scss'

export const setFlagSwitchSchema = (getString: UseStringsReturn['getString']): Yup.Schema<unknown> =>
  Yup.object({
    spec: Yup.object({
      state: Yup.string().required(getString('cf.featureFlags.flagPipeline.validation.setFlagSwitch.state'))
    })
  })

export const hasSetFlagSwitchRuntime = (instruction: FeatureFlagConfigurationInstruction): boolean =>
  instruction.type === CFPipelineInstructionType.SET_FEATURE_FLAG_STATE &&
  instruction.spec.state === RUNTIME_INPUT_VALUE

const SetFlagSwitch: SubSectionComponent = ({ prefixPath, ...props }) => {
  const { getString } = useStrings()
  const { setFieldValue } = useFormikContext()
  const { mode, readonly } = useFlagChanges()

  useEffect(() => {
    setFieldValue(withPrefix(prefixPath, 'identifier'), `${CFPipelineInstructionType.SET_FEATURE_FLAG_STATE}Identifier`)
    setFieldValue(withPrefix(prefixPath, 'type'), CFPipelineInstructionType.SET_FEATURE_FLAG_STATE)
  }, [prefixPath, setFieldValue])

  const allowableTypes = useMemo(() => getAllowableTypes(mode), [mode])

  return (
    <SubSection data-testid="flagChanges-setFlagSwitch" {...props}>
      <FormInput.MultiTypeInput
        name={withPrefix(prefixPath, 'spec.state')}
        useValue
        className={css.hideLabelText}
        selectItems={[
          { label: getString('common.ON'), value: FeatureFlagActivationStatus.ON },
          { label: getString('common.OFF'), value: FeatureFlagActivationStatus.OFF }
        ]}
        label={getString('cf.pipeline.flagConfiguration.switchTo')}
        placeholder={getString('cf.pipeline.flagConfiguration.selectOnOrOff')}
        multiTypeInputProps={{ allowableTypes, resetExpressionOnFixedTypeChange: true }}
        disabled={readonly}
      />
    </SubSection>
  )
}

SetFlagSwitch.stringIdentifier = 'cf.pipeline.flagConfiguration.setFlagSwitch'

export default SetFlagSwitch
