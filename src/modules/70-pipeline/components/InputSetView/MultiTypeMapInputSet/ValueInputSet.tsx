import React from 'react'
import {
  ExpressionAndRuntimeType,
  ExpressionAndRuntimeTypeProps,
  MultiTypeInputType,
  MultiTypeInputValue,
  Select,
  SelectProps
} from '@harness/uicore'
import { getAllowedValuesFromTemplate } from '@modules/70-pipeline/utils/CIUtils'
import { getEscapedSelectOptions } from '@pipeline/components/InputSetView/utils/utils'

interface ValueInputSetProps
  extends Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps' | 'onChange'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: any
  fieldPath: string
  onChange: NonNullable<ExpressionAndRuntimeTypeProps['onChange']>
}

function SelectWrapper({ selectProps }: { selectProps: SelectProps }): JSX.Element {
  return <Select {...selectProps} />
}

export function ValueInputSet(props: ValueInputSetProps): JSX.Element {
  const { template, fieldPath, ...rest } = props
  const { value, onChange, disabled, name } = rest
  const allowedValues = getAllowedValuesFromTemplate(template, fieldPath)
  const items = getEscapedSelectOptions(allowedValues)

  const selectProps: SelectProps = {
    items,
    value: /* istanbul ignore next */ typeof value === 'string' ? { value, label: value } : undefined,
    onChange: item => {
      onChange(item.value as string, MultiTypeInputValue.STRING, MultiTypeInputType.FIXED)
    },
    disabled,
    usePortal: true,
    name
  }

  return (
    <ExpressionAndRuntimeType {...rest} fixedTypeComponentProps={{ selectProps }} fixedTypeComponent={SelectWrapper} />
  )
}
