import React from 'react'
import { IconName, AllowedTypes, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { FormikErrors, yupToFormErrors } from 'formik'
import * as Yup from 'yup'
import { defaultTo, get } from 'lodash-es'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig, StepSpecType } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StringsMap } from 'stringTypes'
import { AsgTrafficShiftInputStep } from './AsgTrafficShiftInputSet'
import { AsgTrafficShiftWidget } from './AsgTrafficShiftEditWidget'

import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export type AsgTrafficShiftStepInfo = StepSpecType & {
  delegateSelectors?: string[]
  downsizeOldAsg: boolean
  weight: number | string
}

export interface AsgTrafficShiftData extends StepElementConfig {
  spec: AsgTrafficShiftStepInfo
  identifier: string
}

export interface AsgTrafficShiftVariableStepProps {
  initialValues: AsgTrafficShiftData
  onUpdate?(data: AsgTrafficShiftData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AsgTrafficShiftData
}

export interface AsgTrafficShiftProps {
  initialValues: AsgTrafficShiftData
  onUpdate?: (data: AsgTrafficShiftData) => void
  onChange?: (data: AsgTrafficShiftData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  template?: AsgTrafficShiftData
  readonly?: boolean
  path?: string
}

const AsgTrafficShiftVariableStep: React.FC<AsgTrafficShiftVariableStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return (
    <VariablesListTable
      data={variablesData.spec}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
      className={pipelineVariablesCss.variablePaddingL3}
    />
  )
}

const AsgTrafficShiftWidgetWithRef = React.forwardRef(AsgTrafficShiftWidget)
export class AsgTrafficShift extends PipelineStep<AsgTrafficShiftData> {
  protected type = StepType.AsgShiftTraffic
  protected stepName = 'ASG Traffic Shift'
  protected referenceId = 'AsgTrafficeShift'
  protected stepIcon: IconName = 'asg-swap'
  protected stepDescription: keyof StringsMap = 'cd.asgBlueGreenTrafficShiftStepDescription'
  protected isHarnessSpecific = false
  protected defaultValues: AsgTrafficShiftData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.AsgShiftTraffic,
    spec: {
      downsizeOldAsg: false,
      weight: 0
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<AsgTrafficShiftData>): JSX.Element {
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
        <AsgTrafficShiftInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          readonly={!!get(inputSetData, 'readonly')}
          path={get(inputSetData, 'path')}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <AsgTrafficShiftVariableStep
          {...(customStepProps as AsgTrafficShiftVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <AsgTrafficShiftWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        allowableTypes={allowableTypes}
        onChange={onChange}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AsgTrafficShiftData>): FormikErrors<AsgTrafficShiftData> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors: FormikErrors<AsgTrafficShiftData> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)
          Object.assign(errors, err)
        }
      }
    }

    return errors
  }
}
