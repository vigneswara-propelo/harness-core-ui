/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import { Container, Formik, HarnessDocTooltip, Layout, MultiTypeInputType, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { noop } from 'react-monaco-editor/lib/utils'
import { debounce, get } from 'lodash-es'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import ConditionalExecutionPanel from '@modules/70-pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanel'
import { useStrings } from 'framework/strings'
import { constructConditionString, parseConditionString } from './utils'
import { InputsFormValues } from '../../InputsForm/InputsForm'
import { InputComponent, InputProps } from '../InputComponent'
import { DerivedInputType } from '../InputComponentType'
import css from './inputs.module.scss'

function ConditionalExecutionInputInternal(props: InputProps<InputsFormValues>): JSX.Element {
  const { readonly, path } = props
  const parentFormik = useFormikContext()
  const { getString } = useStrings()
  const mode = Modes.STAGE //TODO:: derive from input.metadata
  const statusPath = mode === Modes.STAGE ? 'pipelineStatus' : 'stageStatus'
  const { condition, status } = parseConditionString(get(parentFormik.values, path, ''))
  const formInitialValues = React.useMemo(
    () => ({
      when: {
        [statusPath]: status,
        condition
      }
    }),
    [condition, status, statusPath]
  )

  const debouncedUpdate = React.useMemo(
    () =>
      debounce((data: typeof formInitialValues): void => {
        const conditionalInputValue = constructConditionString({
          status: data.when?.[statusPath],
          condition: data.when?.condition
        })
        parentFormik.setFieldValue(path, conditionalInputValue)
      }, 300),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path, statusPath]
  )

  return (
    <Formik
      initialValues={formInitialValues}
      validateOnChange
      formName="conditional-input"
      onSubmit={noop}
      validate={debouncedUpdate}
    >
      {() => {
        return (
          <Container margin={{ bottom: 'medium' }}>
            <Layout.Horizontal
              margin={{ bottom: 'medium' }}
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <Text color={Color.GREY_600} margin={{ right: 'medium' }} font={{ weight: 'semi-bold' }}>
                {getString('pipeline.conditionalExecution.title')}
              </Text>
            </Layout.Horizontal>
            <Text width="85%" color={Color.GREY_500} margin={{ bottom: 'small' }} font={{ size: 'small' }}>
              {getString('pipeline.conditionalExecution.conditionLabel')}
              <HarnessDocTooltip tooltipId="conditionalExecution" useStandAlone={true} />
            </Text>
            <Container width="100%">
              <ConditionalExecutionPanel
                isReadonly={!!readonly}
                path="when"
                mode={mode}
                className={css.verticalConditionalLayout}
                allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
              />
            </Container>
          </Container>
        )
      }}
    </Formik>
  )
}

export class ConditionalExecutionInput extends InputComponent<InputsFormValues> {
  public internalType = DerivedInputType.conditional_execution

  constructor() {
    super()
  }

  renderComponent(props: InputProps<InputsFormValues>): JSX.Element {
    return <ConditionalExecutionInputInternal {...props} />
  }
}
