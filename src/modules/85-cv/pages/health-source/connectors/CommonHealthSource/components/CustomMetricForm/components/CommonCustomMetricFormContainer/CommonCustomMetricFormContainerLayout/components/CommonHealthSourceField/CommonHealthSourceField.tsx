/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useMemo, useState } from 'react'
import { FormInput, MultiTypeInputType, SelectOption, useToaster } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import type {
  CommonCustomMetricFormikInterface,
  FieldMapping
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { useStrings } from 'framework/strings'
import { FIELD_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { HealthSourceParamValuesRequest, useGetParamValues } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import {
  generateRequestBodyForParamValues,
  getListOptionsFromParams
} from '../../CommonCustomMetricFormContainer.utils'
import { getCommonHealthSourceDropdownValue } from './CommonHealthSourceField.utils'

export interface CommonHealthSourceFieldProps {
  field: FieldMapping
  isConnectorRuntimeOrExpression?: boolean
  connectorIdentifier: string
  providerType: HealthSourceParamValuesRequest['providerType']
  fieldsToFetchRecords?: FieldMapping[]
}

export default function CommonHealthSourceField(props: CommonHealthSourceFieldProps): JSX.Element {
  const { field, isConnectorRuntimeOrExpression, connectorIdentifier, providerType, fieldsToFetchRecords } = props
  const { values } = useFormikContext<CommonCustomMetricFormikInterface>()
  const { isTemplate, expressions } = useContext(SetupSourceTabsContext)
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [listOptions, setListOptions] = useState<SelectOption[]>([])
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { label, identifier, placeholder, type, isTemplateSupportEnabled, allowCreatingNewItems } = field
  const shouldShowTemplatisedComponent = isTemplate && isTemplateSupportEnabled
  const fixedValues = field?.fixedValues
  const shouldFetchDropdownOptions =
    !(isTemplate && isTemplateSupportEnabled && isConnectorRuntimeOrExpression) && !fixedValues
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const { mutate: fetchParamValues, loading } = useGetParamValues({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })

  const fetchParamValuesData = async (): Promise<void> => {
    const requestBody = generateRequestBodyForParamValues({
      fieldsToFetchRecords,
      values,
      connectorIdentifier,
      providerType,
      identifier
    })
    try {
      const data = await fetchParamValues(requestBody)
      const listOptionsData = getListOptionsFromParams(data)
      setListOptions(listOptionsData)
    } catch (errorData) {
      showError(getErrorMessage(errorData) as string)
    }
  }

  useEffect(() => {
    if (type === FIELD_ENUM.DROPDOWN) {
      if (shouldFetchDropdownOptions) {
        fetchParamValuesData()
      } else if (fixedValues) {
        setListOptions(fixedValues)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixedValues, shouldFetchDropdownOptions, type])

  const dropdownFieldValue = useMemo(() => {
    const fieldValue = values?.[identifier] as string
    if (listOptions.length && fieldValue) {
      return getCommonHealthSourceDropdownValue(listOptions, fieldValue)
    }
  }, [identifier, listOptions, values])

  const renderField = (): JSX.Element => {
    switch (type) {
      case FIELD_ENUM.DROPDOWN:
        return (
          <>
            {shouldShowTemplatisedComponent ? (
              <FormInput.MultiTypeInput
                label={label}
                useValue
                name={identifier}
                selectItems={listOptions}
                data-testid={identifier}
                multiTypeInputProps={{
                  expressions,
                  newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
                  /**
                   * Ignoring TS and ESLint as selectProps in MultiTypeInput requesting
                   * for all the select component props
                   *
                   * selectProps?: Omit<SelectProps, 'onChange' | 'value'>
                   *
                   * */
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  selectProps: { allowCreatingNewItems },
                  allowableTypes: isConnectorRuntimeOrExpression
                    ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                    : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                }}
              />
            ) : (
              <FormInput.Select
                label={label}
                name={identifier}
                disabled={loading}
                value={dropdownFieldValue}
                placeholder={loading ? getString('loading') : placeholder}
                items={listOptions}
                data-testid={identifier}
                selectProps={{ allowCreatingNewItems: true }}
              />
            )}
          </>
        )
      case FIELD_ENUM.TEXT_INPUT:
        return (
          <>
            {shouldShowTemplatisedComponent ? (
              <FormInput.MultiTextInput
                label={label}
                name={identifier}
                data-testid={identifier}
                multiTextInputProps={{
                  expressions,
                  newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
                  allowableTypes: isConnectorRuntimeOrExpression
                    ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                    : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                }}
              />
            ) : (
              <FormInput.Text
                label={label}
                name={identifier}
                disabled={loading}
                placeholder={loading ? getString('loading') : placeholder}
                data-testid={identifier}
              />
            )}
          </>
        )
      default:
        return <></>
    }
  }

  return <>{renderField()}</>
}
