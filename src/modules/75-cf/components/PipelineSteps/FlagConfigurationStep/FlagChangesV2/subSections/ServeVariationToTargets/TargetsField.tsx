/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { useFormikContext } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE, SelectOption, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useGetAllTargets } from 'services/cf'
import { isMultiTypeFixed, isMultiTypeRuntime } from '@common/utils/utils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useFlagChanges } from '../../../FlagChangesContextProvider'
import { withPrefix } from '../../utils/withPrefix'
import { getAllowableTypes } from '../../utils/getAllowableTypes'
import ItemSelector from './ItemSelector'

export interface TargetsFieldProps {
  prefixPath: string
}

const TargetsField: FC<TargetsFieldProps> = ({ prefixPath }) => {
  const { getString } = useStrings()
  const { setFieldValue, values } = useFormikContext()
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { environmentIdentifier, mode, readonly } = useFlagChanges()

  const [inputType, setInputType] = useState<MultiTypeInputType>(() =>
    getMultiTypeFromValue(get(values, withPrefix(prefixPath, 'spec.targets')))
  )
  const allowableTypes = useMemo<MultiTypeInputType[]>(
    () => getAllowableTypes(mode, { environmentIdentifier }),
    [mode, environmentIdentifier]
  )

  useEffect(() => {
    if (!allowableTypes.includes(inputType)) {
      setInputType(allowableTypes[0])

      setFieldValue(
        withPrefix(prefixPath, 'spec.targets'),
        isMultiTypeRuntime(allowableTypes[0]) ? RUNTIME_INPUT_VALUE : ''
      )
    }
  }, [allowableTypes, inputType, prefixPath, setFieldValue])

  const onTypeChange = useCallback(
    newType => {
      setFieldValue(
        withPrefix(prefixPath, 'spec.targets'),
        isMultiTypeFixed(newType) ? [] : isMultiTypeRuntime(newType) ? RUNTIME_INPUT_VALUE : ''
      )
      setInputType(newType)
    },
    [prefixPath, setFieldValue]
  )

  const { data: targetsData, refetch: fetchTargets } = useGetAllTargets({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, environmentIdentifier },
    lazy: true,
    debounce: 200
  })

  useEffect(() => {
    if (
      isMultiTypeFixed(inputType) &&
      accountIdentifier &&
      orgIdentifier &&
      projectIdentifier &&
      environmentIdentifier
    ) {
      fetchTargets({
        queryParams: {
          accountIdentifier,
          orgIdentifier,
          projectIdentifier,
          environmentIdentifier
        }
      })
    }
  }, [accountIdentifier, environmentIdentifier, fetchTargets, inputType, orgIdentifier, projectIdentifier])

  const targets = useMemo<SelectOption[]>(
    () => (targetsData?.targets || []).map(({ name, identifier }) => ({ label: name, value: identifier })),
    [targetsData]
  )

  const onQueryChange = useCallback(
    (query: string) => {
      fetchTargets({
        queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, environmentIdentifier, targetName: query }
      })
    },
    [accountIdentifier, environmentIdentifier, fetchTargets, orgIdentifier, projectIdentifier]
  )

  if (mode === StepViewType.DeploymentForm && !environmentIdentifier) {
    return <Text>{getString('cf.pipeline.flagConfiguration.pleaseSelectEnvironment')}</Text>
  }

  return (
    <ItemSelector
      name={withPrefix(prefixPath, 'spec.targets')}
      label={getString('cf.pipeline.flagConfiguration.toTargets')}
      placeholder={getString('cf.pipeline.flagConfiguration.selectTargets')}
      items={targets}
      disabled={readonly}
      type={inputType}
      allowableTypes={allowableTypes}
      onTypeChange={onTypeChange}
      onQueryChange={onQueryChange}
    />
  )
}

export default TargetsField
