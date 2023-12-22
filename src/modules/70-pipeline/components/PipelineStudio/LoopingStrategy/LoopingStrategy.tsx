/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik } from '@harness/uicore'
import { cloneDeep, isEqual, noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import type { StrategyConfig } from 'services/cd-ng'
import type { StepOrStepGroupOrTemplateStepData } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { useDeepCompareEffect } from '@common/hooks'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'

import { LoopingStrategyPanel } from './LoopingStrategyPanel'

export interface LoopingStrategyProps {
  selectedStage?: StageElementWrapper
  isReadonly?: boolean
  onUpdateStrategy?: (strategy: StrategyConfig) => void
  step?: StepOrStepGroupOrTemplateStepData
}

export function LoopingStrategy({
  selectedStage: { stage } = {},
  isReadonly,
  onUpdateStrategy,
  step
}: LoopingStrategyProps): React.ReactElement {
  const formikRef = React.useRef<FormikProps<{ strategy: StrategyConfig | undefined }> | null>(null)

  useDeepCompareEffect(() => {
    if (!isEqual(stage?.strategy, formikRef?.current?.values?.strategy)) {
      formikRef.current?.setValues({
        strategy: cloneDeep(stage?.strategy)
      })
    }
  }, [stage?.strategy])

  return (
    <Formik initialValues={{ strategy: stage?.strategy }} formName="loopingStrategy" onSubmit={noop}>
      {formik => {
        formikRef.current = formik
        return (
          <LoopingStrategyPanel
            path="strategy"
            isReadonly={isReadonly}
            onUpdateStrategy={onUpdateStrategy}
            step={step}
          />
        )
      }}
    </Formik>
  )
}
