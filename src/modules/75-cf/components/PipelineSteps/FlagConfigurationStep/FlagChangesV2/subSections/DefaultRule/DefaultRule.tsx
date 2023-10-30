/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { get } from 'lodash-es'
import { useFormikContext } from 'formik'
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
import { useStrings } from 'framework/strings'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { CFPipelineInstructionType } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import SubSection, { SubSectionProps } from '../../SubSection'
import { useFlagChanges } from '../../../FlagChangesContextProvider'
import { getAllowableTypes } from '../../utils/getAllowableTypes'
import { withPrefix } from '../../utils/withPrefix'

export interface DefaultRuleProps extends SubSectionProps {
  prefixPath: string
  instructionType:
    | CFPipelineInstructionType.SET_DEFAULT_ON_VARIATION
    | CFPipelineInstructionType.SET_DEFAULT_OFF_VARIATION
}

const DefaultRule: FC<DefaultRuleProps> = ({ prefixPath, instructionType, ...props }) => {
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
    setFieldValue(withPrefix(prefixPath, 'identifier'), `${instructionType}Identifier`)
    setFieldValue(withPrefix(prefixPath, 'type'), instructionType)
  }, [instructionType, prefixPath, setFieldValue])

  const onTypeChange = useCallback(
    newType => {
      setFieldValue(withPrefix(prefixPath, 'spec.variation'), '')
      setInputType(newType)
    },
    [prefixPath, setFieldValue]
  )

  return (
    <SubSection data-testid={`flagChanges-${instructionType}`} {...props}>
      {mode === StepViewType.DeploymentForm && !items.length ? (
        <Text>{getString('cf.pipeline.flagConfiguration.pleaseSelectFlag')}</Text>
      ) : (
        <FormInput.MultiTypeInput
          name={withPrefix(prefixPath, 'spec.variation')}
          placeholder={getString('cf.pipeline.flagConfiguration.selectVariation')}
          useValue
          selectItems={items}
          label={
            instructionType === CFPipelineInstructionType.SET_DEFAULT_ON_VARIATION
              ? getString('cf.pipeline.flagConfiguration.whenTheFlagIsOnServe')
              : getString('cf.pipeline.flagConfiguration.whenTheFlagIsOffServe')
          }
          multiTypeInputProps={{
            allowableTypes: allowableTypes as AllowedTypes,
            multitypeInputValue: inputType,
            onTypeChange,
            resetExpressionOnFixedTypeChange: true
          }}
          disabled={readonly}
        />
      )}
    </SubSection>
  )
}

export default DefaultRule
