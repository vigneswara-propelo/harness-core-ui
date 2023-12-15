/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Accordion, AllowedTypes, Formik, FormikForm } from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { isEmpty } from 'lodash-es'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { LocationType } from '@cd/components/PipelineSteps/CommandScripts/CommandScriptsTypes'

import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { GetExecutionStrategyYamlQueryParams } from 'services/cd-ng'
import { isNewServiceEnvEntity } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { getServiceDefinitionType, ServiceDeploymentType, StageType } from '@pipeline/utils/stageHelpers'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import OptionalConfiguration from './OptionalConfiguration'
import BaseShellScript from './BaseShellScript'
import { ShellScriptFormData, variableSchema } from './shellScriptTypes'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

/**
 * Spec
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/1203634286/Shell+Script
 */

interface ShellScriptWidgetProps {
  initialValues: ShellScriptFormData
  onUpdate?: (data: ShellScriptFormData) => void
  onChange?: (data: ShellScriptFormData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
}

export function ShellScriptWidget(
  {
    initialValues,
    onUpdate,
    onChange,
    allowableTypes,
    isNewStep = true,
    readonly,
    stepViewType
  }: ShellScriptWidgetProps,
  formikRef: StepFormikFowardRef<ShellScriptFormData>
): JSX.Element {
  const { getString } = useStrings()

  const {
    state: {
      selectionState: { selectedStageId },
      templateServiceData
    },
    getStageFromPipeline
  } = usePipelineContext()

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const isSvcEnvEnabled = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)

  const selectedDeploymentType = (): GetExecutionStrategyYamlQueryParams['serviceDefinitionType'] => {
    return getServiceDefinitionType(
      stage,
      getStageFromPipeline,
      isNewServiceEnvEntity,
      isSvcEnvEnabled,
      templateServiceData
    )
  }

  const isInfraSelectorAllowed = (): boolean => {
    const deploymentType = selectedDeploymentType() as ServiceDeploymentType

    // Infra selector option is only allowed for CD stage and K8s/NativeHelm deployment
    return (
      stage?.stage?.type === StageType.DEPLOY &&
      [ServiceDeploymentType.NativeHelm, ServiceDeploymentType.Kubernetes].includes(deploymentType)
    )
  }

  const executionTargetBaseSchema = Yup.object().shape({
    host: Yup.string()
      .trim()
      .required(getString('fieldRequired', { field: getString('cd.specifyTargetHost') })),
    workingDirectory: Yup.string()
      .trim()
      .required(getString('fieldRequired', { field: getString('workingDirectory') }))
  })

  const validationSchema = Yup.object().shape({
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      shell: Yup.string().trim().required(getString('validation.scriptTypeRequired')),
      source: Yup.object().shape({
        spec: Yup.object()
          .when(['type'], {
            is: type => type === LocationType.INLINE,
            then: Yup.object().shape({
              script: Yup.string().trim().required(getString('common.scriptRequired'))
            })
          })
          .when(['type'], {
            is: type => type === LocationType.HARNESS,
            then: Yup.object().shape({
              file: Yup.string()
                .trim()
                .required(getString('fieldRequired', { field: getString('common.git.filePath') }))
            })
          })
      }),
      environmentVariables: variableSchema(getString, StepType.SHELLSCRIPT),
      outputVariables: variableSchema(getString, StepType.SHELLSCRIPT),
      executionTarget: Yup.lazy(executionTarget => {
        // executionTarget as runtime field
        if (typeof executionTarget === 'string') {
          return Yup.string().required(getString('fieldRequired', { field: getString('pipeline.executionTarget') }))
        } else if (isEmpty(executionTarget)) {
          // executionTarget value {} is to select On Delegate. So do not validate field
          return Yup.object()
        } else {
          return Yup.object().when(['shell'], {
            is: shell => shell === 'PowerShell',
            then: executionTargetBaseSchema.shape({
              connectorRef: Yup.string()
                .trim()
                .required(getString('fieldRequired', { field: getString('platform.secrets.typeWinRM') }))
            }),
            otherwise: executionTargetBaseSchema.shape({
              connectorRef: Yup.string()
                .trim()
                .required(getString('fieldRequired', { field: getString('sshConnector') }))
            })
          })
        }
      })
    }),
    ...getNameAndIdentifierSchema(getString, stepViewType)
  })

  return (
    <Formik<ShellScriptFormData>
      onSubmit={(submit, formikActions) => {
        if (submit.spec?.outputAlias) {
          if (submit.spec?.outputAlias.key === '' && !submit.spec?.outputAlias.scope) {
            delete submit.spec?.outputAlias
          } else {
            if (!submit.spec?.outputAlias.key) {
              formikActions.setFieldError('spec.outputAlias.key', getString('pipeline.exportVars.keyValidation'))
              return
            }
            if (!submit.spec?.outputAlias.scope) {
              formikActions.setFieldError('spec.outputAlias.scope', getString('pipeline.exportVars.scopeValidation'))
              return
            }
          }
        }
        onUpdate?.(submit)
      }}
      validate={formValues => {
        onChange?.(formValues)
      }}
      formName="shellScriptForm"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<ShellScriptFormData>) => {
        // this is required
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <BaseShellScript
              isNewStep={isNewStep}
              stepViewType={stepViewType}
              formik={formik}
              readonly={readonly}
              allowableTypes={allowableTypes}
              isInfraSelectorAllowed={isInfraSelectorAllowed()}
            />

            <Accordion className={stepCss.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <OptionalConfiguration
                    formik={formik}
                    readonly={readonly}
                    allowableTypes={allowableTypes}
                    stepName={StepType.SHELLSCRIPT}
                  />
                }
              />
            </Accordion>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const ShellScriptWidgetWithRef = React.forwardRef(ShellScriptWidget)
