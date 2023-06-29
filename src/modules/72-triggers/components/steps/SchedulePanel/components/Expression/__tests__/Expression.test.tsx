/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import Expression from '../Expression'
import { ScheduleTabs } from '../../utils'

const TestComponent: React.FC<{ formikValues: { expression: string; selectedScheduleTab: ScheduleTabs } }> = ({
  formikValues
}) => {
  return (
    <TestWrapper>
      <Expression formikProps={{ values: formikValues }} />
    </TestWrapper>
  )
}

describe('Expression', () => {
  test('No Error case', () => {
    const expression = '0 1 1 1 *'
    const { queryByText, container } = render(
      <TestComponent
        formikValues={{
          expression,
          selectedScheduleTab: 'Yearly'
        }}
      />
    )

    expect(container.querySelector('[data-name="expression"]')).toBeInTheDocument()
    expect(queryByText('triggers.schedulePanel.cronExpression')).toBeInTheDocument()
    expect(container.querySelector('[data-tooltip-id="cronExpression"]')).toBeInTheDocument()
    expect(queryByText(expression)).toBeInTheDocument()
  })
  test('Error case', () => {
    const expression = '0 1 1 1'
    const { queryByText, container } = render(
      <TestComponent
        formikValues={{
          expression,
          selectedScheduleTab: 'Custom'
        }}
      />
    )

    expect(queryByText(expression)).toBeInTheDocument()

    // Checking with class name as we are using class to style the component in case of error
    expect(container.getElementsByClassName('errorField')).toHaveLength(1)
  })
})
