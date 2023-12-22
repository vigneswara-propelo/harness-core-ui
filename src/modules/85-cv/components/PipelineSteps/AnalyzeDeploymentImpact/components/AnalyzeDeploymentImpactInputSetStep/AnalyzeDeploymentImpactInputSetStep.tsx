import React from 'react'
import { AllowedTypes, Container, FormikForm, FormInput } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import {
  checkIfRunTimeInput,
  isConfiguredMonitoredServiceRunTime
} from '@cv/components/PipelineSteps/ContinousVerification/utils'
import ConfiguredRunTimeMonitoredService from '@cv/components/PipelineSteps/ContinousVerification/components/ContinousVerificationInputSetStep/components/ConfiguredRunTimeMonitoredService/ConfiguredRunTimeMonitoredService'
import { AnalyzeDeploymentImpactData } from '../../AnalyzeDeploymentImpact.types'
import { MONITORED_SERVICE_TYPE } from '../../AnalyzeDeploymentImpact.constants'
import { ANALYSIS_DURATION_OPTIONS } from '../AnalyzeDeploymentImpactWidget/components/AnalyzeDeploymentImpactWidgetSections/components/BaseAnalyzeDeploymentImpact/BaseAnalyzeDeploymentImpact.constants'
import css from './AnalyzeDeploymentImpactInputSetStep.module.scss'

export interface AnalyzeDeploymentImpactInputSetStepProps {
  initialValues: AnalyzeDeploymentImpactData
  onUpdate?: (data: AnalyzeDeploymentImpactData) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: AnalyzeDeploymentImpactData
  path?: string
  allowableTypes: AllowedTypes
  formik?: AnalyzeDeploymentImpactData
}

export default function AnalyzeDeploymentImpactInputSetStep(
  props: AnalyzeDeploymentImpactInputSetStepProps
): JSX.Element {
  const { template, path, readonly, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`
  const { monitoredService, duration } = template?.spec || {}
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const renderRunTimeMonitoredService = (): JSX.Element => {
    const type = monitoredService?.type ?? MONITORED_SERVICE_TYPE.DEFAULT
    if (isConfiguredMonitoredServiceRunTime(type, monitoredService)) {
      return (
        <ConfiguredRunTimeMonitoredService
          prefix={prefix}
          expressions={expressions}
          allowableTypes={allowableTypes}
          monitoredService={monitoredService}
        />
      )
    } else {
      return <></>
    }
  }

  return (
    <FormikForm>
      {renderRunTimeMonitoredService()}
      <Container className={css.container}>
        {checkIfRunTimeInput(duration) && (
          <Container className={css.itemRuntimeSetting}>
            <FormInput.MultiTypeInput
              label={getString('duration')}
              name={`${prefix}spec.duration`}
              selectItems={ANALYSIS_DURATION_OPTIONS}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
              }}
              disabled={readonly}
            />
          </Container>
        )}

        {checkIfRunTimeInput(template?.timeout) && (
          <Container className={css.itemRuntimeSetting}>
            <FormMultiTypeDurationField
              name={`${prefix}timeout`}
              label={getString('pipelineSteps.timeoutLabel')}
              disabled={readonly}
              multiTypeDurationProps={{
                expressions,
                enableConfigureOptions: false,
                allowableTypes,
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
              }}
            />
          </Container>
        )}
      </Container>
    </FormikForm>
  )
}
