/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
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
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useGetAllSegments } from 'services/cf'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { withPrefix } from '../../utils/withPrefix'
import { getAllowableTypes } from '../../utils/getAllowableTypes'
import { useFlagChanges } from '../../../FlagChangesContextProvider'

export interface TargetGroupFieldProps {
  prefixPath: string
}

const TargetGroupField: FC<TargetGroupFieldProps> = ({ prefixPath }) => {
  const { getString } = useStrings()
  const { setFieldValue, values } = useFormikContext()
  const { mode, environmentIdentifier, readonly } = useFlagChanges()
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const searching = useRef<boolean>(false)

  const fieldPath = withPrefix(prefixPath, 'spec.distribution.clauses[0].values[0]')

  const [inputType, setInputType] = useState<MultiTypeInputType>(() => getMultiTypeFromValue(get(values, fieldPath)))

  const allowableTypes = useMemo<MultiTypeInputType[]>(
    () => getAllowableTypes(mode, { environmentIdentifier }),
    [environmentIdentifier, mode]
  )

  useEffect(() => {
    if (!allowableTypes.includes(inputType)) {
      setInputType(allowableTypes[0])

      setFieldValue(fieldPath, isMultiTypeRuntime(allowableTypes[0]) ? RUNTIME_INPUT_VALUE : '')
    }
  }, [allowableTypes, inputType, fieldPath, setFieldValue])

  const onTypeChange = useCallback(
    newType => {
      setFieldValue(fieldPath, '')
      setInputType(newType)
    },
    [fieldPath, setFieldValue]
  )

  const {
    data: targetGroupsData,
    loading: loadingTargetGroups,
    refetch: fetchTargetGroups
  } = useGetAllSegments({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, environmentIdentifier },
    lazy: true,
    debounce: 200
  })

  useEffect(() => {
    if (accountIdentifier && orgIdentifier && projectIdentifier && environmentIdentifier) {
      fetchTargetGroups({
        queryParams: {
          accountIdentifier,
          orgIdentifier,
          projectIdentifier,
          environmentIdentifier
        }
      })
    }
  }, [accountIdentifier, environmentIdentifier, fetchTargetGroups, orgIdentifier, projectIdentifier])

  const targetGroups = useMemo<SelectOption[]>(() => {
    const groups = (targetGroupsData?.segments || []).map(({ name, identifier }) => ({
      label: name,
      value: identifier
    }))

    if (!searching.current) {
      const currentVal = get(values, fieldPath)

      if (currentVal && !groups.some(({ value }) => value === currentVal)) {
        groups.unshift({ label: currentVal, value: currentVal })
      }
    }

    return groups
  }, [fieldPath, targetGroupsData?.segments, values])

  const onQueryChange = useCallback(
    (query: string) => {
      searching.current = !!query
      fetchTargetGroups({
        queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, environmentIdentifier, name: query }
      })
    },
    [accountIdentifier, environmentIdentifier, fetchTargetGroups, orgIdentifier, projectIdentifier]
  )

  if (mode === StepViewType.DeploymentForm && !environmentIdentifier) {
    return <Text>{getString('cf.pipeline.flagConfiguration.pleaseSelectEnvironment')}</Text>
  }

  return (
    <FormInput.MultiTypeInput
      name={fieldPath}
      placeholder={getString('cf.pipeline.flagConfiguration.selectTargetGroup')}
      useValue
      selectItems={targetGroups}
      label={getString('cf.pipeline.flagConfiguration.selectTargetGroup')}
      disabled={readonly}
      multiTypeInputProps={{
        allowableTypes: allowableTypes as AllowedTypes,
        multitypeInputValue: inputType,
        onTypeChange,
        resetExpressionOnFixedTypeChange: true,
        selectProps: { items: targetGroups, onQueryChange, loadingItems: loadingTargetGroups }
      }}
    />
  )
}

export default TargetGroupField
