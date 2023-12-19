/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik, FormikForm } from '@harness/uicore'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import AddConditionsSection, { ConditionsRowHeaders } from '../../AddConditionsSection/AddConditionsSection'

const setFieldValueFn = jest.fn()
const onSubmitFn = jest.fn()

function WrapperComponent(props: {
  initialValues: any
  title: string
  fieldId: string
  errors: any
  attributePlaceholder?: string
}): JSX.Element {
  const { initialValues, title, fieldId, errors, attributePlaceholder } = props || {}
  return (
    <TestWrapper>
      <Formik initialValues={initialValues} onSubmit={onSubmitFn} formName="TestWrapper">
        {formikProps => (
          <FormikForm>
            <AddConditionsSection
              title={title}
              fieldId={fieldId}
              attributePlaceholder={attributePlaceholder}
              formikValues={formikProps.values}
              setFieldValue={setFieldValueFn}
              errors={errors}
            />
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('AddConditionsSection: Unit tests', () => {
  beforeEach(() => {
    setFieldValueFn.mockReset()
  })

  test('verify component render without any issue', async () => {
    const title = 'TestTitle'
    const fieldId = 'TestFieldId'
    const { getByText } = render(
      <WrapperComponent initialValues={{}} title={title} fieldId={fieldId} errors={{ [fieldId]: 'Error Text' }} />
    )
    expect(getByText(title)).toBeInTheDocument()
    expect(getByText('add')).toBeInTheDocument()
    await userEvent.click(getByText('add'))
    expect(setFieldValueFn).toBeCalledWith(fieldId, [{ key: '', operator: '', value: '' }])
  })

  test('verify component render with error text', async () => {
    const title = 'TestTitle'
    const fieldId = 'TestFieldId'
    const { getByText } = render(
      <WrapperComponent
        initialValues={{
          [fieldId]: [{ key: 'key', operator: 'operator', value: 'value' }]
        }}
        title={title}
        fieldId={fieldId}
        errors={{ [fieldId]: 'Error Text' }}
      />
    )
    expect(getByText('Error Text')).toBeInTheDocument()
  })

  test('verify delete row without any error', async () => {
    const title = 'TestTitle'
    const fieldId = 'TestFieldId'
    const { container } = render(
      <WrapperComponent
        initialValues={{
          [fieldId]: [{ key: 'key', operator: 'operator', value: 'value' }]
        }}
        title={title}
        fieldId={fieldId}
        errors={{}}
      />
    )
    const deleteBtn = container.querySelector('span[data-name="main-delete"]')
    expect(deleteBtn).toBeInTheDocument()
    if (deleteBtn) {
      await userEvent.click(deleteBtn)
      expect(setFieldValueFn).toBeCalledWith(fieldId, [])
    }
  })

  test('verify with placeholder text', async () => {
    const title = 'TestTitle'
    const fieldId = 'TestFieldId'
    const placeholder = 'TestPlaceholder'
    const { getByPlaceholderText } = render(
      <WrapperComponent
        initialValues={{
          [fieldId]: [{ key: 'key', operator: 'operator', value: 'value' }]
        }}
        title={title}
        fieldId={fieldId}
        errors={{ [fieldId]: 'Error Text' }}
        attributePlaceholder={placeholder}
      />
    )
    expect(getByPlaceholderText(placeholder)).toBeInTheDocument()
  })

  test('verify onsubmit form data', async () => {
    const title = 'TestTitle'
    const fieldId = 'TestFieldId'
    const placeholder = 'TestPlaceholder'
    const initialValues = {
      [fieldId]: [{ key: 'key', operator: 'operator', value: 'value' }]
    }
    const { getByTestId, container } = render(
      <WrapperComponent
        initialValues={initialValues}
        title={title}
        fieldId={fieldId}
        errors={{ [fieldId]: 'Error Text' }}
        attributePlaceholder={placeholder}
      />
    )
    const element = container.querySelector(`input[name="${fieldId}.0.key"]`)
    if (element) {
      act(() => {
        fireEvent.change(element, { target: { value: 'updatedKey' } })
      })
    }
    const submitButton = getByTestId('submit')
    expect(submitButton).toBeInTheDocument()
    await userEvent.click(submitButton)
    expect(onSubmitFn).toBeCalledWith(
      {
        [fieldId]: [{ key: 'updatedKey', operator: 'operator', value: 'value' }]
      },
      expect.any(Object)
    )
  })

  test('ConditionsRowHeaders: should render without any error', async () => {
    const getStringFn = (str: string): string => str
    const { getByText } = render(<ConditionsRowHeaders getString={getStringFn} />)
    expect(getByText('triggers.conditionsPanel.attribute'.toUpperCase())).toBeInTheDocument()
    expect(getByText('triggers.conditionsPanel.operator'.toUpperCase())).toBeInTheDocument()
    expect(getByText('triggers.conditionsPanel.matchesValue'.toUpperCase())).toBeInTheDocument()
  })

  test('ConditionsRowHeaders should not break if getString function is not passed', async () => {
    const { queryByText } = render(<ConditionsRowHeaders />)
    expect(queryByText('triggers.conditionsPanel.attribute'.toUpperCase())).not.toBeInTheDocument()
    expect(queryByText('triggers.conditionsPanel.operator'.toUpperCase())).not.toBeInTheDocument()
    expect(queryByText('triggers.conditionsPanel.matchesValue'.toUpperCase())).not.toBeInTheDocument()
  })
})
