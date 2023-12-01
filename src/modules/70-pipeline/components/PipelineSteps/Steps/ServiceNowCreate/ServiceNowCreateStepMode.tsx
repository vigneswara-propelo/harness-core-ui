/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { debounce, defaultTo, get, isEmpty, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Dialog, Menu } from '@blueprintjs/core'
import cx from 'classnames'
import * as Yup from 'yup'
import { Color, Intent } from '@harness/design-system'

import { FieldArray, FormikProps } from 'formik'
import {
  AllowedTypes,
  Button,
  Container,
  FormError,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  PageSpinner,
  SelectOption,
  Text
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { IItemRendererProps, ItemListRenderer } from '@blueprintjs/select'
import produce from 'immer'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { String, StringKeys, useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  getServiceNowTemplateMetadataV2Promise,
  useGetServiceNowTemplateMetadata,
  ResponsePageServiceNowTemplate,
  ServiceNowFieldNG,
  ServiceNowTemplate,
  ServiceNowTicketTypeDTO,
  useGetServiceNowIssueMetadata,
  useGetServiceNowTicketTypesV2,
  useGetStandardTemplateReadOnlyFields
} from 'services/cd-ng'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ConnectorRefSchema } from '@common/utils/Validation'
import { FormMultiTypeTextAreaField } from '@common/components'
import { ServiceNowTemplateFieldsRenderer } from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/ServiceNowTemplateFieldRenderer'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { ConnectorConfigureOptions } from '@platform/connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { Connectors } from '@platform/connectors/constants'
import { useInfiniteScroll } from '@common/hooks/useInfiniteScroll'
import type { ServiceNowTicketTypeSelectOption } from '../ServiceNowApproval/types'
import { getGenuineValue } from '../ServiceNowApproval/helper'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { ServiceNowDynamicFieldsSelector } from './ServiceNowDynamicFieldsSelector'
import {
  ServiceNowCreateData,
  ServiceNowCreateFieldType,
  ServiceNowCreateFormContentInterface,
  ServiceNowCreateStepModeProps,
  ServiceNowFieldNGWithValue,
  TEMPLATE_TYPE,
  FieldType,
  ServiceNowStaticFields,
  SERVICENOW_TYPE
} from './types'
import {
  convertTemplateFieldsForDisplay,
  getInitialValueForSelectedField,
  getKVFieldsToBeAddedInForm,
  getSelectedFieldsToBeAddedInForm,
  processFormData,
  resetForm
} from './helper'
import { ServiceNowFieldsRenderer } from './ServiceNowFieldsRenderer'
import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ServiceNowCreate.module.scss'
const fetchingTicketTypesPlaceholder: StringKeys = 'pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder'
function FormContent({
  formik,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType,
  serviceNowTicketTypesQuery,
  serviceNowIssueCreateMetadataQuery,
  serviceNowReadOnlyFieldsQuery,
  serviceNowTemplateMetaDataQuery
}: ServiceNowCreateFormContentInterface): JSX.Element {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [ticketFieldList, setTicketFieldList] = useState<ServiceNowFieldNG[]>([])
  const [count, setCount] = React.useState(0)
  const [serviceNowTicketTypesOptions, setServiceNowTicketTypesOptions] = useState<ServiceNowTicketTypeSelectOption[]>(
    []
  )
  const [isTemplateSectionAvailable, setIsTemplateSectionAvailable] = useState<boolean>(false)
  const [templateName, setTemplateName] = useState<string>(formik.values.spec.templateName || '')
  const { CDS_GET_SERVICENOW_STANDARD_TEMPLATE } = useFeatureFlags()
  const [fetchingReadonlyFields, setFetchingReadonlyFields] = useState<boolean>(false)
  const pageSize = useRef(12)
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined)
  const debouncedSetSearchTerm = debounce(val => {
    formik.setFieldValue('spec.templateName', '')
    setSearchTerm(val)
  }, 1000)
  const loadMoreRef = useRef(null)
  const [connectorValueType, setConnectorValueType] = useState<MultiTypeInputType>(MultiTypeInputType.FIXED)
  const [ticketValueType, setTicketValueType] = useState<MultiTypeInputType>(MultiTypeInputType.FIXED)
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)
  const ticketTypeKeyFixedValue =
    getMultiTypeFromValue(formik.values.spec.ticketType) === MultiTypeInputType.FIXED &&
    !isEmpty(formik.values.spec.ticketType)
      ? formik.values.spec.ticketType
      : undefined
  const serviceNowType = 'createMode'

  const [templates, setTemplates] = useState<SelectOption[]>([])
  const [isFetchingTemplateNextTime, setIsFetchingTemplateNextTime] = useState(true)
  const fieldType = getGenuineValue(get(formik, 'values.spec.fieldType'))
  const selectedTemplateName = get(formik, 'values.spec.templateName')
  const {
    items: templateResponse,
    error: fetchTemplateError,
    fetching: fetchingTemplate,
    attachRefToLastElement,
    offsetToFetch,
    reset
  } = useInfiniteScroll({
    getItems: options => {
      if (
        connectorRefFixedValue &&
        connectorValueType === MultiTypeInputType.FIXED &&
        ticketTypeKeyFixedValue &&
        ticketValueType === MultiTypeInputType.FIXED
      ) {
        return getServiceNowTemplateMetadataV2Promise({
          queryParams: {
            ...commonParams,
            connectorRef: defaultTo(connectorRefFixedValue?.toString(), ''),
            ticketType: ticketTypeKeyFixedValue?.toString(),
            templateType:
              fieldType === FieldType.CreateFromStandardTemplate ? TEMPLATE_TYPE.STANDARD : TEMPLATE_TYPE.FORM,
            size: options.limit,
            page: options.offset,
            searchTerm: searchTerm
          }
        })
      }
      return Promise.resolve(null)
    },
    limit: pageSize.current,
    loadMoreRef,
    searchTerm
  })

  useEffect(() => {
    setIsFetchingTemplateNextTime(fetchingTemplate && offsetToFetch.current > 0)
  }, [fetchingTemplate, offsetToFetch.current])

  const isEmptyContent = useMemo(() => {
    return !fetchingTemplate && !fetchTemplateError && isEmpty(templateResponse)
  }, [fetchingTemplate, fetchTemplateError, templateResponse])

  const isTicketTypeChangeRequest =
    (get(formik, 'values.spec.ticketType') as string)?.toLowerCase() === 'change_request'

  useEffect(() => {
    if (connectorRefFixedValue && connectorValueType === MultiTypeInputType.FIXED) {
      if (
        CDS_GET_SERVICENOW_STANDARD_TEMPLATE &&
        formik.values?.spec?.fieldType === FieldType.CreateFromStandardTemplate
      ) {
        serviceNowReadOnlyFieldsQuery?.refetch({
          queryParams: {
            ...commonParams,
            connectorRef: connectorRefFixedValue.toString()
          }
        })
      }
      serviceNowTicketTypesQuery.refetch({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    } else if (connectorRefFixedValue !== undefined) {
      formik.setFieldValue('spec.selectedFields', [])
      setTicketFieldList([])
    }
  }, [connectorRefFixedValue])

  useEffect(() => {
    // Set ticket types
    let options: ServiceNowTicketTypeSelectOption[] = []
    const ticketTypesResponseList: ServiceNowTicketTypeDTO[] = serviceNowTicketTypesQuery.data?.data || []
    options = ticketTypesResponseList.map((ticketType: ServiceNowTicketTypeDTO) => ({
      label: defaultTo(ticketType.name, ''),
      value: defaultTo(ticketType.key, ''),
      key: defaultTo(ticketType.key, '')
    }))
    setServiceNowTicketTypesOptions(options)
  }, [serviceNowTicketTypesQuery.data?.data])

  useEffect(() => {
    if (
      connectorRefFixedValue &&
      connectorValueType === MultiTypeInputType.FIXED &&
      ticketTypeKeyFixedValue &&
      ticketValueType === MultiTypeInputType.FIXED &&
      fieldType !== FieldType.ConfigureFields
    ) {
      if (CDS_GET_SERVICENOW_STANDARD_TEMPLATE) {
        reset()
      } else if (getMultiTypeFromValue(templateName) === MultiTypeInputType.FIXED) {
        serviceNowTemplateMetaDataQuery.refetch({
          queryParams: {
            ...commonParams,
            connectorRef: connectorRefFixedValue.toString(),
            ticketType: ticketTypeKeyFixedValue.toString(),
            templateName: templateName || '',
            limit: 1,
            offset: 0
          }
        })
      }
    }
  }, [connectorRefFixedValue, ticketTypeKeyFixedValue, fieldType, templateName])

  useDeepCompareEffect(() => {
    if (connectorRefFixedValue && ticketTypeKeyFixedValue && ticketValueType === MultiTypeInputType.FIXED) {
      serviceNowIssueCreateMetadataQuery.refetch({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString(),
          ticketType: ticketTypeKeyFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue, ticketTypeKeyFixedValue])

  useEffect(() => {
    const formikSelectedFields: ServiceNowFieldNGWithValue[] = []
    if (ticketTypeKeyFixedValue) {
      setTicketFieldList(serviceNowIssueCreateMetadataQuery.data?.data || [])
      if (formik.values.spec.fields && serviceNowIssueCreateMetadataQuery.data?.data) {
        serviceNowIssueCreateMetadataQuery.data?.data.forEach(field => {
          if (
            field &&
            field.key !== ServiceNowStaticFields.short_description &&
            field.key !== ServiceNowStaticFields.description
          ) {
            const savedValueForThisField = getInitialValueForSelectedField(formik.values.spec.fields, field)
            if (savedValueForThisField) {
              formikSelectedFields.push({ ...field, value: savedValueForThisField })
            } else if (field.required) {
              formikSelectedFields.push({ ...field, value: '' })
            }
          }
        })

        formik.setFieldValue('spec.selectedFields', formikSelectedFields)
        const toBeUpdatedKVFields = getKVFieldsToBeAddedInForm(formik.values.spec.fields, [], formikSelectedFields)
        formik.setFieldValue('spec.fields', toBeUpdatedKVFields)
      } else if (ticketTypeKeyFixedValue !== undefined) {
        // Undefined check is needed so that form is not set to dirty as soon as we open
        // This means we've cleared the value or marked runtime/expression
        // Flush the selected additional fields, and move everything to key value fields
        // formik.setFieldValue('spec.fields', getKVFields(formik.values))
        formik.setFieldValue('spec.selectedFields', [])
        setTicketFieldList([])
      }
    }
  }, [serviceNowIssueCreateMetadataQuery.data?.data])

  useEffect(() => {
    setIsTemplateSectionAvailable(true)
    if (templateResponse && CDS_GET_SERVICENOW_STANDARD_TEMPLATE) {
      const convertedTemplateResponse = templateResponse.map((item: ServiceNowTemplate) => {
        return {
          label: item.name,
          value: item.name
        }
      })
      setTemplates(convertedTemplateResponse)

      if (
        fieldType === FieldType.CreateFromStandardTemplate &&
        getMultiTypeFromValue(selectedTemplateName) === MultiTypeInputType.FIXED &&
        selectedTemplateName.length > 0 &&
        (serviceNowReadOnlyFieldsQuery?.data?.data || serviceNowReadOnlyFieldsQuery?.error)
      ) {
        setFetchingReadonlyFields(true)
        getServiceNowTemplateMetadataV2Promise({
          queryParams: {
            ...commonParams,
            connectorRef: defaultTo(connectorRefFixedValue?.toString(), ''),
            ticketType: ticketTypeKeyFixedValue?.toString() || 'change_request',
            templateType: TEMPLATE_TYPE.STANDARD,
            templateName: selectedTemplateName,
            size: 1,
            page: 0,
            searchTerm: searchTerm
          }
        })
          .then((response: ResponsePageServiceNowTemplate) => {
            if (response?.data?.content?.length) {
              const convertedSelectedTemplateValue = convertTemplateFieldsForDisplay(
                response?.data?.content?.[0]?.fields || {}
              )
              const editableFields = convertedSelectedTemplateValue
                .filter(
                  field =>
                    field.displayValue && !serviceNowReadOnlyFieldsQuery?.data?.data?.includes(field.displayValue)
                )
                ?.map(field => {
                  const editedField: ServiceNowCreateFieldType = get(formik, 'values.spec.fields')?.find(
                    (specField: ServiceNowCreateFieldType) => specField.name === field.displayValue
                  )
                  return {
                    ...field,
                    value: defaultTo(editedField?.value, field.value)
                  }
                })
              formik.setFieldValue('spec.templateFields', convertedSelectedTemplateValue)
              formik.setFieldValue('spec.editableFields', editableFields)
            } else {
              formik.setFieldValue('spec.templateFields', [])
              formik.setFieldValue('spec.editableFields', [])
            }
          })
          .finally(() => {
            setFetchingReadonlyFields(false)
          })
      }
      if (templateResponse.length > 0 && selectedTemplateName) {
        const selectedTemplateValue = templateResponse?.find(
          (item: ServiceNowTemplate) => item.name === selectedTemplateName
        )
        if (selectedTemplateValue) {
          const convertedSelectedTemplateValue = convertTemplateFieldsForDisplay(selectedTemplateValue.fields || {})
          const editableFields = convertedSelectedTemplateValue.filter(
            field => field.displayValue && !serviceNowReadOnlyFieldsQuery?.data?.data?.includes(field.displayValue)
          )
          formik.setFieldValue('spec.templateFields', convertedSelectedTemplateValue)
          formik.setFieldValue('spec.editableFields', editableFields)
        }
      } else {
        formik.setFieldValue('spec.templateFields', [])
        formik.setFieldValue('spec.editableFields', [])
      }
    }
  }, [templateResponse, serviceNowReadOnlyFieldsQuery?.data?.data])

  useEffect(() => {
    if (
      !CDS_GET_SERVICENOW_STANDARD_TEMPLATE &&
      serviceNowTemplateMetaDataQuery.data &&
      serviceNowTemplateMetaDataQuery.data.data
    ) {
      setIsTemplateSectionAvailable(true)
      if (
        serviceNowTemplateMetaDataQuery.data &&
        serviceNowTemplateMetaDataQuery.data?.data?.length > 0 &&
        templateName
      ) {
        formik.setFieldValue(
          'spec.templateFields',
          convertTemplateFieldsForDisplay(serviceNowTemplateMetaDataQuery.data.data[0].fields)
        )
      } else {
        formik.setFieldValue('spec.templateFields', [])
      }
    }
  }, [serviceNowTemplateMetaDataQuery.data?.data, CDS_GET_SERVICENOW_STANDARD_TEMPLATE])

  useEffect(() => {
    // Clear field list to be displayed under dynamic field selector or template section, if fixed ticket type is not chosen
    if (ticketValueType !== MultiTypeInputType.FIXED) {
      formik.setFieldValue('spec.selectedFields', [])
      formik.setFieldValue('spec.templateFields', [])
      formik.setFieldValue('spec.templateName', '')
      if (CDS_GET_SERVICENOW_STANDARD_TEMPLATE) {
        formik.setFieldValue('spec.editableFields', '')
      }
      setTicketFieldList([])
    }
  }, [ticketValueType])

  useEffect(() => {
    formik.setFieldValue('spec.isStandardTemplateEnabled', CDS_GET_SERVICENOW_STANDARD_TEMPLATE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [showDynamicFieldsModal, hideDynamicFieldsModal] = useModalHook(() => {
    return (
      <Dialog
        className={css.addFieldsModal}
        enforceFocus={false}
        isOpen
        onClose={hideDynamicFieldsModal}
        title={getString('pipeline.serviceNowCreateStep.addFields')}
      >
        <ServiceNowDynamicFieldsSelector
          connectorRef={connectorRefFixedValue || ''}
          selectedTicketTypeKey={ticketTypeKeyFixedValue?.toString() || ''}
          serviceNowType={serviceNowType}
          ticketTypeBasedFieldList={ticketFieldList}
          selectedFields={formik.values.spec.selectedFields}
          addSelectedFields={(fieldsToBeAdded: ServiceNowFieldNG[]) => {
            formik.setFieldValue(
              'spec.selectedFields',
              getSelectedFieldsToBeAddedInForm(
                fieldsToBeAdded,
                formik.values.spec.selectedFields || [],
                formik.values.spec.fields
              )
            )
            hideDynamicFieldsModal()
          }}
          provideFieldList={(fields: ServiceNowCreateFieldType[]) => {
            formik.setFieldValue(
              'spec.fields',
              getKVFieldsToBeAddedInForm(fields, formik.values.spec.fields, formik.values.spec.selectedFields)
            )
            hideDynamicFieldsModal()
          }}
          onCancel={hideDynamicFieldsModal}
        />
      </Dialog>
    )
  }, [connectorRefFixedValue, formik.values.spec.selectedFields, formik.values.spec.fields])

  const ticketTypesLoading = serviceNowTicketTypesQuery.loading
  const ticketTypesFetchError = defaultTo(
    (serviceNowTicketTypesQuery?.error?.data as Error)?.message,
    serviceNowTicketTypesQuery?.error?.message
  )

  const shouldShowTicketTypesError = !ticketTypesLoading && !isEmpty(ticketTypesFetchError)

  const templateErrorString = defaultTo(
    (serviceNowTemplateMetaDataQuery?.error?.data as Error)?.message,
    serviceNowTemplateMetaDataQuery?.error?.message
  )

  const istemplateErrorString = CDS_GET_SERVICENOW_STANDARD_TEMPLATE
    ? !fetchingTemplate && !isEmpty(fetchTemplateError)
    : !serviceNowTemplateMetaDataQuery.loading && !isEmpty(templateErrorString)

  const serviceItemRenderer = (item: SelectOption, itemProps: IItemRendererProps) => {
    const { handleClick, index } = itemProps
    return (
      <div ref={attachRefToLastElement(defaultTo(index, 0)) ? loadMoreRef : undefined} key={item.label.toString()}>
        <Menu.Item
          text={
            <Layout.Horizontal spacing="small">
              <Text>{item.label}</Text>
            </Layout.Horizontal>
          }
          disabled={fetchingTemplate}
          onClick={handleClick}
        />
      </div>
    )
  }

  const itemListRenderer: ItemListRenderer<SelectOption> = itemListProps => (
    <Menu>
      {isEmptyContent ? (
        <Layout.Vertical flex={{ align: 'center-center' }} width={'100%'} height={'100%'}>
          {getString('pipeline.noTemplateAvailable')}
          {searchTerm && (
            <Text
              padding={{ top: 'medium', bottom: 'medium' }}
              icon="plus"
              style={{ cursor: 'pointer' }}
              iconProps={{ color: Color.PRIMARY_7 }}
              color={Color.PRIMARY_7}
              onClick={() => {
                formik.setFieldValue('spec.templateName', searchTerm)
              }}
            >
              {searchTerm}
            </Text>
          )}
        </Layout.Vertical>
      ) : (
        itemListProps.items.map((item, i) => itemListProps.renderItem(item, i))
      )}
      {isFetchingTemplateNextTime && (
        <Container padding={'large'}>
          <Text icon="loading" iconProps={{ size: 20 }} font={{ align: 'center' }}>
            {getString('pipeline.fetchNextTemplates')}
          </Text>
        </Container>
      )}
    </Menu>
  )

  const getTemplates = () => {
    if (fetchingTemplate && !isFetchingTemplateNextTime) {
      return [{ label: 'Loading Templates...', value: 'Loading Templates...' }]
    }
    return defaultTo(templates, [])
  }

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
            enableConfigureOptions: true
          }}
        />
      </div>

      <div className={stepCss.divider} />

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeConnectorField
          name="spec.connectorRef"
          label={getString('pipeline.serviceNowApprovalStep.connectorRef')}
          className={css.connector}
          connectorLabelClass={css.connectorLabel}
          width={390}
          placeholder={getString('select')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ expressions, allowableTypes }}
          type="ServiceNow"
          setRefValue
          enableConfigureOptions={false}
          selected={formik?.values?.spec.connectorRef as string}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(value: any, _unused, multiType) => {
            // Clear dependent fields
            setConnectorValueType(multiType)
            if (value?.record?.identifier !== connectorRefFixedValue) {
              resetForm(formik, 'connectorRef')
              setCount(count + 1)
              if (multiType !== MultiTypeInputType.FIXED) {
                setServiceNowTicketTypesOptions([])
              }
            }
          }}
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
              type: Connectors.SERVICE_NOW,
              label: getString('pipeline.serviceNowApprovalStep.connectorRef'),
              disabled: isApprovalStepFieldDisabled(readonly),
              gitScope: { repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }
            }}
          />
        )}
      </div>
      <React.Fragment key={count}>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.MultiTypeInput
            tooltipProps={{
              dataTooltipId: 'serviceNowApprovalTicketType'
            }}
            selectItems={
              ticketTypesLoading
                ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
                : serviceNowTicketTypesOptions
            }
            label={getString('pipeline.serviceNowApprovalStep.ticketType')}
            name="spec.ticketType"
            placeholder={
              ticketTypesLoading
                ? getString(fetchingTicketTypesPlaceholder)
                : serviceNowTicketTypesQuery?.error?.message || getString('select')
            }
            helperText={
              shouldShowTicketTypesError ? (
                <FormError name={'serviceNowTicketType'} errorMessage={ticketTypesFetchError} />
              ) : undefined
            }
            intent={shouldShowTicketTypesError ? Intent.DANGER : Intent.NONE}
            useValue
            disabled={isApprovalStepFieldDisabled(readonly, ticketTypesLoading)}
            multiTypeInputProps={{
              selectProps: {
                addClearBtn: true,
                allowCreatingNewItems: true,
                items: ticketTypesLoading
                  ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
                  : serviceNowTicketTypesOptions
              },
              allowableTypes,
              expressions,
              onChange: (value: unknown, _valueType, type) => {
                setTicketValueType(type)
                // Clear dependent fields
                if (
                  type === MultiTypeInputType.FIXED &&
                  !isEmpty(value) &&
                  (value as ServiceNowTicketTypeSelectOption) !== ticketTypeKeyFixedValue
                ) {
                  resetForm(formik, 'ticketType')
                  setCount(count + 1)
                }
                if (
                  formik.values.spec.fieldType === FieldType.CreateFromStandardTemplate &&
                  value !== 'change_request'
                ) {
                  formik.setFieldValue('spec.fieldType', FieldType.ConfigureFields)
                }
              }
            }}
          />
        </div>
        <div className={stepCss.noLookDivider} />
      </React.Fragment>
      <div className={stepCss.divider} />
      <React.Fragment>
        <FormInput.RadioGroup
          disabled={isApprovalStepFieldDisabled(readonly)}
          radioGroup={{ inline: true }}
          name="spec.fieldType"
          items={[
            {
              label: getString('pipeline.serviceNowCreateStep.fieldType.configureFields'),
              value: FieldType.ConfigureFields
            },
            {
              label: getString('pipeline.serviceNowCreateStep.fieldType.createFromTemplate'),
              value: FieldType.CreateFromTemplate,
              disabled: !isTemplateSectionAvailable
            },

            ...(isTicketTypeChangeRequest && CDS_GET_SERVICENOW_STANDARD_TEMPLATE
              ? [
                  {
                    label: getString('pipeline.serviceNowCreateStep.fieldType.createFromStandardTemplate'),
                    value: FieldType.CreateFromStandardTemplate,
                    disabled: !isTemplateSectionAvailable
                  }
                ]
              : [])
          ]}
          onChange={event => {
            if (
              event.currentTarget.value === FieldType.CreateFromStandardTemplate &&
              !serviceNowReadOnlyFieldsQuery?.data?.data &&
              connectorRefFixedValue
            ) {
              serviceNowReadOnlyFieldsQuery?.refetch({
                queryParams: {
                  ...commonParams,
                  connectorRef: connectorRefFixedValue.toString()
                }
              })
            }
            formik.setValues(
              produce(formik.values, draft => {
                if (CDS_GET_SERVICENOW_STANDARD_TEMPLATE) {
                  set(draft, 'spec.editableFields', [])
                  if (event.currentTarget.value === FieldType.CreateFromTemplate) {
                    set(draft, 'spec.createType', TEMPLATE_TYPE.FORM)
                  } else if (event.currentTarget.value === FieldType.CreateFromStandardTemplate) {
                    set(draft, 'spec.createType', TEMPLATE_TYPE.STANDARD)
                  } else {
                    set(draft, 'spec.createType', TEMPLATE_TYPE.NORMAL)
                  }
                } else {
                  if (event.currentTarget.value === FieldType.CreateFromTemplate) {
                    set(draft, 'spec.useServiceNowTemplate', true)
                  } else {
                    set(draft, 'spec.useServiceNowTemplate', false)
                  }
                }
                set(draft, 'spec.templateName', '')
                set(draft, 'spec.templateFields', [])
                set(draft, 'spec.selectedFields', [])
                set(draft, 'spec.fieldType', event.currentTarget.value)
              })
            )
          }}
        />
        {formik.values.spec.fieldType === FieldType.ConfigureFields && (
          <div key={formik.values.spec.fieldType}>
            {serviceNowIssueCreateMetadataQuery.loading ? (
              <PageSpinner
                message={getString('pipeline.serviceNowCreateStep.fetchingFields')}
                className={css.fetching}
              />
            ) : (
              <>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormMultiTypeTextAreaField
                    label={getString('description')}
                    name="spec.description"
                    placeholder={getString('pipeline.serviceNowCreateStep.descriptionPlaceholder')}
                    multiTypeTextArea={{ enableConfigureOptions: false, expressions, allowableTypes }}
                    disabled={isApprovalStepFieldDisabled(readonly)}
                  />
                  {getMultiTypeFromValue(formik.values.spec.description) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={formik.values.spec.description || ''}
                      type="String"
                      variableName="spec.description"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('spec.description', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormMultiTypeTextAreaField
                    label={getString('pipeline.serviceNowCreateStep.shortDescription')}
                    name="spec.shortDescription"
                    placeholder={getString('pipeline.serviceNowCreateStep.shortDescriptionPlaceholder')}
                    multiTypeTextArea={{ enableConfigureOptions: false, expressions, allowableTypes }}
                    disabled={isApprovalStepFieldDisabled(readonly)}
                  />
                  {getMultiTypeFromValue(formik.values.spec.shortDescription) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={formik.values.spec.shortDescription || ''}
                      type="String"
                      variableName="spec.shortDescription"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('spec.shortDescription', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
                <ServiceNowFieldsRenderer
                  selectedFields={formik.values.spec.selectedFields}
                  readonly={readonly}
                  onDelete={(index, selectedField) => {
                    const selectedFieldsAfterRemoval = formik.values.spec.selectedFields?.filter(
                      (_unused, i) => i !== index
                    )
                    formik.setFieldValue('spec.selectedFields', selectedFieldsAfterRemoval)
                    const customFields = formik.values.spec.fields?.filter(field => field.name !== selectedField.name)
                    formik.setFieldValue('spec.fields', customFields)
                  }}
                  serviceNowType={SERVICENOW_TYPE.CREATE}
                  allowableTypes={allowableTypes}
                />

                {!isEmpty(formik.values.spec.fields) ? (
                  <FieldArray
                    name="spec.fields"
                    render={({ remove }) => {
                      return (
                        <div>
                          <div className={css.headerRow}>
                            <String className={css.label} stringID="keyLabel" />
                            <String className={css.label} stringID="valueLabel" />
                          </div>
                          {formik.values.spec.fields?.map((_unused: ServiceNowCreateFieldType, i: number) => (
                            <div className={css.headerRow} key={i}>
                              <FormInput.Text
                                name={`spec.fields[${i}].name`}
                                disabled={isApprovalStepFieldDisabled(readonly)}
                                placeholder={getString('pipeline.keyPlaceholder')}
                              />
                              <FormInput.MultiTextInput
                                name={`spec.fields[${i}].value`}
                                label=""
                                placeholder={getString('common.valuePlaceholder')}
                                disabled={isApprovalStepFieldDisabled(readonly)}
                                multiTextInputProps={{
                                  allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                                    item => !isMultiTypeRuntime(item)
                                  ) as AllowedTypes,
                                  expressions
                                }}
                              />
                              <Button
                                minimal
                                icon="main-trash"
                                disabled={isApprovalStepFieldDisabled(readonly)}
                                data-testid={`remove-fieldList-${i}`}
                                onClick={() => remove(i)}
                              />
                            </div>
                          ))}
                        </div>
                      )
                    }}
                  />
                ) : null}
              </>
            )}
            <Text
              onClick={() => {
                if (!isApprovalStepFieldDisabled(readonly)) {
                  showDynamicFieldsModal()
                }
              }}
              style={{
                cursor: isApprovalStepFieldDisabled(readonly) ? 'not-allowed' : 'pointer'
              }}
              tooltipProps={{ dataTooltipId: 'serviceNowCreateAddFields' }}
              intent="primary"
            >
              {getString('pipeline.jiraCreateStep.fieldSelectorAdd')}
            </Text>
          </div>
        )}
        {formik.values.spec.fieldType === FieldType.CreateFromTemplate && (
          <div>
            {serviceNowTemplateMetaDataQuery?.loading ? (
              <PageSpinner
                message={getString('pipeline.serviceNowCreateStep.fetchingFields')}
                className={css.fetching}
              />
            ) : (
              <div>
                {CDS_GET_SERVICENOW_STANDARD_TEMPLATE ? (
                  <div>
                    <div className={cx(stepCss.formGroup, stepCss.lg)}>
                      <FormInput.MultiTypeInput
                        selectItems={getTemplates()}
                        label={getString('pipeline.serviceNowCreateStep.templateName')}
                        name={`spec.templateName`}
                        key={FieldType.CreateFromTemplate}
                        placeholder={
                          selectedTemplateName ? selectedTemplateName : getString('pipeline.filters.servicePlaceholder')
                        }
                        useValue
                        multiTypeInputProps={{
                          onChange: (value, _valueType, type) => {
                            formik.setValues(
                              produce(formik.values, draft => {
                                if (type === MultiTypeInputType.FIXED) {
                                  const selectedTemplateValue = templateResponse?.find(
                                    (item: ServiceNowTemplate) => item.name === (value as SelectOption)?.value
                                  )
                                  if (selectedTemplateValue) {
                                    set(
                                      draft,
                                      `spec.templateFields`,
                                      convertTemplateFieldsForDisplay(selectedTemplateValue.fields)
                                    )
                                  }
                                } else {
                                  set(draft, `spec.templateFields`, [])
                                  set(draft, `spec.editableFields`, [])
                                }
                                set(draft, `spec.templateName`, defaultTo((value as SelectOption)?.value, value))
                              })
                            )
                          },
                          onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('spec.build', type),
                          expressions,
                          selectProps: {
                            onQueryChange: query => {
                              if (query) debouncedSetSearchTerm?.(query)
                            },
                            allowCreatingNewItems: !fetchingTemplate && !templates.length,
                            items: defaultTo(getTemplates(), []),
                            loadingItems: fetchingTemplate,
                            itemRenderer: serviceItemRenderer,

                            itemListRenderer,
                            noResults: (
                              <Text lineClamp={1} width={384} margin="small">
                                {getString('common.filters.noResultsFound')}
                              </Text>
                            )
                          },
                          allowableTypes
                        }}
                      />
                      {getMultiTypeFromValue(formik.values.spec.templateName) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={formik.values.spec.templateName || ''}
                          type="String"
                          variableName="spec.templateName"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => formik.setFieldValue('spec.templateName', value)}
                          isReadonly={readonly}
                        />
                      )}
                    </div>
                    <ServiceNowTemplateFieldsRenderer
                      isError={istemplateErrorString}
                      ticketFieldList={ticketFieldList}
                      errorData={fetchTemplateError}
                      templateFields={formik.values.spec.templateFields}
                      templateName={formik.values.spec.templateName}
                    />
                  </div>
                ) : (
                  <div>
                    {serviceNowTemplateMetaDataQuery.loading ? (
                      <PageSpinner
                        message={getString('pipeline.serviceNowCreateStep.fetchingTemplateDetails')}
                        className={css.fetching}
                      />
                    ) : (
                      <>
                        <div className={cx(stepCss.formGroup, stepCss.lg)}>
                          <FormInput.MultiTextInput
                            label={getString('pipeline.serviceNowCreateStep.templateName')}
                            name={`spec.templateName`}
                            multiTextInputProps={{
                              placeholder: getString('pipeline.serviceNowCreateStep.templateNamePlaceholder'),
                              textProps: {
                                onBlurCapture: values => {
                                  setTemplateName(values.target.value)
                                  if (values.target.value !== templateName) {
                                    resetForm(formik, 'templateName')
                                  }
                                }
                              },
                              allowableTypes: allowableTypes
                            }}
                          />
                          {getMultiTypeFromValue(formik.values.spec.templateName) === MultiTypeInputType.RUNTIME && (
                            <ConfigureOptions
                              value={formik.values.spec.templateName || ''}
                              type="String"
                              variableName="spec.templateName"
                              showRequiredField={false}
                              showDefaultField={false}
                              onChange={value => formik.setFieldValue('spec.templateName', value)}
                              isReadonly={readonly}
                            />
                          )}
                        </div>
                        <ServiceNowTemplateFieldsRenderer
                          ticketFieldList={ticketFieldList}
                          isError={istemplateErrorString}
                          errorData={templateErrorString}
                          templateFields={formik.values.spec.templateFields}
                          templateName={formik.values.spec.templateName}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {formik.values.spec.fieldType === FieldType.CreateFromStandardTemplate && CDS_GET_SERVICENOW_STANDARD_TEMPLATE && (
          <div>
            {fetchingReadonlyFields ? (
              <PageSpinner
                message={getString('pipeline.serviceNowCreateStep.fetchingFields')}
                className={css.fetching}
              />
            ) : (
              <>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.MultiTypeInput
                    selectItems={getTemplates()}
                    label={getString('pipeline.serviceNowCreateStep.templateName')}
                    name={`spec.templateName`}
                    key={FieldType.CreateFromStandardTemplate}
                    placeholder={getString('pipeline.filters.servicePlaceholder')}
                    useValue
                    multiTypeInputProps={{
                      onChange: (value, _valueType, type) => {
                        if (type === MultiTypeInputType.FIXED) {
                          setFetchingReadonlyFields(true)
                          getServiceNowTemplateMetadataV2Promise({
                            queryParams: {
                              ...commonParams,
                              connectorRef: defaultTo(connectorRefFixedValue?.toString(), ''),
                              ticketType: ticketTypeKeyFixedValue?.toString() || 'change_request',
                              templateType:
                                fieldType === FieldType.CreateFromStandardTemplate
                                  ? TEMPLATE_TYPE.STANDARD
                                  : TEMPLATE_TYPE.FORM,
                              templateName: defaultTo((value as SelectOption)?.value, value as any),
                              size: 1,
                              page: 0,
                              searchTerm: searchTerm
                            }
                          })
                            .then((response: ResponsePageServiceNowTemplate) => {
                              if (response?.data?.content?.length) {
                                const convertedSelectedTemplateValue = convertTemplateFieldsForDisplay(
                                  response?.data?.content?.[0]?.fields || {}
                                )
                                const editableFields = convertedSelectedTemplateValue.filter(
                                  field =>
                                    field.displayValue &&
                                    !serviceNowReadOnlyFieldsQuery?.data?.data?.includes(field.displayValue)
                                )
                                formik.setFieldValue('spec.templateFields', convertedSelectedTemplateValue)
                                formik.setFieldValue('spec.editableFields', editableFields)
                              } else {
                                formik.setFieldValue('spec.templateFields', [])
                                formik.setFieldValue('spec.editableFields', [])
                              }
                            })
                            .finally(() => {
                              setFetchingReadonlyFields(false)
                            })
                        } else {
                          setFetchingReadonlyFields(false)
                          formik.setFieldValue('spec.templateFields', [])
                          formik.setFieldValue('spec.editableFields', [])
                        }
                      },
                      onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('spec.build', type),
                      expressions,
                      selectProps: {
                        onQueryChange: query => {
                          if (query) debouncedSetSearchTerm?.(query)
                        },
                        allowCreatingNewItems: true,
                        items: defaultTo(getTemplates(), []),
                        loadingItems: fetchingTemplate,
                        itemRenderer: serviceItemRenderer,
                        noResults: (
                          <Text lineClamp={1} width={384} margin="small">
                            {getString('common.filters.noResultsFound')}
                          </Text>
                        )
                      },
                      allowableTypes
                    }}
                  />
                  {getMultiTypeFromValue(formik.values.spec.templateName) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={formik.values.spec.templateName || ''}
                      type="String"
                      variableName="spec.templateName"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('spec.templateName', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
                <ServiceNowTemplateFieldsRenderer
                  ticketFieldList={ticketFieldList}
                  editableFields={get(formik, 'values.spec.editableFields')}
                  isError={istemplateErrorString}
                  errorData={fetchTemplateError}
                  templateFields={formik.values.spec.templateFields}
                  templateName={formik.values.spec.templateName}
                />
              </>
            )}
          </div>
        )}
      </React.Fragment>
    </React.Fragment>
  )
}

function ServiceNowCreateStepMode(
  props: ServiceNowCreateStepModeProps,
  formikRef: StepFormikFowardRef<ServiceNowCreateData>
) {
  const { onUpdate, isNewStep, readonly, onChange, stepViewType, allowableTypes } = props
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

  const serviceNowTicketTypesV2Query = useGetServiceNowTicketTypesV2({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const serviceNowIssueCreateMetadataQuery = useGetServiceNowIssueMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })
  const serviceNowTemplateMetaDataQuery = useGetServiceNowTemplateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: '',
      ticketType: '',
      templateName: '',
      limit: 1,
      offset: 0
    }
  })

  const serviceNowReadOnlyFieldsQuery = useGetStandardTemplateReadOnlyFields({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  return (
    <Formik<ServiceNowCreateData>
      onSubmit={values => {
        onUpdate?.(processFormData(values))
      }}
      formName="serviceNowCreate"
      initialValues={props.initialValues}
      validate={data => {
        onChange?.(processFormData(data))
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: ConnectorRefSchema(getString, {
            requiredErrorMsg: getString('pipeline.serviceNowApprovalStep.validations.connectorRef')
          }),
          createType: Yup.string(),
          fieldType: Yup.string(),
          useServiceNowTemplate: Yup.boolean(),
          ticketType: Yup.string().required(getString('pipeline.serviceNowApprovalStep.validations.ticketType')),
          templateName: Yup.string().when(['useServiceNowTemplate', 'fieldType'], {
            is: (useServiceNowTemplate, fieldType) => {
              return useServiceNowTemplate || fieldType !== FieldType.ConfigureFields
            },
            then: Yup.string()
              .required(getString('pipeline.serviceNowCreateStep.validations.templateName'))
              .test(
                'templateNameTest',
                getString('pipeline.serviceNowCreateStep.validations.validTemplateName'),
                function () {
                  return (
                    // if not fixed then allow saving or
                    // if fixed then template name should be available from the APi call
                    // (templateFields indicates the fields fetched
                    getMultiTypeFromValue(this.parent.templateName) !== MultiTypeInputType.FIXED ||
                    (this.parent.templateFields?.length > 0 &&
                      getMultiTypeFromValue(this.parent.templateName) === MultiTypeInputType.FIXED &&
                      !isEmpty(this.parent.templateName))
                  )
                }
              )
          })
        })
      })}
    >
      {(formik: FormikProps<ServiceNowCreateData>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              readonly={readonly}
              isNewStep={isNewStep}
              serviceNowTemplateMetaDataQuery={serviceNowTemplateMetaDataQuery}
              serviceNowTicketTypesQuery={serviceNowTicketTypesV2Query}
              serviceNowIssueCreateMetadataQuery={serviceNowIssueCreateMetadataQuery}
              serviceNowReadOnlyFieldsQuery={serviceNowReadOnlyFieldsQuery}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

const ServiceNowCreateStepModeWithRef = React.forwardRef(ServiceNowCreateStepMode)
export default ServiceNowCreateStepModeWithRef
