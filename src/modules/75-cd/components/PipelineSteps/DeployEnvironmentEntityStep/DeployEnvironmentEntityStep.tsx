/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikErrors } from 'formik'
import { isArray, isEmpty, isNil, noop, set } from 'lodash-es'
import { IconName, MultiTypeInputType, getMultiTypeFromValue } from '@harness/uicore'

import produce from 'immer'
import { isValueRuntimeInput } from '@modules/10-common/utils/utils'
import { Step, StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import DeployEnvironmentEntityWidget from './DeployEnvironmentEntityWidget'
import type {
  DeployEnvironmentEntityConfig,
  DeployEnvironmentEntityCustomInputStepProps,
  DeployEnvironmentEntityCustomStepProps
} from './types'
import { processInitialValues, processFormValues } from './utils/utils'
import DeployEnvironmentEntityInputStep from './DeployEnvironmentEntityInputStep'

function processFormData(values: DeployEnvironmentEntityConfig): DeployEnvironmentEntityConfig {
  const finalValues = produce(values, draft => {
    if (draft.environment) {
      const gitBranch = draft.gitMetadata?.[draft.environment.environmentRef as string]
      if (gitBranch) {
        set(draft, 'environment.gitBranch', gitBranch)
      }
    }
    if (draft.environments && isArray(draft.environments.values)) {
      draft.environments.values?.forEach((env, index) => {
        const gitBranch = draft.gitMetadata?.[env.environmentRef as string]
        if (gitBranch) {
          set(draft, `environments.values[${index}].gitBranch`, gitBranch)
        }
      })
    }
  })
  return finalValues
}

function processInitialValuesForRunForm(initialValues: DeployEnvironmentEntityConfig): DeployEnvironmentEntityConfig {
  const finalInitialValues = produce(initialValues, draft => {
    if (draft.environment) {
      set(draft, 'gitMetadata', {
        ...draft.gitMetadata,
        [draft.environment.environmentRef as string]: draft.environment.gitBranch
      })
    }
    if (draft.environments && isArray(draft.environments.values)) {
      draft.environments.values.map(env => {
        set(draft, 'gitMetadata', { ...draft.gitMetadata, [env.environmentRef as string]: env.gitBranch })
      })
    }
  })
  return finalInitialValues
}
export class DeployEnvironmentEntityStep extends Step<DeployEnvironmentEntityConfig> {
  protected type = StepType.DeployEnvironmentEntity
  protected stepPaletteVisible = false
  protected stepName = 'Deploy Environment Entity'
  protected stepIcon: IconName = 'main-environments'

  protected defaultValues: DeployEnvironmentEntityConfig = {}

  constructor() {
    super()
  }

  renderStep(props: StepProps<DeployEnvironmentEntityConfig>): JSX.Element {
    const {
      initialValues,
      readonly = false,
      allowableTypes,
      onUpdate,
      inputSetData,
      stepViewType,
      customStepProps
    } = props

    if (isTemplatizedView(stepViewType)) {
      return (
        <Formik
          initialValues={processInitialValuesForRunForm(initialValues)}
          validate={values => {
            onUpdate?.(processFormData(values))
          }}
          onSubmit={noop}
        >
          {/** Wrapping this component in formik to prevent the pseudo fields from corrupting the main input set formik.
           * The onUpdate call takes care of picking only the required data and naturally eliminate the pseudo fields.
           * The pseudo fields are present within the component - DeployEnvironmentEntityInputStep */}
          <DeployEnvironmentEntityInputStep
            initialValues={initialValues}
            inputSetData={inputSetData}
            allowableTypes={allowableTypes}
            stepViewType={stepViewType}
            {...(customStepProps as Required<DeployEnvironmentEntityCustomInputStepProps>)}
          />
        </Formik>
      )
    }

    return (
      <DeployEnvironmentEntityWidget
        initialValues={processInitialValues(
          initialValues,
          customStepProps as DeployEnvironmentEntityCustomInputStepProps,
          onUpdate
        )}
        readonly={readonly}
        allowableTypes={allowableTypes}
        onUpdate={values =>
          onUpdate?.(processFormValues(values, customStepProps as DeployEnvironmentEntityCustomInputStepProps))
        }
        {...(customStepProps as Required<DeployEnvironmentEntityCustomStepProps>)}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<DeployEnvironmentEntityConfig>): FormikErrors<Required<DeployEnvironmentEntityConfig>> {
    const errors: FormikErrors<Required<DeployEnvironmentEntityConfig>> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data?.environment?.environmentRef) &&
      isEmpty(data?.environment?.useFromStage) &&
      isRequired &&
      getMultiTypeFromValue(template?.environment?.environmentRef) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'environment.environmentRef', getString?.('cd.pipelineSteps.environmentTab.environmentIsRequired'))
    }

    if (
      isNil(data?.environment?.environmentRef) &&
      isEmpty(data?.environment?.useFromStage?.stage) &&
      isRequired &&
      (isValueRuntimeInput(template?.environment?.environmentRef) ||
        isValueRuntimeInput(template?.environment?.useFromStage as any))
    ) {
      set(errors, 'environment.useFromStage.stage', getString?.('cd.pipelineSteps.environmentTab.useFromStageRequired'))
    }

    /**
     * @TODO This validation was correct if "variable.required" was part of if condition.
     * We commented this part of now because required support for varible overrides is still not there in Edit and Runtime view
     * Required support for variable is there for Edit view and Backend devs are fixing issue in Runtime view. (Reach out to @Naidu)
     * So, considering this required support is there for variable creation, required support should be there for variable overrides as well.
     */

    // data?.environment?.serviceOverrideInputs?.variables?.forEach((variable: AllNGVariables, index: number) => {
    //   const currentVariableTemplate = get(template, `environment.serviceOverrideInputs.variables[${index}].value`, '')
    //   if (
    //     isRequired &&
    //     variable.required &&
    //     ((isEmpty(variable.value) && variable.type !== 'Number') ||
    //       (variable.type === 'Number' && (typeof variable.value !== 'number' || isNaN(variable.value)))) &&
    //     getMultiTypeFromValue(currentVariableTemplate) === MultiTypeInputType.RUNTIME
    //   ) {
    //     set(
    //       errors,
    //       `serviceOverrideInputs.variables.[${index}].value`,
    //       getString?.('fieldRequired', { field: variable.name })
    //     )
    //   }
    // })
    // if (!(errors as EnvironmentYamlV2)?.serviceOverrideInputs?.variables?.length) {
    //   delete (errors as EnvironmentYamlV2)?.serviceOverrideInputs
    // }

    return errors
  }
}
