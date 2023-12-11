/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { isEmpty, set, get } from 'lodash-es'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@harness/uicore'

import type { StepElementConfig, AsgFixedInstances, AsgCurrentRunningInstances } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import { StepViewType, StepProps, ValidateInputSetProps, InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StageElementWrapper, DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { validateGenericFields } from '../Common/GenericExecutionStep/utils'
import { AsgBlueGreenDeployStepEditRef } from './AsgBlueGreenDeployStepEdit'
import { AsgBlueGreenDeployStepInputSetMode } from './AsgBlueGreenDeployStepInputSet'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface Instances {
  type: 'Fixed' | 'CurrentRunning'
  spec: AsgFixedInstances | AsgCurrentRunningInstances
}

export interface AsgAwsLoadBalancerConfigYaml {
  loadBalancer: string
  prodListener: string
  prodListenerRuleArn: string
  stageListener: string
  stageListenerRuleArn: string
  isTrafficShift?: boolean
}

export interface AsgBlueGreenDeployStepInitialValues extends StepElementConfig {
  spec: {
    useAlreadyRunningInstances?: boolean
    loadBalancer: string
    prodListener: string
    prodListenerRuleArn: string
    stageListener: string
    stageListenerRuleArn: string
    loadBalancers: AsgAwsLoadBalancerConfigYaml[]
    asgName?: string
    instances?: Instances
  }
}
export interface AsgBlueGreenDeployCustomStepProps {
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AsgBlueGreenDeployStepInitialValues
  selectedStage: StageElementWrapper<DeploymentStageElementConfig>
  stageIdentifier: string
}

export class AsgBlueGreenDeployStep extends PipelineStep<AsgBlueGreenDeployStepInitialValues> {
  protected type = StepType.AsgBlueGreenDeploy
  protected stepName = 'ASG Blue Green Deploy Step'
  protected stepIcon: IconName = 'asg-blue-green'
  protected stepDescription: keyof StringsMap = 'cd.asgBlueGreenDeployStepDescription'
  protected isHarnessSpecific = false
  protected referenceId = 'AsgBlueGreenDeploy'
  protected defaultValues: AsgBlueGreenDeployStepInitialValues = {
    identifier: '',
    name: '',
    type: StepType.AsgBlueGreenDeploy,
    timeout: '10m',
    spec: {
      loadBalancer: '',
      prodListener: '',
      prodListenerRuleArn: '',
      stageListener: '',
      stageListenerRuleArn: '',
      asgName: '',
      loadBalancers: []
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<AsgBlueGreenDeployStepInitialValues>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      onChange
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <AsgBlueGreenDeployStepInputSetMode
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<AsgBlueGreenDeployStepInitialValues>}
          customStepProps={customStepProps as AsgBlueGreenDeployCustomStepProps}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as AsgBlueGreenDeployCustomStepProps
      return (
        <VariablesListTable
          className={pipelineVariableCss.variablePaddingL3}
          data={variablesData.spec}
          originalData={initialValues.spec}
          metadataMap={metadataMap}
        />
      )
    }

    return (
      <AsgBlueGreenDeployStepEditRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={stepViewType}
        ref={formikRef}
        readonly={readonly}
        customStepProps={customStepProps as AsgBlueGreenDeployCustomStepProps}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType,
    featureFlagValues
  }: ValidateInputSetProps<AsgBlueGreenDeployStepInitialValues>): FormikErrors<AsgBlueGreenDeployStepInitialValues> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    const { CDS_ASG_SHIFT_TRAFFIC_STEP_NG } = featureFlagValues || {}
    const errors: FormikErrors<AsgBlueGreenDeployStepInitialValues> = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<AsgBlueGreenDeployStepInitialValues>
    if (
      isRequired &&
      getMultiTypeFromValue(get(template, 'spec.loadBalancers')) === MultiTypeInputType.RUNTIME &&
      !isEmpty(get(data, 'spec.loadBalancers'))
    ) {
      get(data, 'spec.loadBalancers').forEach((balancer: AsgAwsLoadBalancerConfigYaml, i: number) => {
        const LoadBalancersOptionlField = ['stageListener', 'stageListenerRuleArn']
        for (const prop in balancer) {
          if (isEmpty(balancer[prop as keyof AsgAwsLoadBalancerConfigYaml])) {
            if (
              (CDS_ASG_SHIFT_TRAFFIC_STEP_NG &&
                LoadBalancersOptionlField.includes(prop) &&
                !!balancer['isTrafficShift']) ||
              prop === 'isTrafficShift'
            ) {
              return
            }
            set(
              errors,
              `spec.loadBalancers[${i}].${prop}`,
              getString?.('common.validation.fieldIsRequired', {
                name: getString('common.loadBalancer')
              })
            )
          }
        }
      })
    }

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
