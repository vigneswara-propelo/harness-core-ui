/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { get } from 'lodash-es'
import { useFormikContext } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE, SelectOption, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { isMultiTypeFixed, isMultiTypeRuntime } from '@common/utils/utils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useFlagChanges } from '../../../FlagChangesContextProvider'
import { withPrefix } from '../../utils/withPrefix'
import { getAllowableTypes } from '../../utils/getAllowableTypes'
import ItemSelector from './ItemSelector'

export interface ItemsFieldProps {
  prefixPath: string
  itemType: 'targets' | 'segments'
  items: SelectOption[]
  onQueryChange: (query: string) => void
  fetchItems: () => void
}

const ItemsField: FC<ItemsFieldProps> = ({ prefixPath, itemType, items, onQueryChange, fetchItems }) => {
  const { getString } = useStrings()
  const { setFieldValue, values } = useFormikContext()
  const { environmentIdentifier, mode, readonly } = useFlagChanges()

  const [inputType, setInputType] = useState<MultiTypeInputType>(() =>
    getMultiTypeFromValue(get(values, withPrefix(prefixPath, `spec.${itemType}`)))
  )

  const allowableTypes = useMemo<MultiTypeInputType[]>(
    () => getAllowableTypes(mode, { environmentIdentifier }),
    [mode, environmentIdentifier]
  )

  useEffect(() => {
    if (!allowableTypes.includes(inputType)) {
      setInputType(allowableTypes[0])

      setFieldValue(
        withPrefix(prefixPath, `spec.${itemType}`),
        isMultiTypeRuntime(allowableTypes[0]) ? RUNTIME_INPUT_VALUE : ''
      )
    }
  }, [allowableTypes, inputType, itemType, prefixPath, setFieldValue])

  const onTypeChange = useCallback(
    newType => {
      setFieldValue(
        withPrefix(prefixPath, `spec.${itemType}`),
        isMultiTypeFixed(newType) ? [] : isMultiTypeRuntime(newType) ? RUNTIME_INPUT_VALUE : ''
      )
      setInputType(newType)
    },
    [itemType, prefixPath, setFieldValue]
  )

  useEffect(() => {
    if (isMultiTypeFixed(inputType)) {
      fetchItems()
    }
  }, [fetchItems, inputType])

  if (mode === StepViewType.DeploymentForm && !environmentIdentifier) {
    return <Text>{getString('cf.pipeline.flagConfiguration.pleaseSelectEnvironment')}</Text>
  }

  return (
    <ItemSelector
      name={withPrefix(prefixPath, `spec.${itemType}`)}
      label={
        itemType === 'targets'
          ? getString('cf.pipeline.flagConfiguration.toTargets')
          : getString('cf.pipeline.flagConfiguration.toTargetGroups')
      }
      placeholder={
        itemType === 'targets'
          ? getString('cf.pipeline.flagConfiguration.selectTargets')
          : getString('cf.pipeline.flagConfiguration.selectTargetGroups')
      }
      items={items}
      disabled={readonly}
      type={inputType}
      allowableTypes={allowableTypes}
      onTypeChange={onTypeChange}
      onQueryChange={onQueryChange}
    />
  )
}

export default ItemsField
