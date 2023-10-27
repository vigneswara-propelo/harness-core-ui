/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ComponentProps } from 'react'
import { render, act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik, Form } from 'formik'
import { Button, MultiTypeInputType } from '@harness/uicore'
import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import MultiTypeMapInputSet, { MultiTypeMapInputSetProps } from '../MultiTypeMapInputSet'

interface TestProps {
  initialValues?: any
  appearance?: 'default' | 'minimal'
  onSubmit?: ComponentProps<typeof Formik>['onSubmit']
  multiTypeMapInputSetProps?: MultiTypeMapInputSetProps
}

function TestComponent({ initialValues, onSubmit, multiTypeMapInputSetProps }: TestProps): React.ReactElement {
  return (
    <TestWrapper>
      <Formik initialValues={initialValues} onSubmit={onSubmit ?? Promise.resolve}>
        <Form>
          <MultiTypeMapInputSet
            name="test"
            multiTypeFieldSelectorProps={{
              label: 'Test'
            }}
            {...multiTypeMapInputSetProps}
          />
          {onSubmit && <Button intent="primary" type="submit" text="Submit" />}
        </Form>
      </Formik>
    </TestWrapper>
  )
}

describe('<MultiTypeMapInputSet /> tests', () => {
  test('Renders ok with minimal UI', () => {
    const { container } = render(<TestComponent initialValues={{ test: [] }} appearance={'minimal'} />)
    expect(container).toMatchSnapshot()
  })

  test('+ Add button should add a new field', async () => {
    const { container, getByTestId } = render(<TestComponent initialValues={{ test: [] }} />)

    await act(async () => {
      fireEvent.click(getByTestId('add-test'))
    })

    expect(queryByNameAttribute('test[0].key', container)).toBeTruthy()
    expect(queryByNameAttribute('test[0].value', container)).toBeTruthy()
  })

  test('Remove button should remove a field', async () => {
    const { container, getByTestId } = render(<TestComponent initialValues={{ test: [] }} />)

    await act(async () => {
      fireEvent.click(getByTestId('add-test'))
    })

    await act(async () => {
      fireEvent.click(getByTestId('remove-test-[0]'))
    })

    expect(queryByNameAttribute('test[0].key', container)).toBeNull()
    expect(queryByNameAttribute('test[0].value', container)).toBeNull()
  })

  test('Should render properly', () => {
    const { container } = render(<TestComponent initialValues={{}} />)
    expect(container).toMatchSnapshot()
  })

  test('Should render default value and allowed values for value fields if present', async () => {
    const user = userEvent.setup()
    const initialValues = {
      envVariables: {
        k1: '',
        k2: 'v2',
        k3: '',
        k4: 'v4',
        k5: '<+input>.executionInput()'
      }
    }
    const onSubmit = jest.fn()
    const { baseElement } = render(
      <TestComponent
        initialValues={initialValues}
        onSubmit={onSubmit}
        multiTypeMapInputSetProps={{
          hasValuesAsRuntimeInput: true,
          name: 'envVariables',
          template: {
            envVariables: {
              k1: '<+input>',
              k2: '<+input>.default(v2)',
              k3: '<+input>.allowedValues(v3)',
              k4: '<+input>.default(v4).allowedValues(v4,value4)',
              k5: '<+input>.executionInput()'
            }
          },
          fieldPath: 'envVariables',
          valueMultiTextInputProps: {
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.EXECUTION_TIME]
          },
          multiTypeFieldSelectorProps: {
            disableTypeSelection: true,
            allowedTypes: [MultiTypeInputType.FIXED],
            label: 'envVariables'
          }
        }}
      />
    )

    await waitFor(() => {
      Object.entries(initialValues.envVariables).forEach(([key, value], index) => {
        expect(queryByNameAttribute(`envVariables[${index}].key`, baseElement)).toHaveValue(key)
        expect(queryByNameAttribute(`envVariables[${index}].value`, baseElement)).toHaveValue(value)
      })
    })

    await user.type(queryByNameAttribute(`envVariables[0].value`, baseElement) as HTMLElement, 'v1')
    await screen.findByDisplayValue('v1')

    await user.click(queryByNameAttribute(`envVariables[2].value`, baseElement) as HTMLElement)
    expect(await screen.findByText('v3')).toBeInTheDocument()
    await user.click(screen.getByText('v3'))
    await screen.findByDisplayValue('v3')

    await user.click(queryByNameAttribute(`envVariables[3].value`, baseElement) as HTMLElement)
    expect(await screen.findByText('v4')).toBeInTheDocument()
    expect(screen.getByText('value4')).toBeInTheDocument()
    await user.click(screen.getByText('v4'))
    await screen.findByDisplayValue('v4')

    await user.click(screen.getByText('Submit'))

    await waitFor(() =>
      expect(onSubmit).toBeCalledWith(
        {
          envVariables: {
            k1: 'v1',
            k2: 'v2',
            k3: 'v3',
            k4: 'v4',
            k5: '<+input>.executionInput()'
          }
        },
        expect.anything()
      )
    )
  })
})
