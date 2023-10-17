/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { get } from 'lodash-es'
import { FormikProps } from 'formik'
import { AllowedTypes, getMultiTypeFromValue, MultiTypeInputType, Formik } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { setFormikRef, StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { TargetRevision } from './TargetRevision'
import { useApplications } from './useApplications'
import { ApplicationOption, FIELD_KEYS, SOURCE_TYPE_UNSET, UpdateGitOpsAppStepData } from './helper'
import { renderFormByType } from './FieldRenderers'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface UpdateGitopsAppInputStepProps {
  initialValues: UpdateGitOpsAppStepData
  onUpdate?: (data: UpdateGitOpsAppStepData) => void
  onChange?: (data: UpdateGitOpsAppStepData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  readonly?: boolean
  template?: UpdateGitOpsAppStepData
  path?: string
}

const UpdateGitopsAppInputStep = (props: UpdateGitopsAppInputStepProps): React.ReactElement => {
  const formikRef = React.createRef<StepFormikRef<unknown>>()
  const { template, readonly, allowableTypes, stepViewType, onChange, onUpdate, initialValues } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { data: appsData, loading: loadingApplications } = useApplications()
  const prefix = '' // || isEmpty(path) ? '' : `${path}.`
  const isApplicationField =
    getMultiTypeFromValue(get(template, 'spec.applicationName')) === MultiTypeInputType.RUNTIME &&
    getMultiTypeFromValue(get(template, 'spec.agentId')) === MultiTypeInputType.RUNTIME
  const isTargetRevisionField =
    getMultiTypeFromValue(get(template, 'spec.targetRevision')) === MultiTypeInputType.RUNTIME

  React.useEffect(() => {
    const isSourceTypeUnset =
      (initialValues.spec?.applicationNameOption as ApplicationOption)?.sourceType === SOURCE_TYPE_UNSET
    const formikRefCurrent = (formikRef as React.MutableRefObject<StepFormikRef<UpdateGitOpsAppStepData>>)
      ?.current as FormikProps<UpdateGitOpsAppStepData>

    if (isSourceTypeUnset && formikRefCurrent && appsData.length) {
      const value = (initialValues.spec.applicationNameOption as ApplicationOption)?.value
      const option = appsData.find(datum => datum.value === value)
      formikRefCurrent.setFieldValue(FIELD_KEYS.application, option)
    }
  }, [appsData])

  return (
    <Formik
      onSubmit={values => /* istanbul ignore next */ onUpdate?.(values)}
      formName="UpdateGitOpsAppInputStep"
      initialValues={initialValues}
      validate={dataa => {
        /* istanbul ignore next */ onChange?.(dataa)
      }}
    >
      {formik => {
        setFormikRef(formikRef, formik)
        return (
          <div
            onKeyDown={e => {
              if (e.keyCode === 13) {
                e.stopPropagation()
                e.preventDefault()
              }
            }}
          >
            {getMultiTypeFromValue(get(template, 'timeout', '')) === MultiTypeInputType.RUNTIME && (
              <TimeoutFieldInputSetView
                multiTypeDurationProps={{
                  width: 400,
                  configureOptionsProps: {
                    isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
                  },
                  allowableTypes,
                  expressions,
                  disabled: readonly
                }}
                fieldPath={'timeout'}
                template={template}
                label={getString('pipelineSteps.timeoutLabel')}
                name={`${prefix}timeout`}
                disabled={readonly}
                className={cx(stepCss.formGroup, stepCss.sm)}
              />
            )}
            {isApplicationField ? (
              <SelectInputSetView
                name={`${prefix}spec.applicationNameOption`}
                selectItems={appsData}
                template={template}
                fieldPath={'spec.applicationNameOption'}
                disabled={readonly}
                placeholder={getString('selectApplication')}
                label={getString('common.application')}
                multiTypeInputProps={{
                  width: 400,
                  selectProps: {
                    items: appsData,
                    allowCreatingNewItems: false,
                    loadingItems: loadingApplications
                  },
                  allowableTypes,
                  expressions
                }}
              />
            ) : null}

            {
              /* istanbul ignore next */ isApplicationField || isTargetRevisionField ? (
                <TargetRevision
                  app={/* istanbul ignore next */ formik.values.spec?.applicationNameOption as ApplicationOption}
                  readonly={readonly}
                  formik={formik}
                  allowableTypes={allowableTypes}
                  fieldWidth={400}
                  showAlways
                />
              ) : null
            }
            {
              /* istanbul ignore next */ isApplicationField || isTargetRevisionField
                ? renderFormByType({
                    getString,
                    formValues: formik.values,
                    type: (formik.values?.spec?.applicationNameOption as ApplicationOption)?.appType,
                    readonly,
                    allowableTypes,
                    expressions,
                    valueFiles: [],
                    loadingValueFileOptions: false
                  })
                : null
            }
          </div>
        )
      }}
    </Formik>
  )
}

export default UpdateGitopsAppInputStep
