/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import { cloneDeep, defaultTo, isEmpty, set, unset, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Dialog, Intent } from '@blueprintjs/core'
import cx from 'classnames'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import {
  Accordion,
  FormError,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  PageSpinner,
  SelectOption,
  Text
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { IItemRendererProps } from '@blueprintjs/select'
import produce from 'immer'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  JiraFieldNG,
  JiraIssueTransitionNG,
  JiraProjectNG,
  JiraStatusNG,
  useGetIssueTransitions,
  useGetJiraIssueCreateMetadata,
  useGetJiraIssueUpdateMetadata,
  useGetJiraStatuses
} from 'services/cd-ng'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { JiraKVFieldsRenderer } from '@pipeline/components/PipelineSteps/Steps/JiraCreate/JiraKVFieldsRenderer'
import { useQueryParams } from '@common/hooks'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { isMultiTypeFixed } from '@common/utils/utils'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { ConnectorConfigureOptions } from '@platform/connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { getGenuineValue } from '../JiraApproval/helper'
import type { JiraCreateFieldType, JiraFieldNGWithValue } from '../JiraCreate/types'
import {
  getInitialValueForSelectedField,
  getIsCurrentFieldASelectedOptionalField,
  getKVFieldsToBeAddedInForm,
  getProcessedValueForNonKVField,
  getSelectedFieldsToBeAddedInForm,
  isRuntimeOrExpressionType
} from '../JiraCreate/helper'
import { JiraDynamicFieldsSelector } from '../JiraCreate/JiraDynamicFieldsSelector'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { JiraFieldsRenderer } from '../JiraCreate/JiraFieldsRenderer'
import type {
  JiraUpdateData,
  JiraUpdateFieldType,
  JiraUpdateFormContentInterface,
  JiraUpdateStepModeProps
} from './types'
import { processFormData } from './helper'

