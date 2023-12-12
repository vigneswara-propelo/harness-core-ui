/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useMemo, useState } from 'react'
import { useFormikContext } from 'formik'
import { get } from 'lodash-es'
import { AllowedTypes, FormInput, getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useGetAllTargetAttributes } from 'services/cf'
import { sortStrings } from '@cf/utils/sortStrings'
import { useFlagChanges } from '../../../FlagChangesContextProvider'
import { withPrefix } from '../../utils/withPrefix'
import { getAllowableTypes } from '../../utils/getAllowableTypes'

export interface BucketByFieldProps {
  prefixPath: string
}

const BucketByField: FC<BucketByFieldProps> = ({ prefixPath }) => {
  const { getString } = useStrings()
  const { setFieldValue, values } = useFormikContext()
  const { flag, accountIdentifier, projectIdentifier, environmentIdentifier, orgIdentifier, mode, readonly } =
    useFlagChanges()

  const [inputType, setInputType] = useState<MultiTypeInputType>(() =>
    getMultiTypeFromValue(get(values, withPrefix(prefixPath, 'spec.distribution.bucketBy')))
  )

  const allowableTypes = useMemo<MultiTypeInputType[]>(() => getAllowableTypes(mode, { flag }), [mode, flag])

  const { data: targetAttributes } = useGetAllTargetAttributes({
    queryParams: {
      accountIdentifier: accountIdentifier as string,
      orgIdentifier: orgIdentifier as string,
      projectIdentifier: projectIdentifier as string,
      environmentIdentifier
    },
    lazy: !(accountIdentifier && orgIdentifier && projectIdentifier && environmentIdentifier)
  })

  const bucketByOptions = useMemo<SelectOption[]>(
    () => [
      { label: getString('cf.percentageRollout.bucketBy.identifierDefault'), value: 'identifier' },
      { label: getString('cf.percentageRollout.bucketBy.name'), value: 'name' },
      ...sortStrings(targetAttributes || []).map(attr => ({ label: attr, value: attr }))
    ],
    [getString, targetAttributes]
  )

  const onTypeChange = useCallback(
    newType => {
      setFieldValue(withPrefix(prefixPath, 'spec.distribution.bucketBy'), '')
      setInputType(newType)
    },
    [prefixPath, setFieldValue]
  )

  return (
    <FormInput.MultiTypeInput
      name={withPrefix(prefixPath, 'spec.distribution.bucketBy')}
      placeholder={getString('cf.percentageRollout.bucketBy.placeholder')}
      useValue
      selectItems={bucketByOptions}
      label={getString('cf.percentageRollout.bucketBy.label')}
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

export default BucketByField
