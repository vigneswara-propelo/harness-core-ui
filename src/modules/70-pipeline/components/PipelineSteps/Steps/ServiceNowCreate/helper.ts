/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiSelectOption, MultiTypeInputType, SelectOption } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { defaultTo, isEmpty } from 'lodash-es'
import type { ServiceNowFieldAllowedValueNG, ServiceNowFieldNG, ServiceNowFieldValueNG } from 'services/cd-ng'
import {
  FieldType,
  ServiceNowStaticFields,
  ServiceNowCreateData,
  ServiceNowCreateFieldType,
  ServiceNowFieldNGWithValue,
  TEMPLATE_TYPE
} from './types'
import type { ServiceNowUpdateData } from '../ServiceNowUpdate/types'
import { getkvFieldValue } from '../StepsHelper'

export const resetForm = (
  formik: FormikProps<ServiceNowCreateData> | FormikProps<ServiceNowUpdateData>,
  parent: string
) => {
  if (parent === 'connectorRef') {
    formik.setFieldValue('spec.ticketType', '')
    formik.setFieldValue('spec.fields', [])
    formik.setFieldValue('spec.editableFields', [])
    formik.setFieldValue('spec.templateFields', [])
    formik.setFieldValue('spec.templateName', '')
    formik.setFieldValue('spec.fieldType', FieldType.ConfigureFields)
  }

  if (parent === 'ticketType') {
    formik.setFieldValue('spec.fields', [])
    formik.setFieldValue('spec.editableFields', [])
    formik.setFieldValue('spec.templateFields', [])
    formik.setFieldValue('spec.templateName', '')
    formik.setFieldValue('spec.fieldType', FieldType.ConfigureFields)
  }
  if (parent === 'templateName') {
    formik.setFieldValue('spec.templateFields', [])
  }
}

export const omitDescNShortDesc = (fields: ServiceNowCreateFieldType[]): ServiceNowCreateFieldType[] =>
  fields?.filter(
    field =>
      field.name !== ServiceNowStaticFields.description && field.name !== ServiceNowStaticFields.short_description
  )

export const processFieldsForSubmit = (values: ServiceNowCreateData): ServiceNowCreateFieldType[] => {
  const descriptionFields: ServiceNowCreateFieldType[] = []
  if (values.spec.description) {
    descriptionFields.push({
      name: ServiceNowStaticFields.description,
      value: values.spec.description || ''
    })
  }
  if (values.spec.shortDescription) {
    descriptionFields.push({
      name: ServiceNowStaticFields.short_description,
      value: values.spec.shortDescription || ''
    })
  }
  const toReturn: ServiceNowCreateFieldType[] =
    values.spec.fieldType === FieldType.ConfigureFields ? [...descriptionFields] : []
  values.spec.selectedFields?.forEach((field: ServiceNowFieldNGWithValue) => {
    const name = field.key
    const value = getkvFieldValue(field)
    // The return value should be comma separated string or a number
    if (value) {
      toReturn.push({ name, value })
    }
  })
  values.spec.fields?.forEach((kvField: ServiceNowCreateFieldType) => {
    const alreadyExists = toReturn.find(ff => ff.name === kvField.name)
    const value = getkvFieldValue(kvField)
    if (!alreadyExists && value) {
      toReturn.push(kvField)
    }
  })
  return toReturn
}

export const getInitialValueForSelectedField = (
  savedFields: ServiceNowCreateFieldType[],
  serviceNowFieldNG: ServiceNowFieldNG
): string | number | SelectOption | MultiSelectOption[] => {
  const savedValue = savedFields.find(sf => sf.name === serviceNowFieldNG.key)?.value
  if (typeof savedValue === 'number') {
    return savedValue as number
  } else if (typeof savedValue === 'string') {
    if (getMultiTypeFromValue(savedValue) === MultiTypeInputType.RUNTIME) {
      return savedValue as string
    }
    if (serviceNowFieldNG.allowedValues && serviceNowFieldNG.schema?.type === 'option') {
      const labelOfSelectedDropDown: ServiceNowFieldAllowedValueNG | undefined = serviceNowFieldNG.allowedValues.find(
        field => field.id === savedValue
      )
      return { label: labelOfSelectedDropDown?.name || savedValue, value: savedValue } as SelectOption
    }
    return savedValue as string
  }
  return ''
}

