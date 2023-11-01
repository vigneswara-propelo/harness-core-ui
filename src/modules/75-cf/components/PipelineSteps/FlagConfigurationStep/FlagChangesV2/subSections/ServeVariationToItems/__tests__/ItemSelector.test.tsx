/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik, FormikProps } from 'formik'
import { MultiTypeInputType, SelectOption } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import ItemSelector, { ItemSelectorProps } from '../ItemSelector'

const renderComponent = (
  props: Partial<ItemSelectorProps> = {},
  formProps: Partial<FormikProps<any>> = {}
): RenderResult =>
  render(
    <TestWrapper>
      <Formik initialValues={{ test: undefined }} onSubmit={jest.fn()} {...formProps}>
        <ItemSelector
          name="test"
          label="Test label"
          placeholder="Test placeholder"
          items={[{ label: 'Item 1', value: 'item1' }]}
          type={MultiTypeInputType.FIXED}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          onTypeChange={jest.fn()}
          onQueryChange={jest.fn()}
          {...props}
        />
      </Formik>
    </TestWrapper>
  )

describe('ItemSelector', () => {
  test('it should display the passed label', async () => {
    const label = 'TEST LABEL'
    renderComponent({ label })

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  test('it should display a listing of items when clicked', async () => {
    const items: SelectOption[] = [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' }
    ]
    const placeholder = 'TEST PLACEHOLDER'

    renderComponent({ items, placeholder })

    await userEvent.click(await screen.findByPlaceholderText(`- ${placeholder} -`))

    for (const item of items) {
      expect(await screen.findByText(item.label)).toBeInTheDocument()
    }
  })

  test('it should be display as read only when disabled', async () => {
    const placeholder = 'TEST PLACEHOLDER'
    renderComponent({ disabled: true, placeholder })

    expect(await screen.findByPlaceholderText(`- ${placeholder} -`)).toBeDisabled()
  })

  test('it should display selected values', async () => {
    const items: SelectOption[] = [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' }
    ]
    const name = 'test'

    renderComponent({ items, name }, { initialValues: { [name]: [items[0].value, items[1].value] } })

    expect(await screen.findByText(items[0].label)).toBeInTheDocument()
    expect(await screen.findByText(items[1].label)).toBeInTheDocument()
    expect(screen.queryByText(items[2].label)).not.toBeInTheDocument()
  })

  test('it should call the onQueryChange callback when the field is typed in', async () => {
    const onQueryChangeMock = jest.fn()
    const placeholder = 'TEST PLACEHOLDER'

    renderComponent({ placeholder, onQueryChange: onQueryChangeMock })

    expect(onQueryChangeMock).not.toHaveBeenCalled()

    await userEvent.type(await screen.findByPlaceholderText(`- ${placeholder} -`), 'test')

    expect(onQueryChangeMock).toHaveBeenCalledWith('test', undefined)
  })

  test('it should display the type selector button', async () => {
    const allowableTypes: MultiTypeInputType[] = [
      MultiTypeInputType.FIXED,
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.EXPRESSION
    ]
    renderComponent({ allowableTypes })

    expect(screen.queryByText('Fixed value')).not.toBeInTheDocument()
    expect(screen.queryByText('Runtime input')).not.toBeInTheDocument()
    expect(screen.queryByText('Expression')).not.toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button'))

    expect(await screen.findByText('Fixed value')).toBeInTheDocument()
    expect(await screen.findByText('Runtime input')).toBeInTheDocument()
    expect(await screen.findByText('Expression')).toBeInTheDocument()
  })

  test('it should call the onTypeChange callback when the type is changed', async () => {
    const onTypeChangeMock = jest.fn()
    const allowableTypes: MultiTypeInputType[] = [
      MultiTypeInputType.FIXED,
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.EXPRESSION
    ]

    renderComponent({ allowableTypes, onTypeChange: onTypeChangeMock })

    expect(onTypeChangeMock).not.toHaveBeenCalled()

    await userEvent.click(await screen.findByRole('button'))
    await userEvent.click(await screen.findByText('Runtime input'))

    expect(onTypeChangeMock).toHaveBeenCalledWith(MultiTypeInputType.RUNTIME)
  })
})
