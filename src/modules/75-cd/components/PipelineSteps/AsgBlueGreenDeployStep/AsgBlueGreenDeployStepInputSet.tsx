/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { defaultTo, get, isEmpty, isArray } from 'lodash-es'
import { connect, FormikProps, FieldArray } from 'formik'
import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes,
  Button,
  Layout,
  ButtonVariation,
  FormInput
} from '@harness/uicore'

import type { PipelineInfoConfig, StageElementWrapperConfig } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeCheckboxField } from '@common/components'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'

import type { AsgBlueGreenDeployStepInitialValues, AsgBlueGreenDeployCustomStepProps } from './AsgBlueGreenDeployStep'
import AsgBGStageSetupLoadBalancer from './AsgBGLoadBalancers/AsgBlueGreenDeployLoadBalancers'
import { AsgLoadBalancer } from './AsgBlueGreenDeployStepEdit'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface AsgBlueGreenDeployStepInputSetProps {
  initialValues: AsgBlueGreenDeployStepInitialValues
  allowableTypes: AllowedTypes
  inputSetData: {
    template?: AsgBlueGreenDeployStepInitialValues
    path?: string
    readonly?: boolean
    allValues?: AsgBlueGreenDeployStepInitialValues
  }
  formik?: FormikProps<PipelineInfoConfig>
  customStepProps: AsgBlueGreenDeployCustomStepProps
}

