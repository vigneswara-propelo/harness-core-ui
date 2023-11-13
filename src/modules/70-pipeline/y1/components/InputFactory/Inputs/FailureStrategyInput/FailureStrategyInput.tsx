import React, { useMemo } from 'react'
import { useFormikContext } from 'formik'
import { get, noop } from 'lodash-es'
import { AllowedTypesWithRunTime, Formik, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import FailureStrategyPanelWrapper from '@modules/70-pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/FailureStrategyPanel'
import { InputComponent, InputProps } from '@pipeline/y1/components/InputFactory/InputComponent'
import { InputsFormValues } from '@pipeline/y1/components/InputsForm/InputsForm'
import { DerivedInputType } from '@pipeline/y1/components/InputFactory/InputComponentType'
import { ErrorType, Strategy } from '@modules/70-pipeline/utils/FailureStrategyUtils'
import { toFailureStrategies, toFailureStrategiesY1 } from './utils'

function FailureStrategyInputInternal(props: InputProps<InputsFormValues>): JSX.Element {
  const { allowableTypes, readonly, path } = props
  const { getString } = useStrings()
  const { setFieldValue, values } = useFormikContext()
  const allowedStrategies = useMemo(
    () =>
      Object.values(Strategy).filter(
        strategy => ![Strategy.ProceedWithDefaultValues, Strategy.StepGroupRollback].includes(strategy)
      ),
    []
  )
  const errorTypes = useMemo(() => Object.values(ErrorType), [])
  const allowedTypes = (allowableTypes as AllowedTypesWithRunTime[]).filter(allowedType =>
    [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME].includes(allowedType)
  )
  const fieldName = 'failure'

  return (
    <Formik
      formName="failureStrategyForm"
      initialValues={{ [fieldName]: toFailureStrategies(get(values, path)) ?? [] }}
      onSubmit={noop}
      validate={value => setFieldValue(path, toFailureStrategiesY1(get(value, fieldName)))}
    >
      {() => {
        return (
          <MultiTypeFieldSelector
            name={fieldName}
            label={getString('pipeline.failureStrategies.title')}
            disabled={readonly}
            allowedTypes={allowedTypes}
            disableTypeSelection={readonly}
            defaultValueToReset={[]}
          >
            <FailureStrategyPanelWrapper
              isReadonly={!!readonly}
              path={fieldName}
              allowedStrategies={allowedStrategies}
              errorTypes={errorTypes}
            />
          </MultiTypeFieldSelector>
        )
      }}
    </Formik>
  )
}

export class FailureStrategyInput extends InputComponent<InputsFormValues> {
  public internalType = DerivedInputType.failure_strategy

  constructor() {
    super()
  }

  renderComponent(props: InputProps<InputsFormValues>): JSX.Element {
    return <FailureStrategyInputInternal {...props} />
  }
}
