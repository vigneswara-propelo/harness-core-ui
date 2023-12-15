/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { connect, FormikContextType } from 'formik'
import produce from 'immer'
import {
  FormikTooltipContext,
  DataTooltipInterface,
  MultiTypeInputType,
  HarnessDocTooltip,
  Container,
  AllowedTypes,
  AllowedTypesWithExecutionTime,
  EXECUTION_TIME_INPUT_VALUE,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'
import { FormGroup, IFormGroupProps, Intent, RadioGroup, Radio } from '@blueprintjs/core'
import { defaultTo, get, isEmpty, set, isUndefined } from 'lodash-es'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { useStrings } from 'framework/strings'
import { errorCheck } from '@common/utils/formikHelpers'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { isValueRuntimeInput } from '@modules/10-common/utils/utils'
import { ExecutionTarget } from 'services/pipeline-ng'
import { getExecutionTargetValue } from './helper'
import css from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector.module.scss'

interface MultiTypeExecTargetProps extends IFormGroupProps {
  onDelegatePath: string
  executionTargetPath: string
  label?: string
  expressions?: string[]
  allowableTypes: AllowedTypes
  tooltipProps?: DataTooltipInterface
  disableTypeSelection?: boolean
  readonly?: boolean
}

interface ConnectedExecutionTargetGrpProps extends MultiTypeExecTargetProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikContextType<any>
}

export enum ExecutionTargetOption {
  'targethost' = 'targethost',
  'delegate' = 'delegate'
}

export const getShowExecutionTarget = (
  onDelegateVal: boolean,
  executionTargetVal: ExecutionTarget | string
): boolean => {
  /* 
    Show executionTarget fields:
      1: If onDelegateVal === false // To make these changes backward compatible
      2: If executionTargetVal is not runtime &  not empty object.
  */

  if (onDelegateVal === false) {
    return true
  }

  if (typeof executionTargetVal === 'string' && isValueRuntimeInput(executionTargetVal)) {
    return false
  }

  return !isEmpty(executionTargetVal)
}

export function MultiTypeExecutionTargetGroup(props: ConnectedExecutionTargetGrpProps): React.ReactElement {
  const {
    formik,
    allowableTypes,
    label,
    onDelegatePath,
    executionTargetPath,
    readonly,
    // inputProps,
    disableTypeSelection = false,
    ...restProps
  } = props

  const { values: formikValues, setFieldValue, setValues } = formik

  const hasError = errorCheck(executionTargetPath, formik)

  const { getString } = useStrings()

  const { intent = hasError ? Intent.DANGER : Intent.NONE, disabled, ...rest } = restProps
  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId = get(
    props,
    'tooltipProps.dataTooltipId',
    defaultTo(`${get(tooltipContext, 'formName')}_${executionTargetPath}`, '')
  )

  const executionTargetVal = get(formikValues, executionTargetPath)
  const onDelegateVal = get(formikValues, onDelegatePath)

  /* 
    Condition to show fields: Checking for onDelegate to make changes backward compatible
    ------------------------------------------------------------------------------
    |  executionTarget value /   |                                               |
    |  onDelegate value          |   Fields to show                              |
    ------------------------------------------------------------------------------
    |  <+input>                  |   Where would you like to execute the script? |
    |                            |   (Field with runtime value)                  |
    ------------------------------------------------------------------------------
    |  {}                        |   On Delegate                                 |
    ------------------------------------------------------------------------------
    |   {                        |                                               |
    |     host: """"             |                                               |
    |     connectorRef: """"     |   Specify Target Host                         | 
    |     workingDirectory: """" |                                               |
    |   }                        |                                               |
    ------------------------------------------------------------------------------
   */

  const selectedValue = getShowExecutionTarget(onDelegateVal, executionTargetVal)
    ? ExecutionTargetOption.targethost
    : ExecutionTargetOption.delegate
  const isOnDelegateRuntime = isValueRuntimeInput(onDelegateVal)

  return (
    <FormGroup
      {...rest}
      labelFor={executionTargetPath}
      /* istanbul ignore next */
      label={label ? <HarnessDocTooltip tooltipId={dataTooltipId} labelText={label} /> : label}
      intent={intent}
    >
      <Container className={cx(css.fieldSelectorContainer)}>
        <MultiTypeFieldSelector
          // This is needed to handle the scenario when onDelegate: <+input> for backward compatibility
          name={isOnDelegateRuntime ? onDelegatePath : executionTargetPath}
          label={getString('pipeline.execTargetLabel')}
          // This is needed to handle the scenario when onDelegate: <+input> for backward compatibility
          defaultValueToReset={isOnDelegateRuntime ? true : {}}
          skipRenderValueInExpressionLabel
          allowedTypes={allowableTypes}
          supportListOfExpressions={true}
          disableMultiSelectBtn={disabled}
          disableTypeSelection={disableTypeSelection}
          style={{ flexGrow: 1, marginBottom: 0 }}
          // This is needed to handle the scenario when onDelegate: <+input> for backward compatibility
          onTypeChange={(type: MultiTypeInputType) => {
            const runtimeValue =
              Array.isArray(allowableTypes) &&
              (allowableTypes as AllowedTypesWithExecutionTime[]).includes(MultiTypeInputType.EXECUTION_TIME)
                ? EXECUTION_TIME_INPUT_VALUE
                : RUNTIME_INPUT_VALUE

            // Set default value to {} to select On Delegate by default
            setFieldValue(executionTargetPath, isMultiTypeRuntime(type) ? runtimeValue : {})
          }}
        >
          <RadioGroup
            data-tooltip-id="executionTargetTooltip"
            selectedValue={selectedValue}
            disabled={readonly}
            inline={true}
            onChange={e => {
              const executionTarget =
                e.currentTarget.value === ExecutionTargetOption.targethost
                  ? getExecutionTargetValue({
                      host: '',
                      connectorRef: '',
                      workingDirectory: ''
                    })
                  : getExecutionTargetValue()

              setValues(
                produce(formikValues, (draft: any) => {
                  set(draft, executionTargetPath, executionTarget)
                  if (!isUndefined(get(draft, onDelegatePath))) {
                    set(draft, onDelegatePath, e.currentTarget.value === ExecutionTargetOption.delegate)
                  }

                  return draft
                })
              )
            }}
          >
            <Radio value={ExecutionTargetOption.targethost} label={getString('cd.specifyTargetHost')} />
            <Radio value={ExecutionTargetOption.delegate} label={getString('pipeline.delegateLabel')} />
          </RadioGroup>
        </MultiTypeFieldSelector>
      </Container>
    </FormGroup>
  )
}

export default connect<MultiTypeExecTargetProps>(MultiTypeExecutionTargetGroup)
