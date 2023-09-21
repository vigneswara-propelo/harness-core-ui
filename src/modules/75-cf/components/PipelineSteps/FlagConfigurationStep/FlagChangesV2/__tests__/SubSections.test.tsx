/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import SubSections, { SubSectionsProps } from '../SubSections'
import SubSection from '../SubSection'
import { SubSectionComponent } from '../subSection.types'

const FakeSubSection: SubSectionComponent = ({ title, onRemove, prefix }) => {
  return (
    <SubSection title={title} onRemove={onRemove}>
      {prefix('TEST')}
    </SubSection>
  )
}

jest.mock('../subSection.types', () => ({
  subSectionNames: {
    FakeSubSection: 'Fake Subsection Name'
  }
}))

const renderComponent = (props: Partial<SubSectionsProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <Formik onSubmit={jest.fn()} initialValues={{}}>
        <SubSections prefix={jest.fn()} subSections={[FakeSubSection]} onRemove={jest.fn()} {...props} />
      </Formik>
    </TestWrapper>
  )

describe('SubSections', () => {
  test('it should show the no flag changes message when no sub sections have been added', async () => {
    renderComponent({ subSections: [] })

    expect(screen.getByText('cf.pipeline.flagConfiguration.noFlagChanges')).toBeInTheDocument()
  })

  test('it should render passed sub sections', async () => {
    renderComponent({ subSections: [FakeSubSection] })

    expect(screen.getByText('Fake Subsection Name')).toBeInTheDocument()
  })

  test('it should prefix with the appropriate spec path', async () => {
    renderComponent({ prefix: fieldName => fieldName })

    expect(screen.getByText('spec.instructions[0].TEST')).toBeInTheDocument()
  })

  test('it should call the onRemove callback when the remove button is clicked', async () => {
    const onRemoveMock = jest.fn()
    renderComponent({ onRemove: onRemoveMock })

    expect(onRemoveMock).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button'))

    expect(onRemoveMock).toHaveBeenCalledWith(FakeSubSection)
  })
})