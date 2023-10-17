/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { get } from 'lodash-es'
import { useFormikContext } from 'formik'
import * as Yup from 'yup'
import {
  AllowedTypes,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  Text
} from '@harness/uicore'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { CFPipelineInstructionType } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import SubSection from '../../SubSection'
import { SubSectionComponent } from '../../subSection.types'
import { useFlagChanges } from '../../../FlagChangesContextProvider'
import { getAllowableTypes } from '../getAllowableTypes'
import { withPrefix } from '../withPrefix'

export const defaultOnRuleSchema = (getString: UseStringsReturn['getString']): Yup.Schema<unknown> =>
  Yup.object({
    spec: Yup.object({
      variation: Yup.string().required(getString('cf.featureFlags.flagPipeline.validation.defaultOnRule.onVariation'))
    })
  })

const DefaultOnRule: SubSectionComponent = ({ prefixPath, ...props }) => {
  const { setFieldValue, values } = useFormikContext()
  const [inputType, setInputType] = useState<MultiTypeInputType>(() =>
    getMultiTypeFromValue(get(values, withPrefix(prefixPath, 'spec.variation')))
  )
  const { getString } = useStrings()
  const { flag, mode, readonly } = useFlagChanges()

  const items = useMemo<SelectOption[]>(() => {
    if (typeof flag === 'object') {
      return flag.variations.map(({ name, identifier }) => ({ label: name || identifier, value: identifier }))
    }

    return []
  }, [flag])

  const allowableTypes = useMemo<MultiTypeInputType[]>(() => getAllowableTypes(mode, { flag }), [mode, flag])

  useEffect(() => {
    if (!allowableTypes.includes(inputType)) {
      setInputType(allowableTypes[0])
      setFieldValue(
        withPrefix(prefixPath, 'spec.variation'),
        isMultiTypeRuntime(allowableTypes[0]) ? RUNTIME_INPUT_VALUE : ''
      )
    }
  }, [allowableTypes, inputType, prefixPath, setFieldValue])

  useEffect(() => {
    setFieldValue(
      withPrefix(prefixPath, 'identifier'),
      `${CFPipelineInstructionType.SET_DEFAULT_ON_VARIATION}Identifier`
    )
    setFieldValue(withPrefix(prefixPath, 'type'), CFPipelineInstructionType.SET_DEFAULT_ON_VARIATION)
  }, [prefixPath, setFieldValue])

  const onTypeChange = useCallback(
    newType => {
      setFieldValue(withPrefix(prefixPath, 'spec.variation'), '')
      setInputType(newType)
    },
    [prefixPath, setFieldValue]
  )

  return (
    <SubSection data-testid="flagChanges-defaultOnRule" {...props}>
      {mode === StepViewType.DeploymentForm &&
        (items.length ? (
          <FormInput.Select
            name={withPrefix(prefixPath, 'spec.variation')}
            placeholder={getString('cf.pipeline.flagConfiguration.selectVariation')}
            items={items}
            label={getString('cf.pipeline.flagConfiguration.whenTheFlagIsOnServe')}
            disabled={readonly}
            usePortal
          />
        ) : (
          <Text>{getString('cf.pipeline.flagConfiguration.pleaseSelectFlag')}</Text>
        ))}

      {mode !== StepViewType.DeploymentForm && (
        <FormInput.MultiTypeInput
          name={withPrefix(prefixPath, 'spec.variation')}
          placeholder={getString('cf.pipeline.flagConfiguration.selectVariation')}
          useValue
          selectItems={items}
          label={getString('cf.pipeline.flagConfiguration.whenTheFlagIsOnServe')}
          multiTypeInputProps={{
            allowableTypes: allowableTypes as AllowedTypes,
            multitypeInputValue: inputType,
            onTypeChange
          }}
          disabled={readonly}
        />
      )}
    </SubSection>
  )
}

export default DefaultOnRule
