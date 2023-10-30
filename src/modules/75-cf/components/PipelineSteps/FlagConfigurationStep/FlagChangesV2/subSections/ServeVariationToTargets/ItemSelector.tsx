/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useMemo } from 'react'
import {
  AllowedTypes,
  FormError,
  FormInput,
  Layout,
  MultiSelect,
  MultiTypeInputType,
  SelectOption
} from '@harness/uicore'
import { FormGroup } from '@blueprintjs/core'
import { useFormikContext } from 'formik'
import { get } from 'lodash-es'
import MultiTypeSelectorButton from '@common/components/MultiTypeSelectorButton/MultiTypeSelectorButton'
import { isMultiTypeFixed } from '@common/utils/utils'
import { useHasError } from '@cf/components/PipelineSteps/FlagConfigurationStep/FlagChangesV2/utils/useHasError'

export interface ItemSelectorProps {
  name: string
  label: string
  placeholder: string
  items: SelectOption[]
  disabled?: boolean
  type: MultiTypeInputType
  allowableTypes: MultiTypeInputType[]
  onTypeChange: (newType: MultiTypeInputType) => void
  onQueryChange: (query: string) => void
}

const ItemSelector: FC<ItemSelectorProps> = ({
  name,
  label,
  placeholder,
  items,
  disabled,
  type,
  allowableTypes,
  onTypeChange,
  onQueryChange
}) => {
  const { errors, values, setFieldValue } = useFormikContext()
  const currentValue = get(values, name, [])
  const hasError = useHasError(name)

  const valueAsOptions = useMemo<SelectOption[]>(
    () =>
      type === MultiTypeInputType.FIXED && Array.isArray(currentValue)
        ? currentValue.map((val: string) => items.find(({ value }) => val === value) || { label: val, value: val })
        : [],
    [currentValue, items, type]
  )

  const onChange = useCallback(
    (selectedOptions: SelectOption[]) => {
      setFieldValue(
        name,
        selectedOptions.map(({ value }) => value)
      )
    },
    [name, setFieldValue]
  )

  if (isMultiTypeFixed(type)) {
    return (
      <FormGroup
        label={label}
        disabled={disabled}
        helperText={hasError ? <FormError name={name} errorMessage={get(errors, name)} /> : null}
      >
        <Layout.Horizontal spacing="xsmall">
          <MultiSelect
            name={name}
            items={items}
            placeholder={placeholder}
            disabled={disabled}
            value={valueAsOptions}
            onChange={onChange}
            allowCreatingNewItems={false}
            onQueryChange={onQueryChange}
            usePortal
          />

          <MultiTypeSelectorButton
            type={MultiTypeInputType.FIXED}
            onChange={onTypeChange}
            allowedTypes={allowableTypes as AllowedTypes}
            disabled={disabled}
          />
        </Layout.Horizontal>
      </FormGroup>
    )
  }

  return (
    <FormInput.MultiTypeInput
      name={name}
      label={label}
      disabled={disabled}
      multiTypeInputProps={{
        resetExpressionOnFixedTypeChange: true,
        allowableTypes: allowableTypes as AllowedTypes,
        multitypeInputValue: type,
        onTypeChange: onTypeChange
      }}
      selectItems={[]}
    />
  )
}

export default ItemSelector