import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import { JiraProjectSelectOption } from '../JiraApproval/types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../JiraCreate/JiraCreate.module.scss'
function FormContent({
  formik,
  refetchStatuses,
  refetchProjectMetadata,
  refetchIssueMetadata,
  issueMetaResponse,
  fetchingStatuses,
  statusFetchError,
  statusResponse,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType,
  refetchIssueUpdateMetadata,
  issueUpdateMetadataResponse,
  issueUpdateMetadataFetchError,
  issueUpdateMetadataLoading,
  refetchIssueTransitions,
  issueTransitionsResponse,
  issueTransitionsLoading,
  fetchingIssueMetadata,
  fetchingProjectMetadata,
  projectMetaResponse,
  projectMetadataFetchError,
  issueMetadataFetchError
}: JiraUpdateFormContentInterface): JSX.Element {
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { CDS_JIRA_TRANSITION_LIST, NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const [issueMetadata, setIssueMetadata] = useState<JiraProjectNG>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [statusOptions, setStatusOptions] = useState<SelectOption[]>([])
  const [transitions, setTransitions] = useState<SelectOption[]>([])
  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)

  const issueKeyType = useRef<MultiTypeInputType>(getMultiTypeFromValue(formik.values.spec.issueKey))

  const issueKeyValue = formik.values.spec.issueKey
  const issueTypeValue = isMultiTypeFixed(getMultiTypeFromValue(formik.values.spec.issueType))
    ? formik.values.spec.issueType
    : ''
  const projectKeyValue = isMultiTypeFixed(getMultiTypeFromValue(formik.values.spec.projectKey))
    ? formik.values.spec.projectKey
    : ''

  const statusValue = isMultiTypeFixed(getMultiTypeFromValue(formik.values.spec?.transitionTo?.status))
    ? formik.values.spec?.transitionTo?.status
    : ''

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const projectKeyFixedValue =
    typeof formik.values.spec.projectKey === 'object'
      ? (formik.values.spec.projectKey as JiraProjectSelectOption).key
      : undefined
  const issueTypeFixedValue =
    typeof formik.values.spec.issueType === 'object'
      ? (formik.values.spec.issueType as JiraProjectSelectOption).key
      : undefined

  const jiraType = 'updateMode'
  useEffect(() => {
    if (connectorRefFixedValue && !CDS_JIRA_TRANSITION_LIST) {
      refetchStatuses({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    } else if (connectorRefFixedValue !== undefined) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      // This means we've cleared the value or marked runtime/expression
      // Flush the selected optional fields, and move everything to key value fields
      formik.setFieldValue('spec.selectedOptionalFields', [])
    }
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
    if (connectorRefFixedValue && issueKeyValue && issueKeyType.current === MultiTypeInputType.FIXED) {
      refetchIssueUpdateMetadata({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString(),
          issueKey: issueKeyValue
        }
      })
    }
  }, [connectorRefFixedValue, issueKeyValue])

  useEffect(() => {
    // If project value changes in form, fetch metadata
    if (connectorRefFixedValue && projectKeyFixedValue) {
      refetchProjectMetadata({
        queryParams: {
          ...commonParams,
          expand: 'projects.issuetypes',
          connectorRef: connectorRefFixedValue.toString(),
          projectKey: projectKeyFixedValue.toString()
        }
      })
    } else if (
      connectorRefFixedValue !== undefined &&
      projectKeyFixedValue !== undefined
      // isRuntimeOrExpressionType(projectValueType)
    ) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      // This means we've cleared the value or marked runtime/expression
      // Flush the selected optional and required fields, and move everything to key value fields
      // formik.setFieldValue('spec.fields', getKVFields(formik.values))
      formik.setFieldValue('spec.selectedRequiredFields', [])
      formik.setFieldValue('spec.selectedOptionalFields', [])
    }
  }, [projectKeyFixedValue])

  useEffect(() => {
    if (connectorRefFixedValue && projectKeyFixedValue && issueTypeFixedValue) {
      refetchIssueMetadata({
        queryParams: {
          ...commonParams,
          expand: 'projects.issuetypes.fields',
          connectorRef: connectorRefFixedValue.toString(),
          projectKey: projectKeyFixedValue.toString(),
          issueType: issueTypeFixedValue.toString()
        }
      })
    } else if (
      connectorRefFixedValue !== undefined &&
      projectKeyFixedValue !== undefined &&
      issueTypeFixedValue !== undefined
      // isRuntimeOrExpressionType(projectValueType)
    ) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      formik.setFieldValue('spec.selectedRequiredFields', [])
      formik.setFieldValue('spec.selectedOptionalFields', [])
    }
  }, [issueTypeFixedValue])

  useEffect(() => {
    // If issuetype changes in form, set status and field list
    if (issueTypeFixedValue && issueMetadata?.issuetypes[issueTypeFixedValue]?.fields) {
      const issueTypeData = issueMetadata?.issuetypes[issueTypeFixedValue]
      const fieldKeys = Object.keys(issueTypeData?.fields || {}).sort()
      const formikOptionalFields: JiraFieldNGWithValue[] = []
      const formikRequiredFields: JiraFieldNGWithValue[] = []
      fieldKeys.forEach(fieldKey => {
        const field = issueTypeData?.fields[fieldKey]
        if (field) {
          const savedValueForThisField = getInitialValueForSelectedField(formik.values.spec.fields, field)
          const isCurrentFieldASelectedOptionalField = getIsCurrentFieldASelectedOptionalField(
            formik.values.spec.fields,
            field
          )
          if (isCurrentFieldASelectedOptionalField) {
            formikOptionalFields.push({ ...field, value: savedValueForThisField })
          }
        }
      })
      formik.setFieldValue('spec.selectedRequiredFields', formikRequiredFields)
      formik.setFieldValue('spec.selectedOptionalFields', formikOptionalFields)
      const toBeUpdatedNonKVFields: JiraCreateFieldType[] = []
      const nonKVFields = [...formikOptionalFields, ...formikRequiredFields]

      nonKVFields.forEach(field =>
        toBeUpdatedNonKVFields.push({
          name: field.name,
          value: getProcessedValueForNonKVField(field)
        })
      )

      const toBeUpdatedKVFields = getKVFieldsToBeAddedInForm(
        formik.values.spec.fields,
        [],
        formikOptionalFields,
        formikRequiredFields
      )
      const allfields = [...toBeUpdatedNonKVFields, ...toBeUpdatedKVFields]

      formik.setFieldValue('spec.fields', allfields)
    } else if (issueTypeFixedValue !== undefined) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      // This means we've cleared the value or marked runtime/expression
      // Flush the selected additional fields, and move everything to key value fields
      // formik.setFieldValue('spec.fields', getKVFields(formik.values))
      formik.setFieldValue('spec.selectedRequiredFields', [])
      formik.setFieldValue('spec.selectedOptionalFields', [])
    }
  }, [issueTypeFixedValue, issueMetadata])

  useEffect(() => {
    if (projectKeyFixedValue && issueTypeFixedValue && issueMetaResponse?.data?.projects) {
      const issuesMD: JiraProjectNG = issueMetaResponse?.data?.projects[projectKeyFixedValue]
      setIssueMetadata(issuesMD)
    }
  }, [issueMetaResponse?.data])

  const isProjectIDAndIssueTypePresent = (): boolean => {
    if (issueKeyValue) {
      return true
    }
    if (
      getMultiTypeFromValue(formik.values?.spec?.issueKey) !== MultiTypeInputType.FIXED &&
      issueTypeFixedValue &&
      projectKeyFixedValue
    ) {
      return true
    }
    return false
  }

  useEffect(() => {
    // The below code utilises issue update metadata to figure out optional fields from Key value fields
    // to ensure they are rendered properly i.e. not as a key value pair field
    if (
      isProjectIDAndIssueTypePresent() &&
      !isEmpty(issueUpdateMetadataResponse?.data?.fields && formik.values.spec.fields)
    ) {
      const issueUpdateMetadataFieldsObj = issueUpdateMetadataResponse!.data!.fields
      const fieldKeys = Object.keys(issueUpdateMetadataFieldsObj).sort()
      const formikOptionalFields: JiraFieldNGWithValue[] = []
      fieldKeys.forEach(fieldKey => {
        const field = issueUpdateMetadataFieldsObj[fieldKey]
        if (field) {
          const savedValueForThisField = getInitialValueForSelectedField(formik.values.spec.fields, field)
          const isCurrentFieldASelectedOptionalField = getIsCurrentFieldASelectedOptionalField(
            formik.values.spec.fields,
            field
          )
          if (isCurrentFieldASelectedOptionalField) {
            formikOptionalFields.push({ ...field, value: savedValueForThisField })
          }
        }
      })
      formik.setFieldValue('spec.selectedOptionalFields', formikOptionalFields)

      const toBeUpdatedNonKVFields: JiraUpdateFieldType[] = []
      const nonKVFields = [...formikOptionalFields]

      nonKVFields.forEach(field =>
        toBeUpdatedNonKVFields.push({
          name: field.name,
          value: getProcessedValueForNonKVField(field)
        })
      )

      const toBeUpdatedKVFields = getKVFieldsToBeAddedInForm(formik.values.spec.fields, [], formikOptionalFields, [])
      const allfields = [...toBeUpdatedNonKVFields, ...toBeUpdatedKVFields]

      formik.setFieldValue('spec.fields', allfields)
    } else if (issueKeyValue !== undefined || isRuntimeOrExpressionType(issueKeyValue)) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      // This means we've cleared the value or marked it runtime/expression on which the optional fields depend
      formik.setFieldValue('spec.selectedOptionalFields', [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueKeyValue, issueUpdateMetadataResponse])

  const [showDynamicFieldsModal, hideDynamicFieldsModal] = useModalHook(() => {
    return (
      <Dialog
        className={css.addFieldsModal}
        isOpen
        onClose={hideDynamicFieldsModal}
        enforceFocus={false}
        title={getString('pipeline.jiraCreateStep.addFields')}
      >
        <JiraDynamicFieldsSelector
          refetchProjectMetadata={refetchProjectMetadata}
          refetchIssueMetadata={refetchIssueMetadata}
          fetchingIssueMetadata={fetchingIssueMetadata}
          fetchingProjectMetadata={fetchingProjectMetadata}
          projectMetaResponse={projectMetaResponse}
          issueMetaResponse={issueMetaResponse}
          issueMetadataFetchError={issueMetadataFetchError}
          projectMetadataFetchError={projectMetadataFetchError}
          refetchIssueUpdateMetadata={refetchIssueUpdateMetadata}
          issueUpdateMetadataResponse={issueUpdateMetadataResponse}
          issueUpdateMetadataFetchError={issueUpdateMetadataFetchError}
          issueUpdateMetadataLoading={issueUpdateMetadataLoading}
          connectorRef={connectorRefFixedValue || ''}
          selectedFields={formik.values.spec.selectedOptionalFields}
          selectedProjectKey={projectKeyFixedValue || ''}
          selectedIssueTypeKey={issueTypeFixedValue || ''}
          jiraType={jiraType}
          issueKey={issueKeyValue}
          issueKeyType={getMultiTypeFromValue(formik.values.spec.issueKey)}
          addSelectedFields={(
            fieldsToBeAdded: JiraFieldNG[],
            selectedProjectKey: string | undefined,
            selectedIssueTypeKey: string | undefined
          ) => {
            const formikValues = cloneDeep(formik.values)
            set(
              formikValues,
              'spec.selectedOptionalFields',
              getSelectedFieldsToBeAddedInForm(
                fieldsToBeAdded,
                formik.values.spec.selectedOptionalFields,
                formik.values.spec.fields
              )
            )
            if (
              selectedProjectKey &&
              selectedIssueTypeKey &&
              getMultiTypeFromValue(formik.values.spec.issueKey) !== MultiTypeInputType.FIXED
            ) {
              set(formikValues, 'spec.projectKey', selectedProjectKey)
              set(formikValues, 'spec.issueType', selectedIssueTypeKey)
            }
            formik.setValues(formikValues)
            hideDynamicFieldsModal()
          }}
          provideFieldList={(fields: JiraCreateFieldType[]) => {
            formik.setFieldValue(
              'spec.fields',
              getKVFieldsToBeAddedInForm(fields, formik.values.spec.fields, formik.values.spec.selectedOptionalFields)
            )
            hideDynamicFieldsModal()
          }}
          onCancel={hideDynamicFieldsModal}
        />
      </Dialog>
    )
  }, [
    connectorRefFixedValue,
    formik.values.spec.selectedOptionalFields,
    formik.values.spec.fields,
    formik.values.spec.issueKey,
    issueMetaResponse,
    issueUpdateMetadataResponse,
    projectMetaResponse,
    fetchingProjectMetadata,
    fetchingIssueMetadata
  ])

  function AddFieldsButton(): React.ReactElement {
    return (
      <Text
        onClick={() => {
          if (!isApprovalStepFieldDisabled(readonly)) {
            showDynamicFieldsModal()
          }
        }}
        style={{
          cursor: isApprovalStepFieldDisabled(readonly) ? 'not-allowed' : 'pointer'
        }}
        tooltipProps={{ dataTooltipId: 'jiraUpdateAddFields' }}
        intent="primary"
      >
        {getString('pipeline.jiraCreateStep.fieldSelectorAdd')}
      </Text>
    )
  }

  const statusItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingStatuses} />
  ))

  const transitionItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={issueTransitionsLoading} />
  ))

  return (
    <React.Fragment>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.InputWithIdentifier
            inputLabel={getString('name')}
            isIdentifierEditable={isNewStep}
            inputGroupProps={{
              placeholder: getString('pipeline.stepNamePlaceholder'),
              disabled: isApprovalStepFieldDisabled(readonly)
            }}
          />
        </div>
      )}

      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeDurationProps={{
            expressions,
            allowableTypes,
            enableConfigureOptions: true,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
        />
      </div>
      <div className={stepCss.divider} />
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeConnectorField
          name="spec.connectorRef"
          label={getString('pipeline.jiraApprovalStep.connectorRef')}
          className={css.connector}
          connectorLabelClass={css.connectorLabel}
          width={390}
          onChange={() => {
            formik.setFieldValue('spec.transitionTo.transitionName', '')
            formik.setFieldValue('spec.transitionTo.status', '')
          }}
          placeholder={getString('common.entityPlaceholderText')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ expressions, allowableTypes }}
          type="Jira"
          setRefValue
          enableConfigureOptions={false}
          selected={formik?.values?.spec.connectorRef as string}
          disabled={isApprovalStepFieldDisabled(readonly)}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
          <ConnectorConfigureOptions
            style={{ marginTop: 14 }}
            value={formik.values.spec.connectorRef as string}
            type="String"
            variableName="spec.connectorRef"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => formik.setFieldValue('spec.connectorRef', value)}
            isReadonly={readonly}
            connectorReferenceFieldProps={{
              accountIdentifier: accountId,
              projectIdentifier,
              orgIdentifier,
              type: 'Jira',
              label: getString('pipeline.jiraApprovalStep.connectorRef'),
              disabled: isApprovalStepFieldDisabled(readonly),
              gitScope: { repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }
            }}
          />
        )}
      </div>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          label={getString('pipeline.jiraApprovalStep.issueKey')}
          name="spec.issueKey"
          multiTextInputProps={{
            expressions,
            allowableTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          placeholder={getString('pipeline.jiraApprovalStep.issueKeyPlaceholder')}
          onChange={(value, _valueType, type) => {
            const formikValues = cloneDeep(formik.values)
            issueKeyType.current = type
            set(formikValues, 'spec.issueKey', value)
            unset(formikValues, 'spec.issueType')
            unset(formikValues, 'spec.projectKey')
            unset(formikValues, 'spec.fields')
            unset(formikValues, 'spec.selectedRequiredFields')
            unset(formikValues, 'spec.selectedOptionalFields')
            unset(formikValues, 'spec.transitionTo.transitionName')
            unset(formikValues, 'spec.transitionTo.status')
            formik.setValues(formikValues)
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
        />
        {getMultiTypeFromValue(formik.values.spec.issueKey) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.spec.issueKey as string}
            type="String"
            variableName="spec.issueKey"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => formik.setFieldValue('spec.issueKey', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <div className={stepCss.noLookDivider} />
      <Accordion activeId="" className={stepCss.accordion}>
        <Accordion.Panel
          id="optional-config"
          summary={getString('common.optionalConfig')}
          details={
            <div>
              <div key={`spec.transitionTo.status.${statusValue}`} className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTypeInput
                  selectItems={
                    fetchingStatuses
                      ? [{ label: getString('pipeline.jiraUpdateStep.fetchingStatus'), value: '' }]
                      : statusOptions
                  }
                  label={getString('status')}
                  name="spec.transitionTo.status"
                  placeholder={
                    fetchingStatuses
                      ? getString('pipeline.jiraUpdateStep.fetchingStatus')
                      : getString('pipeline.jiraUpdateStep.selectStatus')
                  }
                  useValue
                  multiTypeInputProps={{
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
                    defaultValue: statusValue as string,
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
                          issueKey: issueKeyValue,
                          issueType: issueTypeValue as string,
                          projectKey: projectKeyValue as string
                        }
                      })
                    }
                  }}
                  disabled={isApprovalStepFieldDisabled(readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.transitionTo?.status) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={statusOptions}
                    loading={fetchingStatuses}
                    value={formik.values.spec.transitionTo?.status as string}
                    type="String"
                    variableName="spec.transitionTo.status"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => formik.setFieldValue('spec.transitionTo.status', value)}
                    isReadonly={readonly}
                  />
                )}
              </div>

              {!fetchingStatuses && !statusFetchError && statusResponse && isEmpty(statusResponse?.data) ? (
                <div className={css.marginTop}>
                  <Text
                    lineClamp={1}
                    width={350}
                    margin={{ bottom: 'medium' }}
                    intent={Intent.WARNING}
                    icon={'warning-sign'}
                    tooltipProps={{ isDark: true, popoverClassName: css.tooltip }}
                  >
                    {getString('pipeline.jiraUpdateStep.statusDisclaimer')}
                  </Text>
                </div>
              ) : statusFetchError ? (
                <FormError
                  className={css.marginTop}
                  errorMessage={
                    <Text
                      lineClamp={1}
                      width={350}
                      margin={{ bottom: 'medium' }}
                      intent={Intent.DANGER}
                      tooltipProps={{ isDark: true, popoverClassName: css.tooltip }}
                    >
                      {getRBACErrorMessage(statusFetchError)}
                    </Text>
                  }
                  name="spec.projectKey"
                ></FormError>
              ) : null}

              <div
                key={`spec.transitionTo.transitionName.${statusValue}`}
                className={cx(stepCss.formGroup, stepCss.lg)}
              >
                <FormInput.MultiTypeInput
                  selectItems={
                    issueTransitionsLoading
                      ? [{ label: getString('pipeline.jiraUpdateStep.fetchingTransitions'), value: '' }]
                      : transitions
                  }
                  label={getString('pipeline.jiraUpdateStep.transitionLabel')}
                  name="spec.transitionTo.transitionName"
                  placeholder={getString('pipeline.jiraUpdateStep.transitionPlaceholder')}
                  disabled={isApprovalStepFieldDisabled(readonly)}
                  useValue
                  multiTypeInputProps={{
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
                        getMultiTypeFromValue(formik.values.spec?.transitionTo?.status) === MultiTypeInputType.FIXED
                      ) {
                        const transitionObj = issueTransitionsResponse?.data?.find(
                          obj => obj.name === ((value as SelectOption)?.value || value)
                        )
                        if (transitionObj) {
                          const targetStatus = statusOptions.find(status => status.value === transitionObj?.to?.name)
                          if (targetStatus) {
                            formik.setValues(
                              produce(formik.values, draft => {
                                set(draft, `spec.transitionTo.status`, targetStatus?.value)
                                set(
                                  draft,
                                  `spec.transitionTo.transitionName`,
                                  defaultTo((value as SelectOption)?.value, value)
                                )
                              })
                            )
                          }
                        }
                      }
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
                      refetchIssueTransitions({
                        queryParams: {
                          ...commonParams,
                          connectorRef: connectorRefFixedValue.toString(),
                          issueKey: issueKeyValue
                        }
                      })
                    }
                  }}
                />

                {getMultiTypeFromValue(formik.values.spec.transitionTo?.transitionName) ===
                  MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.spec.transitionTo?.transitionName as string}
                    type="String"
                    variableName="spec.transitionTo.transitionName"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => formik.setFieldValue('spec.transitionTo.transitionName', value)}
                    isReadonly={readonly}
                  />
                )}
              </div>

              <JiraFieldsRenderer
                selectedFields={formik.values.spec.selectedOptionalFields}
                readonly={readonly}
                onDelete={(index, selectedField) => {
                  const selectedFieldsAfterRemoval = formik.values.spec.selectedOptionalFields?.filter(
                    (_unused, i) => i !== index
                  )
                  formik.setFieldValue('spec.selectedOptionalFields', selectedFieldsAfterRemoval)
                  const customFields = formik.values.spec.fields?.filter(field => field.name !== selectedField.name)
                  formik.setFieldValue('spec.fields', customFields)
                }}
                connectorRef={defaultTo(connectorRefFixedValue, '')}
                formik={formik}
              />

              {issueUpdateMetadataLoading || fetchingIssueMetadata ? (
                <PageSpinner message={getString('pipeline.jiraCreateStep.fetchingFields')} className={css.fetching} />
              ) : !isEmpty(formik.values.spec.fields) ? (
                <JiraKVFieldsRenderer
                  formik={formik}
                  allowableTypes={allowableTypes}
                  selectedAllFields={formik.values.spec.fields}
                  selectedOptionalFields={formik.values.spec.selectedOptionalFields}
                  readonly={readonly}
                />
              ) : null}

              <AddFieldsButton />
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
                  name="issueUpdateMetadataError"
                />
              )}
            </div>
          }
        />
      </Accordion>
    </React.Fragment>
  )
}

