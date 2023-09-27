/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, MultiTypeInputType, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { AllNGVariables } from '@pipeline/utils/types'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { K8sDirectInfraStepGroupElementConfig } from '../StepGroupUtil'
import { CustomVariableInputSetExtraProps } from '../../CustomVariables/CustomVariableInputSet'
import css from '../StepGroupStep.module.scss'

export interface StepGroupVariablesInputSetViewProps {
  factory: AbstractStepFactory
  initialValues: K8sDirectInfraStepGroupElementConfig
  template: K8sDirectInfraStepGroupElementConfig
  path?: string
  allValues?: K8sDirectInfraStepGroupElementConfig
  readonly?: boolean
}

export default function StepGroupVariablesInputSetView(props: StepGroupVariablesInputSetViewProps): JSX.Element | null {
  const { factory, initialValues, template, path, allValues, readonly } = props
  const { getString } = useStrings()

  return (
    <Layout.Vertical padding={{ top: 'medium', bottom: 'medium' }}>
      <Text
        font={{ variation: FontVariation.BODY2 }}
        tooltipProps={{ dataTooltipId: 'stepGroupVariablesInputSetView' }}
      >
        {getString('common.variables')}
      </Text>
      <section className={css.stepGroupVariableInputSetView}>
        <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
          factory={factory as unknown as AbstractStepFactory}
          initialValues={{
            variables: (initialValues.variables || []) as AllNGVariables[],
            canAddVariable: true
          }}
          type={StepType.CustomVariable}
          stepViewType={StepViewType.InputSet}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
          customStepProps={{
            template: { variables: (template?.variables || []) as AllNGVariables[] },
            path,
            allValues: { variables: (allValues?.variables || []) as AllNGVariables[] },
            isDescriptionEnabled: true
          }}
          readonly={readonly}
        />
      </section>
    </Layout.Vertical>
  )
}
