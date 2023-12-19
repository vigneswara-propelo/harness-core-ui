/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { defaultTo } from 'lodash-es'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import type { FormikProps } from 'formik'
import {
  Accordion,
  AllowedTypes,
  Container,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@harness/uicore'

import type { StepElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { MapValue } from '@common/components/MultiTypeCustomMap/MultiTypeCustomMap'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { AwsCDKRollBackStepInitialValues } from '@pipeline/utils/types'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { NameTimeoutField } from '../../Common/GenericExecutionStep/NameTimeoutField'
import { getEnvirontmentVariableValidationSchema } from '../../Common/utils/utils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface AwsCDKRollBackStepFormikValues extends StepElementConfig {
  spec: {
    provisionerIdentifier: string
    envVariables?: MapValue
  }
}

export interface AwsCDKRollBackStepProps {
  initialValues: AwsCDKRollBackStepInitialValues
  onUpdate?: (data: AwsCDKRollBackStepFormikValues) => void
  onChange?: (data: AwsCDKRollBackStepFormikValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  stepViewType?: StepViewType
}

const AwsCDKRollBackStepEdit = (
  props: AwsCDKRollBackStepProps,
  formikRef: StepFormikFowardRef<AwsCDKRollBackStepFormikValues>
): React.ReactElement => {
  const { initialValues, onUpdate, readonly, allowableTypes, onChange, isNewStep, stepViewType } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const validationSchema = Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      provisionerIdentifier: Yup.string().required(getString('common.validation.provisionerIdentifierIsRequired')),
      envVariables: getEnvirontmentVariableValidationSchema(getString)
    })
  })

  const getInitialValues = (): AwsCDKRollBackStepFormikValues => {
    return {
      ...initialValues,
      spec: {
        ...initialValues.spec,
        provisionerIdentifier: defaultTo(initialValues.spec.provisionerIdentifier, ''),
        envVariables: Object.keys(defaultTo(initialValues.spec.envVariables, {})).map(envKey => {
          const envValue = initialValues.spec.envVariables?.[envKey]
          return {
            id: uuid('', nameSpace()),
            key: envKey,
            value: defaultTo(envValue, '')
          }
        })
      }
    }
  }

  return (
    <>
      <Formik<AwsCDKRollBackStepFormikValues>
        onSubmit={values => {
          /* istanbul ignore next */
          onUpdate?.(values)
        }}
        formName="AwsCDKRollBackStepEdit"
        initialValues={getInitialValues()}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={validationSchema}
      >
        {(formik: FormikProps<AwsCDKRollBackStepFormikValues>) => {
          setFormikRef(formikRef, formik)

          return (
            <FormikForm>
              <NameTimeoutField
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />
              <Container className={stepCss.formGroup}>
                <FormInput.MultiTextInput
                  name="spec.provisionerIdentifier"
                  label={getString('pipelineSteps.provisionerIdentifier')}
                  placeholder={getString('pipelineSteps.provisionerIdentifier')}
                  disabled={readonly}
                  multiTextInputProps={{
                    expressions,
                    disabled: readonly,
                    allowableTypes,
                    newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                  }}
                />
                {getMultiTypeFromValue(formik.values.spec.provisionerIdentifier) === MultiTypeInputType.RUNTIME &&
                  !readonly && (
                    <ConfigureOptions
                      value={formik.values.spec.provisionerIdentifier as string}
                      type="String"
                      variableName="spec.provisionerIdentifier"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue('spec.provisionerIdentifier', value)
                      }}
                      isReadonly={readonly}
                    />
                  )}
              </Container>

              <Accordion className={stepCss.accordion}>
                <Accordion.Panel
                  id="aws-cdk-roll-back-optional-accordion"
                  data-testid={'aws-cdk-roll-back-optional-accordion'}
                  summary={getString('common.optionalConfig')}
                  details={
                    <Container margin={{ top: 'medium' }}>
                      <MultiTypeMap
                        name={'spec.envVariables'}
                        valueMultiTextInputProps={{ expressions, allowableTypes }}
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
                  }
                />
              </Accordion>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const AwsCDKRollBackStepEditRef = React.forwardRef(AwsCDKRollBackStepEdit)
