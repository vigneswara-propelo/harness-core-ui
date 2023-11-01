/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useFormikContext } from 'formik'
import { get } from 'lodash-es'
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
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import { useFlagChanges } from '../../../FlagChangesContextProvider'
import { withPrefix } from '../../utils/withPrefix'
import { getAllowableTypes } from '../../utils/getAllowableTypes'

export interface VariationFieldProps {
  prefixPath: string
}
const VariationField: FC<VariationFieldProps> = ({ prefixPath }) => {
  const { getString } = useStrings()
  const { setFieldValue, values } = useFormikContext()
  const { flag, mode, readonly } = useFlagChanges()

  const [inputType, setInputType] = useState<MultiTypeInputType>(() =>
    getMultiTypeFromValue(get(values, withPrefix(prefixPath, 'spec.variation')))
  )

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

  const variations = useMemo<SelectOption[]>(() => {
    if (typeof flag === 'object') {
      return flag.variations.map(({ name, identifier }) => ({ label: name || identifier, value: identifier }))
    }

    return []
  }, [flag])

  const onTypeChange = useCallback(
    newType => {
      setFieldValue(withPrefix(prefixPath, 'spec.variation'), '')
      setInputType(newType)
    },
    [prefixPath, setFieldValue]
  )

  if (mode === StepViewType.DeploymentForm && !variations.length) {
    return <Text>{getString('cf.pipeline.flagConfiguration.pleaseSelectFlag')}</Text>
  }

  return (
    <FormInput.MultiTypeInput
      name={withPrefix(prefixPath, 'spec.variation')}
      placeholder={getString('cf.pipeline.flagConfiguration.selectVariation')}
      useValue
      selectItems={variations}
      label={getString('cf.pipeline.flagConfiguration.serveVariation')}
      multiTypeInputProps={{
        resetExpressionOnFixedTypeChange: true,
        allowableTypes: allowableTypes as AllowedTypes,
        multitypeInputValue: inputType,
        onTypeChange: onTypeChange
      }}
      disabled={readonly}
    />
  )
}

export default VariationField