const processStandardTemplateFieldsForSubmit = (values: ServiceNowCreateData): ServiceNowCreateFieldType[] => {
  const editedFields: ServiceNowFieldValueNG[] =
    values?.spec?.editableFields?.filter(field => {
      const templateFieldObject = values?.spec?.templateFields?.find(
        templateField => templateField.displayValue === field.displayValue
      )
      if (templateFieldObject) {
        return field.value !== templateFieldObject.value
      }
      return false
    }) || []

  const toReturn: ServiceNowCreateFieldType[] = []
  editedFields?.forEach(field => {
    if (field.displayValue && field.value) toReturn.push({ name: field.displayValue, value: field.value })
  })
  return toReturn
}

export const processFormData = (values: ServiceNowCreateData): ServiceNowCreateData => {
  let serviceNowSpec
  if (values.spec.fieldType === FieldType.CreateFromStandardTemplate) {
    serviceNowSpec = {
      spec: {
        delegateSelectors: values.spec.delegateSelectors,
        connectorRef: values.spec.connectorRef,
        ticketType: values.spec.ticketType,
        fields: processStandardTemplateFieldsForSubmit(values),
        createType: TEMPLATE_TYPE.STANDARD,
        templateName: values.spec.templateName
      }
    }
  } else if (values.spec.fieldType === FieldType.CreateFromTemplate || values.spec.useServiceNowTemplate) {
    serviceNowSpec = {
      spec: {
        delegateSelectors: values.spec.delegateSelectors,
        connectorRef: values.spec.connectorRef,
        ticketType: values.spec.ticketType,
        fields: [],
        templateName: values.spec.templateName,
        ...(values?.spec.isStandardTemplateEnabled || values?.spec?.createType
          ? { createType: TEMPLATE_TYPE.FORM }
          : { useServiceNowTemplate: true })
      }
    }
  } else {
    serviceNowSpec = {
      spec: {
        delegateSelectors: values.spec.delegateSelectors,
        connectorRef: values.spec.connectorRef,
        ticketType: values.spec.ticketType,
        fields: processFieldsForSubmit(values),
        ...(values?.spec.isStandardTemplateEnabled || values?.spec?.createType
          ? { createType: TEMPLATE_TYPE.NORMAL }
          : { useServiceNowTemplate: false })
      }
    }
  }
  return {
    ...values,
    ...serviceNowSpec
  }
}

export const getKVFields = (values: ServiceNowCreateData): ServiceNowCreateFieldType[] => {
  return processFieldsForSubmit(values)
}

export const processInitialValues = (values: ServiceNowCreateData): ServiceNowCreateData => {
  const fieldType =
    values.spec?.createType === TEMPLATE_TYPE.STANDARD
      ? FieldType.CreateFromStandardTemplate
      : values.spec?.createType === TEMPLATE_TYPE.FORM || values.spec.useServiceNowTemplate
      ? FieldType.CreateFromTemplate
      : FieldType.ConfigureFields
  return {
    ...values,
    spec: {
      delegateSelectors: values.spec.delegateSelectors,
      connectorRef: values.spec.connectorRef,
      useServiceNowTemplate: values.spec.useServiceNowTemplate,
      fieldType,
      ticketType: values.spec.ticketType,
      createType: values.spec.createType,
      description: values.spec.fields
        ?.find(field => field.name === ServiceNowStaticFields.description)
        ?.value.toString() as string,
      shortDescription: values.spec.fields
        ?.find(field => field.name === ServiceNowStaticFields.short_description)
        ?.value.toString() as string,
      fields:
        fieldType === FieldType.CreateFromStandardTemplate
          ? values.spec.fields
          : omitDescNShortDesc(values.spec.fields),
      templateName: values.spec.templateName,
      selectedFields: [],
      templateFields: []
    }
  }
}

