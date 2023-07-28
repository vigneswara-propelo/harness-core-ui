/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useRef } from 'react'
import { Container, Formik } from '@harness/uicore'
import { debounce, noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import type { StageWhenCondition } from 'services/cd-ng'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import ConditionalExecutionPanel from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanel'

export interface ConditionalExecutionProps {
  selectedStage: StageElementWrapper
  isReadonly: boolean
  onUpdate(when?: StageWhenCondition | string): void
}

export interface FormState {
  when?: StageWhenCondition | string
}

export default function ConditionalExecution(props: ConditionalExecutionProps): React.ReactElement {
  const {
    selectedStage: { stage },
    onUpdate,
    isReadonly
  } = props

  const formikRef = useRef<FormikProps<FormState> | null>(null)

  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  const debouncedUpdate = useMemo(
    () =>
      debounce((data: FormState): void => {
        onUpdateRef.current(data.when)
      }, 300),
    []
  )

  return (
    <Formik
      initialValues={{ when: stage?.when }}
      enableReinitialize
      formName="condExecStudio"
      onSubmit={noop}
      validate={debouncedUpdate}
    >
      {(formik: FormikProps<FormState>) => {
        formikRef.current = formik

        return (
          <Container width={846}>
            <ConditionalExecutionPanel isReadonly={isReadonly} path="when" mode={Modes.STAGE} />
          </Container>
        )
      }}
    </Formik>
  )
}
