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
  Text
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { isMultiTypeFixed, isMultiTypeRuntime } from '@common/utils/utils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getAllowableTypes } from '../../utils/getAllowableTypes'
import { withPrefix } from '../../utils/withPrefix'
import { useFlagChanges } from '../../../FlagChangesContextProvider'
import FixedPercentageRollout from './FixedPercentageRollout'

export interface PercentageRolloutFieldProps {
  prefixPath: string
}

const PercentageRolloutField: FC<PercentageRolloutFieldProps> = ({ prefixPath }) => {
  const { getString } = useStrings()
  const { setFieldValue, values } = useFormikContext()
  const { mode, flag, readonly } = useFlagChanges()

  const [inputType, setInputType] = useState<MultiTypeInputType>(() =>
    getMultiTypeFromValue(get(values, withPrefix(prefixPath, 'spec.distribution.variations')))
  )

  const allowableTypes = useMemo<MultiTypeInputType[]>(() => getAllowableTypes(mode, { flag }), [mode, flag])

  useEffect(() => {
    if (!allowableTypes.includes(inputType)) {
      setInputType(allowableTypes[0])

      setFieldValue(
        withPrefix(prefixPath, 'spec.distribution.variations'),
        isMultiTypeRuntime(allowableTypes[0]) ? RUNTIME_INPUT_VALUE : ''
      )
    }
  }, [allowableTypes, inputType, prefixPath, setFieldValue])

  const onTypeChange = useCallback(
    newType => {
      setFieldValue(
        withPrefix(prefixPath, 'spec.distribution.variations'),
        isMultiTypeFixed(newType) ? [] : isMultiTypeRuntime(newType) ? RUNTIME_INPUT_VALUE : ''
      )
      setInputType(newType)
    },
    [prefixPath, setFieldValue]
  )

  if (isMultiTypeFixed(inputType)) {
    if (mode === StepViewType.DeploymentForm && !flag) {
      return <Text>{getString('cf.pipeline.flagConfiguration.pleaseSelectFlag')}</Text>
    }

    return (
      <FixedPercentageRollout prefixPath={prefixPath} onTypeChange={onTypeChange} allowableTypes={allowableTypes} />
    )
  }

  return (
    <FormInput.MultiTypeInput
      name={withPrefix(prefixPath, 'spec.distribution.variations')}
      label={getString('cf.featureFlags.percentageRollout')}
      disabled={readonly}
      multiTypeInputProps={{
        resetExpressionOnFixedTypeChange: true,
        allowableTypes: allowableTypes as AllowedTypes,
        multitypeInputValue: inputType,
        onTypeChange: onTypeChange
      }}
      selectItems={[]}
    />
  )
}

export default PercentageRolloutField
