/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, debounce } from 'lodash-es'
import * as Yup from 'yup'
import type { FormikValues, FormikProps } from 'formik'
import cx from 'classnames'
import { Formik, FormInput, MultiTypeInputType, SelectOption, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { AllowedTypes } from '@harness/uicore'
import { useAgentRepositoryServiceGetAppDetails } from 'services/gitops'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef, StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useApplications } from '@cd/components/PipelineSteps/UpdateGitOpsAppStep/useApplications'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import type { UpdateGitOpsAppProps, UpdateGitOpsAppStepData, ApplicationOption } from './helper'
import { SOURCE_TYPE_UNSET, FIELD_KEYS } from './helper'
import { renderFieldArray } from './FieldRenderers'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import ownCSS from './UpdateGitOpsAppStep.module.scss'

interface RenderFormByTypeProps {
  getString: UseStringsReturn['getString']
  formValues: FormikValues
  type?: string
  readonly?: boolean
  allowableTypes: AllowedTypes
  expressions: string[]
  valueFiles: SelectOption[]
  loadingValueFileOptions?: boolean
}

const renderFormByType = ({
  getString,
  formValues,
  type,
  readonly,
  allowableTypes,
  expressions,
  valueFiles,
  loadingValueFileOptions
}: RenderFormByTypeProps): JSX.Element | null => {
  if (type === 'Helm') {
    return (
      <div>
        <div className={ownCSS.header}>Helm</div>
        <div className={stepCss.formGroup}>
          <FormInput.MultiSelect
            name={FIELD_KEYS.valueFiles}
            items={valueFiles || []}
            label={getString('cd.valueFiles')}
            disabled={readonly || loadingValueFileOptions}
            placeholder={loadingValueFileOptions ? getString('loading') : undefined}
          />
        </div>
        <div className={stepCss.formGroup}>
          {renderFieldArray({
            getString,
            readonly,
            allowableTypes,
            expressions,
            formValues,
            fieldKey: FIELD_KEYS.parameters,
            labelKey: 'platform.connectors.parameters',
            buttonLabel: 'platform.connectors.addParameter',
            valueLabel: 'valueLabel'
          })}
        </div>
        <div className={stepCss.formGroup}>
          {renderFieldArray({
            getString,
            readonly,
            allowableTypes,
            expressions,
            formValues,
            fieldKey: FIELD_KEYS.fileParameters,
            labelKey: 'cd.fileParameters',
            buttonLabel: 'platform.connectors.addParameter',
            valueLabel: 'cd.pathValue'
          })}
        </div>
      </div>
    )
  }
  return null
}

