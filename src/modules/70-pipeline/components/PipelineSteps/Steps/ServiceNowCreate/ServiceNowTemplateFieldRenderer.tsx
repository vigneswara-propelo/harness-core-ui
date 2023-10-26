/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType, Text } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import type { ServiceNowFieldValueNG } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import css from './ServiceNowCreate.module.scss'

export interface ServiceNowTemplateFieldsRendererProps {
  templateFields?: ServiceNowFieldValueNG[]
  editableFields?: ServiceNowFieldValueNG[]
  templateName?: string
  errorData?: string
  isError?: boolean
}
interface ServiceNowTemplateFieldInterface {
  templateField: ServiceNowFieldValueNG
  editableField?: ServiceNowFieldValueNG
  isEditableField?: boolean
  index: number
  editableFieldIndex?: number
}

function GetServiceNowTemplateFieldComponent({
  templateField,
  editableFieldIndex,
  isEditableField = false
}: ServiceNowTemplateFieldInterface) {
  return (
    <FormInput.Text
      label={templateField.displayValue}
      name={`spec.editableFields[${editableFieldIndex}].value`}
      placeholder={templateField.value}
      disabled={!isEditableField}
      className={css.deploymentViewMedium}
    />
  )
}

const isIndexValid = (index: number | undefined): boolean => {
  if (Number.isInteger(index) && index !== -1) {
    return true
  }
  return false
}

export function ServiceNowTemplateFieldsRenderer(props: ServiceNowTemplateFieldsRendererProps) {
  const { templateFields, templateName, errorData, isError = false, editableFields } = props
  const { getString } = useStrings()
  const { CDS_GET_SERVICENOW_STANDARD_TEMPLATE } = useFeatureFlags()
  return templateFields && templateFields.length > 0 ? (
    <>
      {templateFields?.map((selectedField: ServiceNowFieldValueNG, index: number) => {
        const editableFieldIndex = editableFields?.findIndex(field => field.displayValue === selectedField.displayValue)
        return (
          <Layout.Horizontal className={css.alignCenter} key={selectedField.displayValue}>
            <GetServiceNowTemplateFieldComponent
              templateField={selectedField}
              index={index}
              editableFieldIndex={editableFieldIndex}
              isEditableField={!!selectedField?.displayValue && isIndexValid(editableFieldIndex)}
            />
          </Layout.Horizontal>
        )
      })}
    </>
  ) : getMultiTypeFromValue(templateName) !== MultiTypeInputType.FIXED ||
    CDS_GET_SERVICENOW_STANDARD_TEMPLATE ? null : (
    <Layout.Horizontal className={css.alignCenter}>
      <Text intent={isError ? Intent.DANGER : Intent.NONE}>
        {isError ? errorData : getString('pipeline.serviceNowCreateStep.noSuchTemplateFound')}
      </Text>
    </Layout.Horizontal>
  )
}