const AsgBlueGreenDeployStepInputSet = (props: AsgBlueGreenDeployStepInputSetProps): React.ReactElement => {
  const { inputSetData, allowableTypes, customStepProps, formik } = props
  const { template, path, readonly } = inputSetData
  const selectedStage = customStepProps?.selectedStage
  const stageIdentifier = customStepProps?.stageIdentifier

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const prefix = isEmpty(path) ? '' : `${path}.`

  const { originalPipeline } = usePipelineVariables()

  const pathFirstPart = path?.split('stages')[0]
  // Find out initial values of the fields which are fixed and required to fetch options of other fields
  const pathPrefix = !isEmpty(pathFirstPart) ? pathFirstPart : undefined
  // Used get from lodash and finding stages conditionally because formik.values has different strcuture
  // when coming from Input Set view and Run Pipeline Form. Ideally, it should be consistent.

  const propagatedStageId = defaultTo(get(selectedStage, 'stage.spec.environment.useFromStage.stage'), '')

  const propagatedStage = originalPipeline?.stages?.find(stage => get(stage, 'stage.identifier') === propagatedStageId)
  const currentStageFormik = get(formik?.values, pathPrefix ? `${pathPrefix}stages` : 'stages')?.find(
    (currStage: StageElementWrapperConfig) => {
      return currStage.stage?.identifier === stageIdentifier
    }
  )

  // These are to be passed in API calls after Service/Env V2 redesign
  const environmentRef =
    defaultTo(
      defaultTo(
        currentStageFormik?.stage?.spec?.environment?.environmentRef,
        defaultTo(
          selectedStage?.stage?.spec?.environment?.environmentRef,
          selectedStage?.stage?.spec?.infrastructure?.environmentRef
        )
      ),
      ''
    ) || defaultTo(get(propagatedStage, 'stage.spec.environment.environmentRef'), '')

  const infrastructureRef =
    defaultTo(
      defaultTo(
        currentStageFormik?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier,
        selectedStage?.stage?.spec?.environment?.infrastructureDefinitions?.[0]?.identifier
      ),
      ''
    ) || defaultTo(get(propagatedStage, 'stage.spec.environment.infrastructureDefinitions.[0].identifier'), '')

  React.useEffect(() => {
    if (getMultiTypeFromValue(get(inputSetData.template, 'spec.loadBalancers')) === MultiTypeInputType.RUNTIME) {
      formik?.setFieldValue(`${prefix}spec.loadBalancers`, [
        {
          loadBalancer: '',
          prodListener: '',
          prodListenerRuleArn: '',
          stageListener: '',
          stageListenerRuleArn: ''
        }
      ])
    }
  }, [inputSetData?.template, prefix])

  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeDurationField
            name={`${prefix}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            disabled={readonly}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.spec?.asgName) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}spec.asgName`}
            label={getString('cd.serviceDashboard.asgName')}
            placeholder={getString('cd.serviceDashboard.asgName')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            fieldPath={`spec.asgName`}
            template={template}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.spec?.useAlreadyRunningInstances) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            multiTypeTextbox={{
              expressions,
              allowableTypes
            }}
            name={`${prefix}spec.useAlreadyRunningInstances`}
            label={getString('cd.useAlreadyRunningInstance')}
            disabled={readonly}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
      <>
        {getMultiTypeFromValue(inputSetData.template?.spec?.instances?.spec?.min) === MultiTypeInputType.RUNTIME ? (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormInput.MultiTextInput
              name={`${prefix}spec.instances.spec.min`}
              placeholder={getString('cd.ElastigroupStep.minInstances')}
              label={getString('cd.ElastigroupStep.minInstances')}
              disabled={readonly}
              multiTextInputProps={{ expressions, disabled: readonly, allowableTypes, textProps: { type: 'number' } }}
            />
          </div>
        ) : null}
        {getMultiTypeFromValue(inputSetData.template?.spec?.instances?.spec?.max) === MultiTypeInputType.RUNTIME ? (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormInput.MultiTextInput
              name={`${prefix}spec.instances.spec.max`}
              placeholder={getString('cd.ElastigroupStep.maxInstances')}
              label={getString('cd.ElastigroupStep.maxInstances')}
              disabled={readonly}
              multiTextInputProps={{ expressions, disabled: readonly, allowableTypes, textProps: { type: 'number' } }}
            />
          </div>
        ) : null}
        {getMultiTypeFromValue(inputSetData.template?.spec?.instances?.spec?.desired) === MultiTypeInputType.RUNTIME ? (
          <div className={cx(stepCss.formGroup, stepCss.md, stepCss.bottomMargin4)}>
            <FormInput.MultiTextInput
              name={`${prefix}spec.instances.spec.desired`}
              placeholder={getString('cd.ElastigroupStep.desiredInstances')}
              label={getString('cd.ElastigroupStep.desiredInstances')}
              disabled={readonly}
              multiTextInputProps={{ expressions, disabled: readonly, allowableTypes, textProps: { type: 'number' } }}
            />
          </div>
        ) : null}
      </>

      {getMultiTypeFromValue(get(inputSetData.template, 'spec.loadBalancers')) &&
        getMultiTypeFromValue(get(inputSetData.template, 'spec.loadBalancers')) === MultiTypeInputType.RUNTIME && (
          <FieldArray
            name={`${prefix}spec.loadBalancers`}
            render={({ push, remove }) => {
              return (
                <>
                  <Layout.Horizontal flex={{ alignItems: 'center' }} margin={{ bottom: 'medium' }}>
                    <div>{getString('cd.ElastigroupBGStageSetup.awsLoadBalancerConfig')}</div>
                    <Button
                      variation={ButtonVariation.LINK}
                      data-testid="add-aws-loadbalance"
                      onClick={() =>
                        push({
                          loadBalancer: '',
                          prodListener: '',
                          prodListenerRuleArn: '',
                          stageListener: '',
                          stageListenerRuleArn: ''
                        })
                      }
                    >
                      {getString('plusAdd')}
                    </Button>
                  </Layout.Horizontal>
                  {isArray(get(formik?.values, `${prefix}spec.loadBalancers`)) &&
                    (
                      get(formik?.values, `${prefix}spec.loadBalancers`) || [
                        {
                          loadBalancer: '',
                          prodListener: '',
                          prodListenerRuleArn: '',
                          stageListener: '',
                          stageListenerRuleArn: ''
                        }
                      ]
                    )?.map((_item: AsgLoadBalancer, i: number) => {
                      return (
                        <AsgBGStageSetupLoadBalancer
                          key={`${_item?.loadBalancer}${i}`}
                          formik={formik as any}
                          readonly={readonly}
                          remove={remove}
                          index={i}
                          envId={defaultTo(environmentRef, '')}
                          infraId={defaultTo(infrastructureRef, '')}
                          path={prefix}
                        />
                      )
                    })}
                </>
              )
            }}
          />
        )}
    </>
  )
}

export const AsgBlueGreenDeployStepInputSetMode = connect(AsgBlueGreenDeployStepInputSet)
