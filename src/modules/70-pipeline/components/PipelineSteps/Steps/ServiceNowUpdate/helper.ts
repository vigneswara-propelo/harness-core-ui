/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { ServiceNowUpdateData, TaskTypes } from '@pipeline/components/PipelineSteps/Steps/ServiceNowUpdate/types'
import type { ServiceNowCreateFieldType } from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/types'
import { FieldType, ServiceNowStaticFields } from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/types'
import {
  omitDescNShortDesc,
  processFieldsForSubmit
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/helper'

export const processFormData = (values: any, isFormSubmit = false): ServiceNowUpdateData => {
  const ticketTypeVal = (values?.spec?.ticketType as string)?.toLocaleUpperCase()
  let serviceNowSpec
  const updateMultipleObj =
    ticketTypeVal === TaskTypes.CHANGE_TASK && values.spec?.updateMultipleFlag
      ? {
          updateMultiple: {
            type: TaskTypes.CHANGE_TASK,
            ...values.spec.updateMultiple
          }
        }
      : {}
  if (!values.spec.useServiceNowTemplate) {
    serviceNowSpec = {
      spec: {
        delegateSelectors: values.spec.delegateSelectors,
        useServiceNowTemplate: false,
        connectorRef: values.spec.connectorRef,
        ticketType: values.spec.ticketType,
        ticketNumber: values.spec.ticketNumber,
        fields: processFieldsForSubmit(values),
        ...updateMultipleObj
      }
    }
  } else {
    serviceNowSpec = {
      spec: {
        delegateSelectors: values.spec.delegateSelectors,
        useServiceNowTemplate: true,
        connectorRef: values.spec.connectorRef,
        ticketType: values.spec.ticketType,
        ticketNumber: values.spec.ticketNumber,
        fields: [],
        templateName: values.spec.templateName,
        ...updateMultipleObj
      }
    }
  }
  if (isFormSubmit) {
    values.spec?.updateMultipleFlag && ticketTypeVal === TaskTypes.CHANGE_TASK
      ? delete values.spec.ticketNumber
      : delete values.spec.updateMultiple
  }
  return {
    ...values,
    ...serviceNowSpec
  }
}

export const getKVFields = (values: ServiceNowUpdateData): ServiceNowCreateFieldType[] => {
  return processFieldsForSubmit(values)
}

export const processInitialValues = (values: ServiceNowUpdateData): ServiceNowUpdateData => {
  const initValues = {
    ...values,
    spec: {
      delegateSelectors: values.spec.delegateSelectors,
      connectorRef: values.spec.connectorRef,
      useServiceNowTemplate: values.spec.useServiceNowTemplate,

      fieldType: values.spec.useServiceNowTemplate ? FieldType.CreateFromTemplate : FieldType.ConfigureFields,
      ticketType: values.spec.ticketType,
      description: values.spec.fields
        ?.find(field => field.name === ServiceNowStaticFields.description)
        ?.value.toString() as string,
      shortDescription: values.spec.fields
        ?.find(field => field.name === ServiceNowStaticFields.short_description)
        ?.value.toString() as string,
      fields: omitDescNShortDesc(values.spec.fields),
      ticketNumber: values.spec.ticketNumber,
      templateName: values.spec.templateName,
      selectedFields: [],
      templateFields: []
    }
  }
  if (values.spec?.updateMultiple) {
    return {
      ...initValues,
      spec: {
        ...initValues.spec,
        updateMultipleFlag: true,
        updateMultiple: {
          ...values.spec?.updateMultiple
        }
      }
    }
  }
  return initValues
}
