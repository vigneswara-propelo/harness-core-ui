/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import cx from 'classnames'
import { defaultTo, isEmpty, isNull, isUndefined } from 'lodash-es'
import {
  Button,
  FormInput,
  Layout,
  AllowedTypes,
  SelectOption,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { ServiceNowFieldValueNG } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeTextAreaField } from '@common/components'
import type { ServiceNowFieldNG } from 'services/cd-ng'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { setServiceNowFieldAllowedValuesOptions } from './helper'
import { ServiceNowFieldNGWithValue, SERVICENOW_TYPE } from './types'
import css from './ServiceNowCreate.module.scss'

export type TicketFieldDetailsMap = {
  [key: string]: ServiceNowFieldValueNG
}

export interface ServiceNowFieldsRendererProps {
  selectedFields?: ServiceNowFieldNGWithValue[]
  readonly?: boolean
  onDelete?: (index: number, selectedField: ServiceNowFieldNG) => void
  onRefresh?: (index: number, selectedField: ServiceNowFieldNGWithValue, valueToUpdate: ServiceNowFieldValueNG) => void
  allowableTypes: AllowedTypes
  ticketFieldDetailsMap?: TicketFieldDetailsMap
  serviceNowType?: SERVICENOW_TYPE
}

interface MappedComponentInterface {
  selectedField: ServiceNowFieldNGWithValue
  props: ServiceNowFieldsRendererProps
  expressions: string[]
  index: number
}

export const TEXT_INPUT_SUPPORTED_FIELD_TYPES = new Set(['string', 'glide_date_time', 'integer', 'boolean', 'unknown'])

function GetMappedFieldComponent({ selectedField, props, expressions, index }: MappedComponentInterface) {
  const showTextField = useCallback(() => {
    if (
      isNull(selectedField.schema) ||
      isUndefined(selectedField.schema) ||
      TEXT_INPUT_SUPPORTED_FIELD_TYPES.has(selectedField.schema.type)
    ) {
      return true
    }
    if (isEmpty(selectedField.allowedValues) && selectedField.schema.type === 'option' && selectedField.schema.array) {
      return true
    }
    return false
  }, [selectedField])

  const showMultiTypeField = useCallback(() => {
    return selectedField.allowedValues && selectedField.schema?.type === 'option'
  }, [selectedField])

  const showExpandableTextField = () => defaultTo(selectedField?.schema?.multilineText, false)
  const isFieldDisabled = isApprovalStepFieldDisabled(
    props.readonly || (props.serviceNowType === SERVICENOW_TYPE.UPDATE && selectedField.readOnly)
  )

  if (showMultiTypeField()) {
    return (
      <FormInput.MultiTypeInput
        selectItems={setServiceNowFieldAllowedValuesOptions(selectedField.allowedValues)}
        label={selectedField.name}
        name={`spec.selectedFields[${index}].value`}
        placeholder={selectedField.name}
        disabled={isFieldDisabled}
        className={cx(css.multiSelect, css.md)}
        multiTypeInputProps={{ allowableTypes: props.allowableTypes, expressions }}
      />
    )
  } else if (showExpandableTextField()) {
    return (
      <FormMultiTypeTextAreaField
        label={selectedField.name}
        name={`spec.selectedFields[${index}].value`}
        placeholder={selectedField.name}
        multiTypeTextArea={{ enableConfigureOptions: false, expressions, allowableTypes: props.allowableTypes }}
        disabled={isFieldDisabled}
        className={css.md}
      />
    )
  } else if (showTextField()) {
    return (
      <FormInput.MultiTextInput
        label={selectedField.name}
        disabled={isFieldDisabled}
        name={`spec.selectedFields[${index}].value`}
        placeholder={selectedField.name}
        className={css.deploymentViewMedium}
        multiTextInputProps={{
          allowableTypes: props.allowableTypes,
          expressions
        }}
      />
    )
  }
  return null
}

export function ServiceNowFieldsRenderer(props: ServiceNowFieldsRendererProps) {
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { readonly, selectedFields, onDelete, ticketFieldDetailsMap = {}, onRefresh } = props
  return selectedFields ? (
    <>
      {selectedFields?.map((selectedField: ServiceNowFieldNGWithValue, index: number) => {
        let isFieldUpdatedComparedToServiceNow

        const existingValueObjFromServiceNow = selectedField?.key ? ticketFieldDetailsMap?.[selectedField.key] : {}
        const existingValueFromServiceNow = existingValueObjFromServiceNow?.value

        if (!isEmpty(selectedField?.allowedValues)) {
          // Handles refresh for dropdown fields
          isFieldUpdatedComparedToServiceNow =
            existingValueObjFromServiceNow &&
            existingValueObjFromServiceNow.value &&
            existingValueObjFromServiceNow.value !== (selectedField?.value as SelectOption)?.value
        } else {
          // Handles refresh for text/non dropdown fields
          isFieldUpdatedComparedToServiceNow =
            existingValueFromServiceNow && existingValueFromServiceNow !== selectedField?.value
        }
        return (
          <Layout.Horizontal className={css.alignCenter} key={selectedField.name}>
            <GetMappedFieldComponent
              selectedField={selectedField}
              props={props}
              expressions={expressions}
              index={index}
            />
            <Button
              minimal
              icon="trash"
              disabled={isApprovalStepFieldDisabled(readonly)}
              data-testid={`remove-selectedField-${index}`}
              onClick={() => onDelete?.(index, selectedField)}
            />
            {isFieldUpdatedComparedToServiceNow &&
              getMultiTypeFromValue(selectedField?.value as SelectOption) === MultiTypeInputType.FIXED && (
                <Button
                  intent="primary"
                  icon="refresh"
                  onClick={() =>
                    onRefresh?.(index, selectedField, existingValueObjFromServiceNow as ServiceNowFieldValueNG)
                  }
                  minimal
                  tooltipProps={{ isDark: true }}
                  tooltip={getString('pipeline.serviceNowUpdateStep.refreshFieldInfo')}
                />
              )}
          </Layout.Horizontal>
        )
      })}
    </>
  ) : null
}
