/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { K8sBGStageScaleDownData } from '../K8sBlueGreenStageScaleDownStep'

export const initialValues: K8sBGStageScaleDownData = {
  type: StepType.K8sBlueGreenStageScaleDownStep,
  name: 'K8sBlueGreenStageScaleDownStep',
  identifier: 'K8sBlueGreenStageScaleDownStep',
  timeout: '10m',
  spec: {}
}

export const runtimeValues = {
  type: StepType.K8sBlueGreenStageScaleDownStep,
  name: 'K8sBlueGreenStageScaleDownStep',
  identifier: 'K8sBlueGreenStageScaleDownStep',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {}
}
export const variableCustomStepProps = {
  stageIdentifier: 'qaStage',
  metadataMap: {
    'mF96Tc2eR7GLfy1tP-pzRQ': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.K8sBlueGreenStageScaleDownStep.description',
        localName: 'execution.steps.K8sBlueGreenStageScaleDownStep.description',
        variableName: 'description',
        aliasFQN: '',
        visible: true
      }
    },
    'step-name': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.K8sBlueGreenStageScaleDownStep.name',
        localName: 'execution.steps.K8sBlueGreenStageScaleDownStep.name',
        variableName: 'name',
        aliasFQN: '',
        visible: true
      }
    },
    lVkXFFEUTLi4PzQzS7OhKw: {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.K8sBlueGreenStageScaleDownStep.timeout',
        localName: 'execution.steps.K8sBlueGreenStageScaleDownStep.timeout',
        variableName: 'timeout',
        aliasFQN: '',
        visible: true
      }
    }
  },
  variablesData: {
    type: StepType.K8sBlueGreenStageScaleDownStep,
    name: 'K8sBlueGreenStageScaleDownStep',
    identifier: 'K8sBlueGreenStageScaleDownStep',
    description: 'mF96Tc2eR7GLfy1tP-pzRQ',
    timeout: 'lVkXFFEUTLi4PzQzS7OhKw',
    spec: {}
  }
}
