/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import type { Segment, Variation } from 'services/cf'
import PercentageRollout, { PercentageRolloutProps } from '@cf/components/PercentageRollout/PercentageRollout'

const mockTargetGroups: Segment[] = [
  { name: 'Group 1', identifier: 'g1' },
  { name: 'Group 2', identifier: 'g2' },
  { name: 'Group 3', identifier: 'g3' }
]

const mockVariations: Variation[] = [
  { name: 'Variation 1', value: 'var1', identifier: 'var1', description: 'Variation 1 description' },
  { value: 'var2', identifier: 'var2', description: 'Variation 2 description' },
  { name: 'Variation 3', value: 'var3', identifier: 'var3', description: 'Variation 3 description' }
]

const renderComponent = (props: Partial<PercentageRolloutProps> = {}): RenderResult => {
  const prefix = props.prefix || (fieldName => fieldName)

  return render(
    <TestWrapper>
      <Formik<Record<string, any>> formName="test" onSubmit={jest.fn()} initialValues={{}}>
        {({ values }) => (
          <PercentageRollout
            prefix={prefix}
            fieldValues={{ variations: values.variations }}
            targetGroups={mockTargetGroups}
            variations={mockVariations}
            {...props}
          />
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('PercentageRollout', () => {
  describe('Target Groups select', () => {
    test('it should display a drop down with all target groups', async () => {
      renderComponent()

      expect(screen.getByText('cf.percentageRollout.toTargetGroup')).toBeInTheDocument()

      mockTargetGroups.forEach(({ name }) => {
        expect(screen.queryByText(name)).not.toBeInTheDocument()
      })

      await userEvent.click(
        document.querySelector('[name$="clauses[0].values[0]"]')?.closest('.bp3-input') as HTMLElement
      )

      await waitFor(() => {
        mockTargetGroups.forEach(({ name }) => {
          expect(screen.getByText(name)).toBeInTheDocument()
        })
      })
    })

    test('it should display a drop down when target groups is an empty array', async () => {
      renderComponent({ targetGroups: [] })

      expect(screen.getByText('cf.percentageRollout.toTargetGroup')).toBeInTheDocument()
    })

    test('it should not display the drop down if targetGroups is undefined', async () => {
      renderComponent({ targetGroups: undefined })

      expect(screen.queryByText('cf.percentageRollout.toTargetGroup')).not.toBeInTheDocument()
    })
  })

  test('it should display a row for each variation', async () => {
    renderComponent()

    mockVariations.forEach(({ name, identifier }) => {
      const titleEl = screen.getByText(name || identifier)
      expect(titleEl).toBeInTheDocument()
      expect((titleEl.closest('.variationRow') as HTMLInputElement).querySelector('input')).toBeInTheDocument()
    })
  })

  test('it should display the sum of the variation weights as the total', async () => {
    renderComponent()

    const variationInputs = screen.getAllByRole('spinbutton') // accessible role for a number input
    const total = screen.getByText('0%')

    expect(variationInputs).toHaveLength(3)
    expect(total).toHaveTextContent('0%')

    await userEvent.type(variationInputs[0], '33')
    expect(total).toHaveTextContent('33%')

    await userEvent.type(variationInputs[1], '33')
    expect(total).toHaveTextContent('66%')

    await userEvent.type(variationInputs[2], '34')
    expect(total).toHaveTextContent('100%')
  })

  test('it should display the bucket by input and passed bucket by attributes', async () => {
    const bucketByAttributes = [
      { label: 'Attribute 1', value: 'attr1' },
      { label: 'Attribute 2', value: 'attr2' },
      { label: 'Attribute 3', value: 'attr3' }
    ]
    renderComponent({ bucketByAttributes })

    const bucketByInput = await screen.findByPlaceholderText('- cf.percentageRollout.bucketBy.placeholder -')

    expect(screen.queryByText('cf.percentageRollout.bucketBy.identifierDefault')).not.toBeInTheDocument()
    expect(screen.queryByText('cf.percentageRollout.bucketBy.name')).not.toBeInTheDocument()

    for (const { label } of bucketByAttributes) {
      expect(screen.queryByText(label)).not.toBeInTheDocument()
    }

    await userEvent.click(bucketByInput)

    expect(await screen.findByText('cf.percentageRollout.bucketBy.identifierDefault')).toBeInTheDocument()
    expect(await screen.findByText('cf.percentageRollout.bucketBy.name')).toBeInTheDocument()

    for (const { label } of bucketByAttributes) {
      expect(await screen.findByText(label)).toBeInTheDocument()
    }
  })

  test('it should hide the bucket by input if hideBucketBy is set', async () => {
    renderComponent({ hideBucketBy: true })

    expect(screen.queryByPlaceholderText('- cf.percentageRollout.bucketBy.placeholder -')).not.toBeInTheDocument()
  })
})