function JiraUpdateStepMode(
  props: JiraUpdateStepModeProps,
  formikRef: StepFormikFowardRef<JiraUpdateData>
): JSX.Element {
  const { onUpdate, isNewStep, readonly, allowableTypes, onChange, stepViewType } = props
  const { getString } = useStrings()
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
    debounce: 300,
    queryParams: {
      ...commonParams,
      connectorRef: '',
      issueKey: ''
    }
  })

  const {
    refetch: refetchProjectMetadata,
    data: projectMetaResponse,
    error: projectMetadataFetchError,
    loading: fetchingProjectMetadata
  } = useGetJiraIssueCreateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      expand: '',
      connectorRef: '',
      projectKey: ''
    }
  })

  const {
    refetch: refetchIssueMetadata,
    data: issueMetaResponse,
    error: issueMetadataFetchError,
    loading: fetchingIssueMetadata
  } = useGetJiraIssueCreateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      expand: '',
      connectorRef: '',
      projectKey: '',
      issueType: ''
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
    <Formik<JiraUpdateData>
      onSubmit={values => onUpdate?.(processFormData(values))}
      formName="jiraUpdate"
      initialValues={props.initialValues}
      validate={data => {
        onChange?.(processFormData(data))
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.connectorRef')),
          issueKey: Yup.string().trim().required(getString('pipeline.jiraApprovalStep.validations.issueKey')),
          transitionTo: Yup.object().shape({
            status: Yup.string().when('transitionName', {
              is: val => val?.trim()?.length,
              then: Yup.string().required(getString('pipeline.jiraUpdateStep.validations.status'))
            })
          })
        })
      })}
    >
      {(formik: FormikProps<JiraUpdateData>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              refetchStatuses={refetchStatuses}
              fetchingStatuses={fetchingStatuses}
              refetchIssueUpdateMetadata={refetchIssueUpdateMetadata}
              issueUpdateMetadataResponse={issueUpdateMetadataResponse}
              issueUpdateMetadataFetchError={issueUpdateMetadataFetchError}
              issueUpdateMetadataLoading={issueUpdateMetadataLoading}
              refetchProjectMetadata={refetchProjectMetadata}
              refetchIssueMetadata={refetchIssueMetadata}
              fetchingProjectMetadata={fetchingProjectMetadata}
              projectMetaResponse={projectMetaResponse}
              fetchingIssueMetadata={fetchingIssueMetadata}
              issueMetaResponse={issueMetaResponse}
              issueMetadataFetchError={issueMetadataFetchError}
              projectMetadataFetchError={projectMetadataFetchError}
              statusResponse={statusResponse}
              statusFetchError={statusFetchError}
              isNewStep={isNewStep}
              readonly={readonly}
              refetchIssueTransitions={refetchIssueTransitions}
              issueTransitionsResponse={issueTransitionsResponse}
              issueTransitionsFetchError={issueTransitionsFetchError}
              issueTransitionsLoading={issueTransitionsLoading}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

const JiraUpdateStepModeWithRef = React.forwardRef(JiraUpdateStepMode)
export default JiraUpdateStepModeWithRef