export const getSelectedFieldsToBeAddedInForm = (
  newFields: ServiceNowFieldNGWithValue[],
  existingFields: ServiceNowFieldNGWithValue[] = [],
  existingKVFields: ServiceNowCreateFieldType[]
): ServiceNowFieldNGWithValue[] => {
  const toReturn: ServiceNowFieldNGWithValue[] = []
  newFields.forEach(field => {
    const alreadyPresent = existingFields.find(existing => existing.key === field.key)
    const alreadyPresentKVField = existingKVFields.find(kv => kv.name === field.name)
    if (!alreadyPresent && !alreadyPresentKVField) {
      toReturn.push({
        ...field,
        value:
          getMultiTypeFromValue(field.value as any) === MultiTypeInputType.FIXED
            ? !isEmpty(field.allowedValues)
              ? field.value
                ? {
                    label: (field.value as ServiceNowFieldValueNG).displayValue,
                    value: (field.value as ServiceNowFieldValueNG).value
                  }
                : []
              : field.value
              ? (field.value as ServiceNowFieldValueNG).value
              : ''
            : field.value
      })
    } else {
      toReturn.push({
        ...field,
        value:
          alreadyPresent !== undefined
            ? alreadyPresent?.value
            : getMultiTypeFromValue(field.value as any) === MultiTypeInputType.FIXED
            ? field.value
              ? (field.value as ServiceNowFieldValueNG).value
              : ''
            : field.value
      })
    }
  })
  return toReturn
}

export const getKVFieldsToBeAddedInForm = (
  newFields: ServiceNowCreateFieldType[],
  existingFields: ServiceNowCreateFieldType[] = [],
  existingSelectedFields: ServiceNowFieldNG[] = []
): ServiceNowCreateFieldType[] => {
  const toReturn: ServiceNowCreateFieldType[] = [...existingFields]
  newFields.forEach(field => {
    const alreadyPresent = existingFields.find(existing => existing.name === field.name)
    const alreadyPresentSelectedField = existingSelectedFields.find(existing => existing.key === field.name)
    if (!alreadyPresent && !alreadyPresentSelectedField) {
      toReturn.push(field)
    }
  })
  return toReturn
}

export const updateMap = (alreadySelectedFields: ServiceNowFieldNG[]): Record<string, boolean> => {
  const map: Record<string, boolean> = {}
  if (!isEmpty(alreadySelectedFields)) {
    alreadySelectedFields.forEach(field => {
      map[field.name] = true
    })
  }
  return map
}

export const setServiceNowFieldAllowedValuesOptions = (
  allowedValues: ServiceNowFieldAllowedValueNG[]
): MultiSelectOption[] =>
  allowedValues.map(allowedValue => ({
    label: allowedValue.value || allowedValue.name || allowedValue.id || '',
    value: allowedValue.id || ''
  }))

export const removeServiceNowMandatoryFields = (fieldList: ServiceNowFieldNG[]): ServiceNowFieldNG[] => {
  fieldList = fieldList.filter(
    item => item.key !== ServiceNowStaticFields.short_description && item.key !== ServiceNowStaticFields.description
  )
  return fieldList
}

export const convertTemplateFieldsForDisplay = (fields: {
  [key: string]: ServiceNowFieldValueNG
}): ServiceNowFieldValueNG[] => {
  const fieldsAsServiceNowField: ServiceNowFieldValueNG[] = []
  for (const item of Object.entries(fields)) {
    fieldsAsServiceNowField.push({
      displayValue: item[0],
      value: defaultTo(item[1].displayValue?.toString(), item[1].value?.toString())
    } as ServiceNowFieldValueNG)
  }
  return fieldsAsServiceNowField
}
