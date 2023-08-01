/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, RenderResult } from '@testing-library/react'
import * as Formik from 'formik'
import { SelectOption } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import type { FieldMapping } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import type { HealthSourceParamValuesRequest } from 'services/cv'
import * as cvServices from 'services/cv'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import {
  CustomMetricFormFieldNames,
  FIELD_ENUM
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import type { CommonHealthSourceFieldProps } from '../CommonHealthSourceField'
import CommonHealthSourceField from '../CommonHealthSourceField'
import { mockedParamsValues } from './CommonHealthSourceField.mock'
import { getCommonHealthSourceDropdownValue } from '../CommonHealthSourceField.utils'

const renderComponent = (props: CommonHealthSourceFieldProps, isTemplate?: boolean): RenderResult => {
  return render(
    <SetupSourceTabsContext.Provider
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      value={{ isTemplate }}
    >
      <TestWrapper>
        <CommonHealthSourceField {...props} />
      </TestWrapper>
    </SetupSourceTabsContext.Provider>
  )
}

describe('Test cases for CommonHealthSourceField', () => {
  const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext')
  const setFieldValueMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    useFormikContextMock.mockReturnValue({
      isValid: true,
      setFieldValue: setFieldValueMock,
      values: {}
    } as unknown as any)
  })

  const props = {
    field: {
      type: 'Dropdown',
      label: 'Log Indexes',
      identifier: 'index',
      placeholder: 'Select Log Index',
      isTemplateSupportEnabled: true
    } as FieldMapping,
    isConnectorRuntimeOrExpression: false,
    connectorIdentifier: 'ELK_connector',
    providerType: 'ElasticSearch' as HealthSourceParamValuesRequest['providerType']
  }
  test('it should render the component with Loading text when api is in loading state', () => {
    jest.spyOn(cvServices, 'useGetParamValues').mockImplementation(
      () =>
        ({
          mutate: jest.fn(),
          loading: true,
          error: null
        } as any)
    )

    const { container } = renderComponent(props)
    const inputEl = container.querySelector(`input[name=${props.field.identifier}]`)

    expect(inputEl).toBeInTheDocument()
    expect(inputEl).toHaveAttribute('placeholder', '- loading -')
  })

  test('it should show the component with error message when api errors out', () => {
    jest.spyOn(cvServices, 'useGetParamValues').mockImplementation(
      () =>
        ({
          mutate: jest.fn().mockRejectedValue(() => {
            return {
              error: {
                message: 'failed to fetch data'
              }
            }
          }),
          loading: false
        } as any)
    )
    const { container } = renderComponent(props)
    const inputEl = container.querySelector(`input[name=${props.field.identifier}]`)
    expect(inputEl).toBeInTheDocument()
    expect(inputEl).toHaveAttribute('placeholder', '- Select Log Index -')
  })

  test('it should show the component with options when fieldType is dropdown and api is success', () => {
    jest.spyOn(cvServices, 'useGetParamValues').mockImplementation(
      () =>
        ({
          mutate: jest.fn().mockImplementation(() => mockedParamsValues),
          loading: false
        } as any)
    )
    const { container } = renderComponent(props)
    const inputEl = container.querySelector(`input[name=${props.field.identifier}]`)
    expect(inputEl).toBeInTheDocument()
    expect(inputEl).toHaveAttribute('placeholder', '- Select Log Index -')
  })

  test('it should show the component with options when fieldType is dropdown and api is success and should be able to select a new option', () => {
    jest.spyOn(cvServices, 'useGetParamValues').mockImplementation(
      () =>
        ({
          mutate: jest.fn().mockImplementation(() => mockedParamsValues),
          loading: false
        } as any)
    )
    const { container } = renderComponent(props)
    const inputEl = container.querySelector(`input[name=${props.field.identifier}]`)
    expect(inputEl).toBeInTheDocument()
    expect(inputEl).toHaveAttribute('placeholder', '- Select Log Index -')
    if (inputEl) {
      fireEvent.change(inputEl, { target: { value: '*' } })
    }
  })

  test('it should render the component with template support when component is rendered in template mode', () => {
    jest.spyOn(cvServices, 'useGetParamValues').mockImplementation(
      () =>
        ({
          mutate: jest.fn(),
          loading: false,
          error: null
        } as any)
    )

    const { container } = renderComponent(props, true)
    const inputEl = container.querySelector(`input[name=${props.field.identifier}]`)
    expect(inputEl).toHaveAttribute('placeholder', 'Search...')
  })
})

describe('Test cases for CommonHealthSourceField when field rendered is Text Input', () => {
  const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext')
  const setFieldValueMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    useFormikContextMock.mockReturnValue({
      isValid: true,
      setFieldValue: setFieldValueMock,
      values: {}
    } as unknown as any)
  })

  const props = {
    field: {
      type: FIELD_ENUM.TEXT_INPUT,
      label: 'Resource ID',
      identifier: CustomMetricFormFieldNames.INDEX,
      placeholder: 'Please provide Resource ID ',
      isTemplateSupportEnabled: true,
      allowCreatingNewItems: true
    },
    isConnectorRuntimeOrExpression: false,
    connectorIdentifier: 'ELK_connector',
    providerType: 'ElasticSearch' as HealthSourceParamValuesRequest['providerType']
  }
  test('it should render the TEXT_INPUT component', () => {
    const { container } = renderComponent(props)
    const inputEl = container.querySelector(`input[name=${props.field.identifier}]`)
    expect(inputEl).toBeInTheDocument()
  })

  test('it should render the component with template support when component is rendered in template mode', () => {
    const { container } = renderComponent(props, true)
    const inputEl = container.querySelector(`input[name=${props.field.identifier}]`)
    expect(inputEl).toBeInTheDocument()
  })
})
describe('getCommonHealthSourceDropdownValue', () => {
  const listOptions: SelectOption[] = [
    { label: 'Option 1', value: 'option_1' },
    { label: 'Option 2', value: 'option_2' },
    { label: 'Option 3', value: 'option_3' }
  ]

  test('should return the matching dropdownField if found', () => {
    const fieldValue = 'option_2'
    const result = getCommonHealthSourceDropdownValue(listOptions, fieldValue)
    expect(result).toEqual({ label: 'Option 2', value: 'option_2' })
  })

  test('should return an object with label and value set to fieldValue if no matching dropdownField is found', () => {
    const fieldValue = 'option_4' // An option that does not exist in listOptions
    const result = getCommonHealthSourceDropdownValue(listOptions, fieldValue)
    expect(result).toEqual({ label: 'option_4', value: 'option_4' })
  })
})
