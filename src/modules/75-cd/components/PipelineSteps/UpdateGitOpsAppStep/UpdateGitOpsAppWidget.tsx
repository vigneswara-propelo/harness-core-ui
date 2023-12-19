/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { Formik, FormInput, MultiTypeInputType, SelectOption, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { useAgentRepositoryServiceGetAppDetails } from 'services/gitops'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef, StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useApplications } from '@cd/components/PipelineSteps/UpdateGitOpsAppStep/useApplications'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import type { UpdateGitOpsAppProps, UpdateGitOpsAppStepData, ApplicationOption } from './helper'
import { SOURCE_TYPE_UNSET, FIELD_KEYS, gitopsAllowableTypes, isHelmApp } from './helper'
import { renderFormByType } from './FieldRenderers'
import { TargetRevision } from './TargetRevision'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function UpdateGitOpsAppStep(
  props: UpdateGitOpsAppProps,
  formikRef: StepFormikFowardRef<UpdateGitOpsAppStepData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true, onChange, stepViewType, allowableTypes, readonly } = props
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()

  const { getString } = useStrings()
  const { data } = useApplications()
  const { expressions } = useVariablesExpression()
  const [valueFileOptions, setValueFileOptions] = React.useState<SelectOption[]>([])
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const {
    data: appDetails,
    loading: appDetailsLoading,
    refetch: fetchAppDetails,
    cancel: cancelAppDetails
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

  const fetchappDetailsWrapper = (option?: ApplicationOption, targetRevisionValue?: string): void => {
    const agentId = option?.agentId
    const chart = option?.chart
    const targetRevision = targetRevisionValue || option?.targetRevision
    const repoIdentifier = option?.repoIdentifier
    if (!agentId || !repoIdentifier || !isHelmApp(option)) return
    cancelAppDetails()
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
        'query.source.targetRevision': targetRevision,
        'query.source.path': option?.path
      }
    })
  }

  const setDefaultValues = (option?: ApplicationOption): void => {
    const _targetRevision = option?.targetRevision
    const formikRefCurrent = (formikRef as React.MutableRefObject<StepFormikRef<UpdateGitOpsAppStepData> | null>)
      ?.current as FormikProps<UpdateGitOpsAppStepData>

    if (!formikRefCurrent) return

    const isTargetRevisionRunTime = formikRefCurrent.values?.spec?.targetRevision
    if (!isTargetRevisionRunTime) {
      formikRefCurrent.setFieldValue(
        FIELD_KEYS.targetRevision,
        _targetRevision ? { label: _targetRevision, value: _targetRevision } : undefined
      )
    }
    formikRefCurrent.setFieldValue(FIELD_KEYS.valueFiles, [])
  }

  // Initial - On Edit
  React.useEffect(() => {
    const isSourceTypeUnset =
      (initialValues.spec.applicationNameOption as ApplicationOption)?.sourceType === SOURCE_TYPE_UNSET
    const formikRefCurrent = (formikRef as React.MutableRefObject<StepFormikRef<UpdateGitOpsAppStepData> | null>)
      ?.current as FormikProps<UpdateGitOpsAppStepData>
    const initialTargetValue = initialValues.spec.targetRevision
    const initialAppValue = (initialValues.spec.applicationNameOption as ApplicationOption)?.value
    const isAppNotRunTime = initialAppValue !== RUNTIME_INPUT_VALUE

    // This is for Edit Mode
    if (isSourceTypeUnset && formikRefCurrent && data.length) {
      const value = (initialValues.spec.applicationNameOption as ApplicationOption)?.value
      const option = data.find(datum => datum.value === value)
      const _targetRevision = option?.targetRevision

      if (isAppNotRunTime) {
        formikRefCurrent.setFieldValue(FIELD_KEYS.application, option)
      }

      if (
        isAppNotRunTime &&
        initialTargetValue !== RUNTIME_INPUT_VALUE &&
        !(initialTargetValue as SelectOption)?.value
      ) {
        formikRefCurrent.setFieldValue(
          FIELD_KEYS.targetRevision,
          _targetRevision ? { label: _targetRevision, value: _targetRevision } : undefined
        )
      }

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

  const handleChangeTargetRevision = (targetRevisionValue?: string) => {
    const formikRefCurrent = (formikRef as React.MutableRefObject<StepFormikRef<UpdateGitOpsAppStepData> | null>)
      ?.current as FormikProps<UpdateGitOpsAppStepData>
    const app = formikRefCurrent.values?.spec.applicationNameOption
    if (
      formikRefCurrent &&
      isHelmApp(app as ApplicationOption) &&
      targetRevisionValue &&
      targetRevisionValue !== RUNTIME_INPUT_VALUE
    ) {
      fetchappDetailsWrapper(app as ApplicationOption, targetRevisionValue as string)
    }
  }

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

                    if (isMultiTypeRuntime(type)) {
                      formik.setFieldValue(FIELD_KEYS.targetRevision, undefined)
                      formik.setFieldValue(FIELD_KEYS.valueFiles, [])
                    }
                  },
                  newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                }}
                placeholder={getString('selectApplication')}
                label={getString('common.application')}
              />
            </div>
            {formik.values?.spec?.applicationNameOption === RUNTIME_INPUT_VALUE ? null : (
              <>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <TargetRevision
                    app={formik.values.spec?.applicationNameOption as ApplicationOption}
                    readonly={readonly}
                    formik={formik}
                    onChange={handleChangeTargetRevision}
                  />
                </div>
                {renderFormByType({
                  getString,
                  formValues: formik.values,
                  type: (formik.values.spec?.applicationNameOption as ApplicationOption)?.appType,
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
