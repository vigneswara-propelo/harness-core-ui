/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, MultiTypeInputType } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { debounce, isEmpty, isEqual, set } from 'lodash-es'

import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import type { StepFormikRef } from '@pipeline/components/PipelineStudio/StepCommands/StepCommands'

import type { StepGroupElementConfig } from 'services/cd-ng'
import type { Values } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'

import { getStepDataFromValues } from '@pipeline/utils/stepUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { TemplateContext } from '../../TemplateContext/TemplateContext'
import { StepGroupTemplateCommandsWithRef } from './StepGroupTemplateCommands'
import css from './StepGroupTemplateForm.module.scss'

const StepGroupTemplateForm = (_props: unknown, formikRef: TemplateFormRef): JSX.Element => {
  const {
    state: { template },
    updateTemplate,
    isReadonly
  } = React.useContext(TemplateContext)
  const stepFormikRef = React.useRef<StepFormikRef | null>(null)

  /* istanbul ignore next */ React.useImperativeHandle(formikRef, () => ({
    resetForm() {
      return stepFormikRef.current?.resetForm()
    },
    submitForm() {
      return stepFormikRef.current?.submitForm() || Promise.resolve()
    },
    getErrors() {
      return stepFormikRef.current?.getErrors() || {}
    }
  }))

  const onSubmitStep = async (item: Partial<Values>): Promise<void> => {
    const processNode: any = getStepDataFromValues(item, template.spec as StepGroupElementConfig, true)

    if (!isEqual(template.spec, processNode) || !isEqual(item.delegateSelectors, template?.spec?.delegateSelectors)) {
      delete processNode.spec
      set(template, 'spec', {
        ...processNode,
        steps: processNode.steps,
        stageType: processNode.stageType
      })

      await updateTemplate(template)
    }
  }

  const debounceSubmit = debounce((step: Partial<Values>): void => {
    onSubmitStep(step)
  }, 500)

  return (
    <Container background={Color.FORM_BG} className={css.stepGroupForm}>
      {template && !isEmpty(template.spec) && !!template.type && (
        <StepGroupTemplateCommandsWithRef
          step={template.spec as StepGroupElementConfig}
          isReadonly={isReadonly}
          stepsFactory={factory}
          onChange={debounceSubmit}
          onUpdate={debounceSubmit}
          stepViewType={StepViewType.Template}
          ref={stepFormikRef}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isStepGroup={true}
        />
      )}
    </Container>
  )
}

export const StepGroupTemplateFormWithRef = React.forwardRef(StepGroupTemplateForm)