function UpdateGitOpsAppStep(
  props: UpdateGitOpsAppProps,
  formikRef: StepFormikFowardRef<UpdateGitOpsAppStepData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true, onChange, stepViewType, allowableTypes, readonly } = props
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const gitopsAllowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME] as AllowedTypes

  const { getString } = useStrings()
  const { data } = useApplications()
  const { expressions } = useVariablesExpression()
  const [valueFileOptions, setValueFileOptions] = React.useState<SelectOption[]>([])

  const {
    data: appDetails,
    loading: appDetailsLoading,
    // error: appDetailsFetchError,
    refetch: fetchAppDetails
  } = useAgentRepositoryServiceGetAppDetails({
    agentIdentifier: 'dummy',
    pathParams: { agentIdentifier: 'dummy', identifier: 'dummy' },
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    },
    identifier: 'dummy',
    lazy: true
  })

  const fetchappDetailsWrapper = (option?: ApplicationOption): void => {
    const agentId = option?.agentId
    const chart = option?.chart
    const targetRevision = option?.targetRevision
    const repoIdentifier = option?.repoIdentifier
    if (!agentId || !repoIdentifier || option?.sourceType !== 'Helm') return
    fetchAppDetails({
      pathParams: {
        agentIdentifier: agentId,
        identifier: repoIdentifier
      },
      queryParams: {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier,
        'query.source.chart': chart,
        'query.source.targetRevision': targetRevision
      }
    })
  }

  const setDefaultValues = (option?: ApplicationOption): void => {
    const _targetRevision = option?.targetRevision
    const formikRefCurrent = (formikRef as React.MutableRefObject<StepFormikRef<UpdateGitOpsAppStepData> | null>)
      ?.current as FormikProps<UpdateGitOpsAppStepData>

    if (!formikRefCurrent || !_targetRevision) return
    formikRefCurrent.setFieldValue(FIELD_KEYS.targetRevision, _targetRevision)
    formikRefCurrent.setFieldValue(FIELD_KEYS.valueFiles, [])
  }

  React.useEffect(() => {
    const isSourceTypeUnset =
      (initialValues.spec.applicationNameOption as ApplicationOption)?.sourceType === SOURCE_TYPE_UNSET
    const formikRefCurrent = (formikRef as React.MutableRefObject<StepFormikRef<UpdateGitOpsAppStepData> | null>)
      ?.current as FormikProps<UpdateGitOpsAppStepData>

    // This is for Edit Mode
    if (isSourceTypeUnset && formikRefCurrent && data.length) {
      const value = (initialValues.spec.applicationNameOption as ApplicationOption)?.value
      const option = data.find(datum => datum.value === value)
      formikRefCurrent.setFieldValue(FIELD_KEYS.application, option)

      // Fetch app details
      fetchappDetailsWrapper(option)
    }
  }, [data])

  React.useEffect(() => {
    const valuesFiles = appDetails?.helm?.valueFiles
    if (valuesFiles?.length) {
      setValueFileOptions(
        valuesFiles.map(option => ({
          label: option,
          value: option
        }))
      )
    } else {
      setValueFileOptions([])
    }
  }, [appDetails])

  const handleTargetRevisionChange = debounce(value => {
    const formikRefCurrent = (formikRef as React.MutableRefObject<StepFormikRef<UpdateGitOpsAppStepData> | null>)
      ?.current as FormikProps<UpdateGitOpsAppStepData>

    formikRefCurrent.setFieldValue(FIELD_KEYS.valueFiles, [])
    fetchappDetailsWrapper({
      ...(formikRefCurrent.values?.spec?.applicationNameOption as ApplicationOption),
      targetRevision: value || ''
    } as ApplicationOption)
  }, 500)

  return (
    <Formik<UpdateGitOpsAppStepData>
      onSubmit={(values: UpdateGitOpsAppStepData) => onUpdate?.(values)}
      formName="UpdateGitOpsApp"
      initialValues={initialValues}
      validate={dataa => {
        onChange?.(dataa)
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
      })}
    >
      {(formik: FormikProps<UpdateGitOpsAppStepData>) => {
        setFormikRef(formikRef, formik)
        return (
          <>
            {stepViewType !== StepViewType.Template && (
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.InputWithIdentifier inputLabel={getString('name')} isIdentifierEditable={isNewStep} />
              </div>
            )}

            <div className={cx(stepCss.formGroup, stepCss.sm)}>
              <FormMultiTypeDurationField
                name="timeout"
                label={getString('pipelineSteps.timeoutLabel')}
                multiTypeDurationProps={{
                  enableConfigureOptions: true,
                  disabled: readonly,
                  allowableTypes
                }}
              />
            </div>
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTypeInput
                selectItems={data}
                disabled={readonly}
                name={FIELD_KEYS.application}
                multiTypeInputProps={{
                  disabled: readonly,
                  allowableTypes: gitopsAllowableTypes,
                  onChange: (value: unknown, _valueType, type) => {
                    const currentValue = (formik.values?.spec?.applicationNameOption as ApplicationOption)?.value
                    // Return if same value is selected again
                    if (currentValue === (value as ApplicationOption)?.value) return

                    if (type === MultiTypeInputType.FIXED && !isEmpty((value as ApplicationOption)?.value)) {
                      setDefaultValues(value as ApplicationOption)
                      fetchappDetailsWrapper(value as ApplicationOption)
                    }
                  }
                }}
                placeholder={getString('selectApplication')}
                label={getString('common.application')}
              />
            </div>
            {formik.values?.spec?.applicationNameOption === RUNTIME_INPUT_VALUE ? null : (
              <>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.MultiTextInput
                    name={FIELD_KEYS.targetRevision}
                    style={{ flex: 1 }}
                    label={getString('cd.getStartedWithCD.targetRevision')}
                    placeholder={getString('cd.getStartedWithCD.targetRevision')}
                    onChange={handleTargetRevisionChange}
                    multiTextInputProps={{
                      disabled: readonly,
                      allowableTypes: gitopsAllowableTypes
                    }}
                  />
                </div>
                {renderFormByType({
                  getString,
                  formValues: formik.values,
                  type: (formik.values.spec?.applicationNameOption as ApplicationOption)?.sourceType,
                  readonly,
                  allowableTypes: gitopsAllowableTypes,
                  expressions,
                  valueFiles: valueFileOptions,
                  loadingValueFileOptions: appDetailsLoading
                })}
              </>
            )}
          </>
        )
      }}
    </Formik>
  )
}

const UpdateGitOpsAppStepWithRef = React.forwardRef(UpdateGitOpsAppStep)
export default UpdateGitOpsAppStepWithRef
