/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get, isEmpty, memoize, pickBy, set } from 'lodash-es'
import { Intent } from '@blueprintjs/core'
import {
  EXECUTION_TIME_INPUT_VALUE,
  FormError,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  PageSpinner,
  SelectOption,
  Text
} from '@harness/uicore'
import { IItemRendererProps } from '@blueprintjs/select'
import { useStrings } from 'framework/strings'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { JiraFieldsRenderer } from '@pipeline/components/PipelineSteps/Steps/JiraCreate/JiraFieldsRenderer'
import type { JiraFieldNGWithValue } from '@pipeline/components/PipelineSteps/Steps/JiraCreate/types'
import { getInitialValueForSelectedField } from '@pipeline/components/PipelineSteps/Steps/JiraCreate/helper'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import {
  JiraFieldNG,
  JiraIssueTransitionNG,
  JiraStatusNG,
  useGetIssueTransitions,
  useGetJiraIssueUpdateMetadata,
  useGetJiraStatuses
} from 'services/cd-ng'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { getGenuineValue } from '../JiraApproval/helper'
import type { JiraUpdateDeploymentModeFormContentInterface, JiraUpdateDeploymentModeProps } from './types'
import css from '../JiraCreate/JiraCreate.module.scss'
function FormContent(formContentProps: JiraUpdateDeploymentModeFormContentInterface): React.ReactElement {
  const {
    inputSetData,
    initialValues,
    statusResponse,
    fetchingStatuses,
    refetchStatuses,
    allowableTypes,
    stepViewType,
    refetchIssueUpdateMetadata,
    issueUpdateMetadataResponse,
    issueUpdateMetadataLoading,
    issueUpdateMetadataFetchError,
    refetchIssueTransitions,
    issueTransitionsResponse,
    issueTransitionsLoading,
    formik
  } = formContentProps
  const template = inputSetData?.template
  const path = inputSetData?.path
  const prefix = isEmpty(path) ? '' : `${path}.`
  const readonly = inputSetData?.readonly
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()
  const { CDS_JIRA_TRANSITION_LIST, NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const { getRBACErrorMessage } = useRBACError()
  const { expressions } = useVariablesExpression()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const [statusOptions, setStatusOptions] = useState<SelectOption[]>([])
  const connectorRefFixedValue =
    template?.spec?.connectorRef === EXECUTION_TIME_INPUT_VALUE
      ? formContentProps?.formik?.values?.spec?.connectorRef
      : getGenuineValue(initialValues.spec?.connectorRef || (inputSetData?.allValues?.spec?.connectorRef as string))

  const issueKeyFixedValue =
    template?.spec?.issueKey === EXECUTION_TIME_INPUT_VALUE
      ? formContentProps?.formik?.values?.spec?.issueKey
      : initialValues.spec?.issueKey || inputSetData?.allValues?.spec?.issueKey

  const issueTypeFixedValue =
    template?.spec?.issueType === EXECUTION_TIME_INPUT_VALUE
      ? formContentProps?.formik?.values?.spec?.issueType
      : initialValues.spec?.issueType || inputSetData?.allValues?.spec?.issueType

  const projectKeyFixedValue =
    template?.spec?.projectKey === EXECUTION_TIME_INPUT_VALUE
      ? formContentProps?.formik?.values?.spec?.projectKey
      : initialValues.spec?.projectKey || inputSetData?.allValues?.spec?.projectKey

  const [transitions, setTransitions] = useState<SelectOption[]>([])

  const [additionalFields, setAdditionalFields] = React.useState<JiraFieldNGWithValue[]>([])

  useEffect(() => {
    if (connectorRefFixedValue && issueKeyFixedValue) {
      refetchIssueUpdateMetadata({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString(),
          issueKey: issueKeyFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue, issueKeyFixedValue])

  useEffect(() => {
    // If connector value changes in form, fetch projects
    if (connectorRefFixedValue && !CDS_JIRA_TRANSITION_LIST) {
      refetchStatuses({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorRefFixedValue])

  useEffect(() => {
    // get status by connector ref response
    let options: SelectOption[] = []
    const statusResponseList: JiraStatusNG[] = statusResponse?.data || []
    options =
      statusResponseList.map((status: JiraStatusNG) => ({
        label: status.name || '',
        value: status.name || ''
      })) || []

    setStatusOptions(options)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusResponse?.data])

  useEffect(() => {
    // get status by connector ref response
    let transitionsData: SelectOption[] = []
    const issueTransitionsResponseList: JiraIssueTransitionNG[] = issueTransitionsResponse?.data || []
    transitionsData =
      issueTransitionsResponseList.map((transition: JiraIssueTransitionNG) => ({
        label: transition.name || '',
        value: transition.name || ''
      })) || []

    setTransitions(transitionsData)
  }, [issueTransitionsResponse?.data])

  useEffect(() => {
    if (issueKeyFixedValue && issueUpdateMetadataResponse?.data?.fields) {
      const issueUpdateMetadataFieldsObj = issueUpdateMetadataResponse!.data!.fields
      const selectedFieldsValue = initialValues.spec?.fields || inputSetData?.allValues?.spec?.fields

      const additionallyConfiguredJiraFields = selectedFieldsValue.map((fieldValueObj, _index) => {
        const fieldName = fieldValueObj.name
        let matchedField = {} as JiraFieldNG
        pickBy(issueUpdateMetadataFieldsObj, (fieldData, fieldKey) => {
          if (fieldKey === fieldName) {
            matchedField = fieldData
            if (matchedField) {
              const savedValueForThisField = getInitialValueForSelectedField(selectedFieldsValue, matchedField)
              set(
                formContentProps?.formik?.initialValues,
                `${prefix}spec.fields[${_index}].value`,
                !isEmpty(matchedField.allowedValues) && !savedValueForThisField ? [] : savedValueForThisField
              )
            }
          }
        })
        return matchedField
      })

      setAdditionalFields(additionallyConfiguredJiraFields as JiraFieldNGWithValue[])
    }
  }, [issueKeyFixedValue, issueUpdateMetadataResponse])

  const statusItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingStatuses} />
  ))

  const transitionItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={issueTransitionsLoading} />
  ))

  return (
    <React.Fragment>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <TimeoutFieldInputSetView
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
          label={getString('pipelineSteps.timeoutLabel')}
          className={css.deploymentViewFieldWidth}
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
            expressions,
            disabled: isApprovalStepFieldDisabled(readonly)
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          fieldPath="timeout"
          template={template}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME ? (
        <FormMultiTypeConnectorField
          name={`${prefix}spec.connectorRef`}
          label={getString('pipeline.jiraApprovalStep.connectorRef')}
          selected={(initialValues?.spec?.connectorRef as string) || ''}
          placeholder={getString('common.entityPlaceholderText')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={400}
          setRefValue
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeProps={{
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
            expressions
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          type={'Jira'}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          templateProps={{
            isTemplatizedView: true,
            templateValue: template?.spec?.connectorRef
          }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.issueKey) === MultiTypeInputType.RUNTIME ? (
        <TextFieldInputSetView
          label={getString('pipeline.jiraApprovalStep.issueKey')}
          className={css.deploymentViewFieldWidth}
          name={`${prefix}spec.issueKey`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          placeholder={getString('pipeline.jiraApprovalStep.issueKeyPlaceholder')}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={template}
          fieldPath="spec.issueKey"
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.transitionTo?.status) === MultiTypeInputType.RUNTIME ? (
        <FormInput.MultiTypeInput
          selectItems={
            fetchingStatuses
              ? [{ label: getString('pipeline.jiraUpdateStep.fetchingStatus'), value: '' }]
              : statusOptions
          }
          label={getString('status')}
          name={`${prefix}spec.transitionTo.status`}
          placeholder={
            fetchingStatuses
              ? getString('pipeline.jiraUpdateStep.fetchingStatus')
              : getString('pipeline.jiraUpdateStep.selectStatus')
          }
          useValue
          multiTypeInputProps={{
            width: 400,

            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
            selectProps: {
              addClearBtn: !readonly,
              itemRenderer: statusItemRenderer,
              allowCreatingNewItems: true,
              items: fetchingStatuses
                ? [{ label: getString('pipeline.jiraUpdateStep.fetchingStatus'), value: '' }]
                : statusOptions
            },
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              if (
                e?.target?.type !== 'text' ||
                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                !connectorRefFixedValue ||
                !CDS_JIRA_TRANSITION_LIST
              ) {
                return
              }
              refetchStatuses({
                queryParams: {
                  ...commonParams,
                  connectorRef: connectorRefFixedValue.toString(),
                  issueKey: issueKeyFixedValue,
                  issueType: issueTypeFixedValue as string,
                  projectKey: projectKeyFixedValue as string
                }
              })
            }
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.transitionTo?.transitionName) === MultiTypeInputType.RUNTIME ? (
        <FormInput.MultiTypeInput
          selectItems={
            issueTransitionsLoading
              ? [{ label: getString('pipeline.jiraUpdateStep.fetchingTransitions'), value: '' }]
              : transitions
          }
          label={getString('pipeline.jiraUpdateStep.transitionLabel')}
          name={`${prefix}spec.transitionTo.transitionName`}
          placeholder={getString('pipeline.jiraUpdateStep.transitionPlaceholder')}
          disabled={isApprovalStepFieldDisabled(readonly)}
          useValue
          multiTypeInputProps={{
            width: 400,
            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
            selectProps: {
              addClearBtn: !readonly,
              itemRenderer: transitionItemRenderer,
              allowCreatingNewItems: true,
              items: issueTransitionsLoading
                ? [{ label: getString('pipeline.jiraUpdateStep.fetchingTransitions'), value: '' }]
                : transitions
            },
            onChange: (value, _valueType, type) => {
              if (
                type === MultiTypeInputType.FIXED &&
                getMultiTypeFromValue(get(formik, `values.${prefix}spec?.transitionTo?.status`)) ===
                  MultiTypeInputType.FIXED
              ) {
                const transitionObj = issueTransitionsResponse?.data?.find(
                  obj => obj.name === ((value as SelectOption)?.value || value)
                )
                if (transitionObj) {
                  const targetStatus = statusOptions.find(status => status.value === transitionObj?.to?.name)
                  if (targetStatus) {
                    formik.setFieldValue(`${prefix}spec.transitionTo.status`, targetStatus?.value)
                  }
                }
              }
            },
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              if (
                e?.target?.type !== 'text' ||
                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                !connectorRefFixedValue ||
                getMultiTypeFromValue(issueKeyFixedValue) !== MultiTypeInputType.FIXED ||
                !CDS_JIRA_TRANSITION_LIST
              ) {
                return
              }
              refetchIssueTransitions({
                queryParams: {
                  ...commonParams,
                  connectorRef: connectorRefFixedValue.toString(),
                  issueKey: issueKeyFixedValue
                }
              })
            }
          }}
        />
      ) : null}

      {issueUpdateMetadataLoading ? (
        <PageSpinner message={getString('pipeline.jiraCreateStep.fetchingFields')} className={css.fetching} />
      ) : (
        <JiraFieldsRenderer
          fieldPrefix={prefix}
          deploymentMode
          selectedFields={additionalFields}
          readonly={readonly}
          formik={formContentProps?.formik}
          connectorRef={connectorRefFixedValue?.toString()}
          template={template}
        />
      )}
      {issueUpdateMetadataFetchError && (
        <FormError
          errorMessage={
            <Text
              lineClamp={1}
              width={350}
              margin={{ bottom: 'medium' }}
              intent={Intent.DANGER}
              tooltipProps={{ isDark: true, popoverClassName: css.tooltip }}
            >
              {getRBACErrorMessage(issueUpdateMetadataFetchError)}
            </Text>
          }
          name="issueUpdateMetadataDeploymentModeError"
        />
      )}
    </React.Fragment>
  )
}

export default function JiraUpdateDeploymentMode(props: JiraUpdateDeploymentModeProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const {
    refetch: refetchStatuses,
    data: statusResponse,
    error: statusFetchError,
    loading: fetchingStatuses
  } = useGetJiraStatuses({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const {
    refetch: refetchIssueUpdateMetadata,
    data: issueUpdateMetadataResponse,
    error: issueUpdateMetadataFetchError,
    loading: issueUpdateMetadataLoading
  } = useGetJiraIssueUpdateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: '',
      issueKey: ''
    },
    debounce: 1000
  })

  const {
    refetch: refetchIssueTransitions,
    data: issueTransitionsResponse,
    error: issueTransitionsFetchError,
    loading: issueTransitionsLoading
  } = useGetIssueTransitions({
    lazy: true,
    debounce: 300,
    queryParams: {
      ...commonParams,
      connectorRef: '',
      issueKey: ''
    }
  })

  return (
    <FormContent
      {...props}
      refetchStatuses={refetchStatuses}
      statusResponse={statusResponse}
      statusFetchError={statusFetchError}
      fetchingStatuses={fetchingStatuses}
      refetchIssueUpdateMetadata={refetchIssueUpdateMetadata}
      issueUpdateMetadataResponse={issueUpdateMetadataResponse}
      issueUpdateMetadataFetchError={issueUpdateMetadataFetchError}
      issueUpdateMetadataLoading={issueUpdateMetadataLoading}
      refetchIssueTransitions={refetchIssueTransitions}
      issueTransitionsResponse={issueTransitionsResponse}
      issueTransitionsFetchError={issueTransitionsFetchError}
      issueTransitionsLoading={issueTransitionsLoading}
    />
  )
}
