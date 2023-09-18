/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import * as Yup from 'yup'
import { FormInput, MultiTypeInputType } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { CFPipelineInstructionType } from '../../types'
import SubSection from '../SubSection'
import type { SubSectionComponent } from '../subSection.types'
import css from './SetFlagSwitch.module.scss'

export const setFlagSwitchSchema = (getString: UseStringsReturn['getString']): Yup.Schema<unknown> =>
  Yup.object({
    spec: Yup.object({
      state: Yup.string().required(getString('cf.featureFlags.flagPipeline.validation.setFlagSwitch.state'))
    })
  })

const SetFlagSwitch: SubSectionComponent = ({ prefix, ...props }) => {
  const { getString } = useStrings()
  const { setFieldValue } = useFormikContext()

  useEffect(() => {
    setFieldValue(prefix('identifier'), `${CFPipelineInstructionType.SET_FEATURE_FLAG_STATE}Identifier`)
    setFieldValue(prefix('type'), CFPipelineInstructionType.SET_FEATURE_FLAG_STATE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <SubSection data-testid="flagChanges-setFlagSwitch" {...props}>
      <FormInput.MultiTypeInput
        name={prefix('spec.state')}
        useValue
        className={css.hideLabelText}
        selectItems={[
          { label: getString('common.ON'), value: FeatureFlagActivationStatus.ON },
          { label: getString('common.OFF'), value: FeatureFlagActivationStatus.OFF }
        ]}
        label={getString('cf.pipeline.flagConfiguration.switchTo')}
        placeholder={getString('cf.pipeline.flagConfiguration.selectOnOrOff')}
        multiTypeInputProps={{
          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
        }}
      />
    </SubSection>
  )
}

export default SetFlagSwitch
