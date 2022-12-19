import React, { useContext, useState } from 'react'
import { AllowedTypes, ExpressionAndRuntimeType, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { isMultiTypeRuntime } from '@common/utils/utils'
import JsonSelectorButton, { JsonSelectorButtonProps } from './JsonSelectorButton'

interface JsonDrawerMultiTypeProps {
  name: string
  label: string
  value: string
  key: string
  allowedTypes?: AllowedTypes
  displayText: string
  disabled?: boolean
  className?: string
  onClick: (name: string, label: string) => void
}

const JsonDrawerMultiType = ({
  name,
  value,
  onClick,
  key,
  displayText,
  label,
  allowedTypes,
  disabled,
  className
}: JsonDrawerMultiTypeProps): JSX.Element => {
  const [multiType, setMultiType] = useState(() => getMultiTypeFromValue(value))

  const { expressions } = useContext(SetupSourceTabsContext)
  const { setFieldValue } = useFormikContext<CommonCustomMetricFormikInterface>()

  // useEffect(() => {
  //   console.log('multiType in effect', multiType)
  // }, [])

  return (
    <ExpressionAndRuntimeType<JsonSelectorButtonProps>
      name={name}
      value={value}
      key={`${multiType}-${key}`}
      allowableTypes={allowedTypes}
      expressions={expressions}
      multitypeInputValue={multiType}
      onChange={(updatedValue, _, type): void => {
        if (type !== multiType) {
          setMultiType?.(multiType)
        }

        if (isMultiTypeRuntime(type)) {
          setFieldValue(name, updatedValue)
        } else if (type === MultiTypeInputType.EXPRESSION) {
          setFieldValue(name, '<+example>')
        }
      }}
      fixedTypeComponentProps={{
        onClick: () => onClick(name, label),
        displayText: displayText,
        icon: 'plus',
        disabled: disabled,
        className: className
      }}
      fixedTypeComponent={JsonSelectorButton}
    />
  )
}

export default React.memo(JsonDrawerMultiType)
