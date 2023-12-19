/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { AllowedTypes, Container, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { StepElementConfig } from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { getImagePullPolicyOptions } from '@common/utils/ContainerRunStepUtils'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import type { MultiTypeListType } from '@common/components/MultiTypeList/MultiTypeList'
import type { MapValue } from '@common/components/MultiTypeCustomMap/MultiTypeCustomMap'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { Connectors } from '@platform/connectors/constants'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ConnectorRef } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'

import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const awsCdkStepAllowedConnectorTypes = [Connectors.GCP, Connectors.AWS, Connectors.DOCKER]
export const awsCdkCommonParametersTypes = [StepType.AwsCdkDeploy]
export interface AwsCDKCommonStepFormikValues extends StepElementConfig {
  spec: {
    connectorRef: ConnectorRef
    image?: string
    commandOptions?: MultiTypeListType
    stackNames?: MultiTypeListType
    privileged?: boolean
    imagePullPolicy?: string
    runAsUser?: string
    appPath?: string
    provisionerIdentifier?: string
    resources?: {
      limits?: {
        memory?: string
        cpu?: string
      }
    }
    envVariables?: MapValue
    parameters?: MapValue
  }
}
export type AwsCdkCommonStepFormikValues = AwsCDKCommonStepFormikValues

export interface AwsCdkStepCommonOptionalFieldsEditProps {
  allowableTypes: AllowedTypes
  readonly?: boolean
  formik: FormikProps<AwsCdkCommonStepFormikValues>
  commandOptionsFieldName?: string
  commandOptionsFieldLabel?: string
  stepType?: StepType
}

const StackNamesIncluded = [StepType.AwsCdkDiff, StepType.AwsCdkSynth, StepType.AwsCdkDeploy, StepType.AwsCdkDestroy]

export function AwsCdkCommonOptionalFieldsEdit(props: AwsCdkStepCommonOptionalFieldsEditProps): React.ReactElement {
  const { readonly, allowableTypes, formik, commandOptionsFieldName, commandOptionsFieldLabel, stepType } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  return (
    <>
      {commandOptionsFieldName && (
        <Container className={cx(stepCss.formGroup)}>
          <MultiTypeList
            name={commandOptionsFieldName}
            multiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            multiTypeFieldSelectorProps={{
              label: defaultTo(commandOptionsFieldLabel, ''),
              allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
            }}
            disabled={readonly}
            configureOptionsProps={{ hideExecutionTimeField: true }}
          />
        </Container>
      )}

      {stepType && StackNamesIncluded.includes(stepType) ? (
        <Container className={cx(stepCss.formGroup)}>
          <MultiTypeList
            name={'spec.stackNames'}
            multiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            multiTypeFieldSelectorProps={{
              label: defaultTo(getString('pipeline.buildInfra.stackNames'), ''),
              allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
            }}
            disabled={readonly}
            configureOptionsProps={{ hideExecutionTimeField: true }}
          />
        </Container>
      ) : null}

      <Container className={cx(stepCss.formGroup, stepCss.md)}>
        <FormMultiTypeCheckboxField
          name={'spec.privileged'}
          label={getString('pipeline.buildInfra.privileged')}
          multiTypeTextbox={{
            expressions,
            allowableTypes,
            disabled: readonly,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          disabled={readonly}
          configureOptionsProps={{ hideExecutionTimeField: true }}
        />
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTypeInput
          name="spec.imagePullPolicy"
          label={getString('pipelineSteps.pullLabel')}
          selectItems={getImagePullPolicyOptions(getString)}
          placeholder={getString('select')}
          disabled={readonly}
          useValue={true}
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: { addClearBtn: true, items: getImagePullPolicyOptions(getString) },
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
        />
        {getMultiTypeFromValue(formik.values.spec.imagePullPolicy) === MultiTypeInputType.RUNTIME && (
          <SelectConfigureOptions
            options={getImagePullPolicyOptions(getString)}
            value={formik.values.spec.imagePullPolicy as string}
            type={getString('string')}
            variableName={'spec.imagePullPolicy'}
            showRequiredField={false}
            showDefaultField={false}
            onChange={val => formik?.setFieldValue('formik.values.spec.imagePullPolicy', val)}
            isReadonly={readonly}
          />
        )}
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.runAsUser"
          label={getString('pipeline.stepCommonFields.runAsUser')}
          placeholder="1000"
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
        />
        {getMultiTypeFromValue(formik.values.spec?.runAsUser) === MultiTypeInputType.RUNTIME && !readonly && (
          <ConfigureOptions
            value={formik.values.spec?.runAsUser as string}
            type="String"
            variableName="spec.runAsUser"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setFieldValue('spec.runAsUser', value)
            }}
            isReadonly={readonly}
          />
        )}
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.resources.limits.memory"
          label={getString('pipelineSteps.limitMemoryLabel')}
          placeholder={getString('common.enterPlaceholder', { name: getString('pipelineSteps.limitMemoryLabel') })}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
        />
        {getMultiTypeFromValue(formik.values.spec?.resources?.limits?.memory) === MultiTypeInputType.RUNTIME &&
          !readonly && (
            <ConfigureOptions
              value={formik.values.spec?.resources?.limits?.memory as string}
              type="String"
              variableName="spec.resources.limits.memory"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => {
                formik.setFieldValue('spec.resources.limits.memory', value)
              }}
              isReadonly={readonly}
            />
          )}
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.resources.limits.cpu"
          label={getString('pipelineSteps.limitCPULabel')}
          placeholder={getString('common.enterPlaceholder', { name: getString('pipelineSteps.limitCPULabel') })}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
        />
        {getMultiTypeFromValue(formik.values.spec?.resources?.limits?.cpu) === MultiTypeInputType.RUNTIME && !readonly && (
          <ConfigureOptions
            value={formik.values.spec?.resources?.limits?.cpu as string}
            type="String"
            variableName="spec.resources.limits.cpu"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setFieldValue('spec.resources.limits.cpu', value)
            }}
            isReadonly={readonly}
          />
        )}
      </Container>

      <Container className={stepCss.bottomSpacing}>
        <MultiTypeMap
          name={'spec.envVariables'}
          valueMultiTextInputProps={{
            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          multiTypeFieldSelectorProps={{
            label: getString('environmentVariables'),
            disableTypeSelection: true
          }}
          configureOptionsProps={{
            hideExecutionTimeField: true
          }}
          disabled={readonly}
        />
      </Container>
      {awsCdkCommonParametersTypes.includes(defaultTo(stepType, StepType.AwsCdkDiff)) ? (
        <Container className={stepCss.bottomSpacing}>
          <MultiTypeMap
            name={'spec.parameters'}
            valueMultiTextInputProps={{
              expressions,
              allowableTypes,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            multiTypeFieldSelectorProps={{
              label: getString('platform.connectors.parameters'),
              disableTypeSelection: true
            }}
            configureOptionsProps={{
              hideExecutionTimeField: true
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
    </>
  )
}
