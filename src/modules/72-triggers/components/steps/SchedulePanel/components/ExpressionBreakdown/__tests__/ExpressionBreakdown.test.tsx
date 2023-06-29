/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ExpressionBreakdown, { ActiveInputs, ExpressionBreakdownPropsInterface } from '../ExpressionBreakdown'

const TestComponent: React.FC<ExpressionBreakdownPropsInterface> = ({ formikValues, activeInputs }) => {
  return (
    <TestWrapper>
      <ExpressionBreakdown formikValues={formikValues} activeInputs={activeInputs} />
    </TestWrapper>
  )
}

describe('ExpressionBreakdown', () => {
  test('Test selectedScheduleTab: Minutes', () => {
    const { queryByText, queryAllByText, container } = render(
      <TestComponent
        formikValues={{
          selectedScheduleTab: 'Minutes',
          amPm: 'AM',
          dayOfMonth: '*',
          dayOfWeek: [],
          expression: '0/5 * * * *',
          hours: '*',
          minutes: '5',
          month: '*'
        }}
        activeInputs={[ActiveInputs.MINUTES]}
      />
    )

    expect(container.querySelector('[data-name="expressionBreakdown"]')).toBeInTheDocument()
    expect(container.querySelector('[data-tooltip-id="expressionBreakdown"]')).toBeInTheDocument()
    expect(queryByText('triggers.schedulePanel.expressionBreakdown')).toBeInTheDocument()
    expect(queryByText('triggers.schedulePanel.minutesLabel')).toBeInTheDocument()
    expect(queryByText('triggers.schedulePanel.hoursLabel')).toBeInTheDocument()
    expect(queryByText('triggers.schedulePanel.dayOfMonthLabel')).toBeInTheDocument()
    expect(queryByText('triggers.schedulePanel.monthLabel')).toBeInTheDocument()
    expect(queryByText('triggers.schedulePanel.dayOfWeekLabel')).toBeInTheDocument()
    expect(queryByText('0/5')).toBeInTheDocument()

    // This is based on the expression values
    expect(queryAllByText('*')).toHaveLength(4)

    // Using inactive class to check for the disabled columns in the table.
    expect(container.querySelectorAll('.inactive')).toHaveLength(4)
  })

  test('Test selectedScheduleTab: "Hourly"', () => {
    const { queryByText, queryAllByText, container } = render(
      <TestComponent
        formikValues={{
          selectedScheduleTab: 'Hourly',
          amPm: 'AM',
          dayOfMonth: '*',
          dayOfWeek: [],
          expression: '0 0/1 * * *',
          hours: '1',
          minutes: '0',
          month: '*'
        }}
        activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS]}
      />
    )

    expect(queryByText('0/1')).toBeInTheDocument()

    // This is based on the expression values
    expect(queryAllByText('*')).toHaveLength(3)

    // Using inactive class to check for the disabled columns in the table.
    expect(container.querySelectorAll('.inactive')).toHaveLength(3)
  })

  test('Test selectedScheduleTab: "Daily"', () => {
    const { queryByText, queryAllByText, container } = render(
      <TestComponent
        formikValues={{
          selectedScheduleTab: 'Daily',
          amPm: 'AM',
          dayOfMonth: '*',
          dayOfWeek: [],
          expression: '0 1 * * *',
          hours: '1',
          minutes: '0',
          month: '*'
        }}
        activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS]}
      />
    )

    expect(queryByText('1')).toBeInTheDocument()

    // This is based on the expression values
    expect(queryAllByText('*')).toHaveLength(3)

    // Using inactive class to check for the disabled columns in the table.
    expect(container.querySelectorAll('.inactive')).toHaveLength(3)
  })

  test('Test selectedScheduleTab: "Weekly"', () => {
    const { queryByText, queryAllByText, container } = render(
      <TestComponent
        formikValues={{
          selectedScheduleTab: 'Weekly',
          amPm: 'AM',
          dayOfMonth: '*',
          dayOfWeek: ['TUE', 'WED'],
          expression: '0 1 * * TUE,WED',
          hours: '1',
          minutes: '0',
          month: '*'
        }}
        activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS, ActiveInputs.DAY_OF_WEEK]}
      />
    )

    // Hours
    expect(queryByText('1')).toBeInTheDocument()

    // Day of week
    expect(queryByText('TUE,WED')).toBeInTheDocument()

    // This is based on the expression values
    expect(queryAllByText('*')).toHaveLength(2)

    // Using inactive class to check for the disabled columns in the table.
    expect(container.querySelectorAll('.inactive')).toHaveLength(2)
  })
  test('Test selectedScheduleTab: "Monthly"', () => {
    const { queryByText, queryAllByText, container } = render(
      <TestComponent
        formikValues={{
          selectedScheduleTab: 'Monthly',
          amPm: 'PM',
          dayOfMonth: '5',
          dayOfWeek: [],
          expression: '30 22 5 1/2 *',
          hours: '10',
          minutes: '30',
          month: '2',
          startMonth: '1'
        }}
        activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS, ActiveInputs.DAY_OF_WEEK, ActiveInputs.MONTH]}
      />
    )

    // Minutes
    expect(queryByText('30')).toBeInTheDocument()

    // Hours
    expect(queryByText('22')).toBeInTheDocument()

    // Day of month
    expect(queryByText('5')).toBeInTheDocument()

    // Month
    expect(queryByText('1/2')).toBeInTheDocument()

    // This is based on the expression values
    expect(queryAllByText('*')).toHaveLength(1)

    // Using inactive class to check for the disabled columns in the table.
    expect(container.querySelectorAll('.inactive')).toHaveLength(1)
  })
  test('Test selectedScheduleTab: "Yearly"', () => {
    const { queryByText, queryAllByText, container } = render(
      <TestComponent
        formikValues={{
          selectedScheduleTab: 'Yearly',
          amPm: 'PM',
          dayOfMonth: '1',
          dayOfWeek: [],
          expression: '0 12 1 4 *',
          hours: '12',
          minutes: '0',
          month: '4',
          startMonth: '1'
        }}
        activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS, ActiveInputs.DAY_OF_WEEK, ActiveInputs.MONTH]}
      />
    )

    // Minutes
    expect(queryByText('0')).toBeInTheDocument()

    // Hours
    expect(queryByText('12')).toBeInTheDocument()

    // Day of month
    expect(queryByText('1')).toBeInTheDocument()

    // Month
    expect(queryByText('4')).toBeInTheDocument()

    // This is based on the expression values
    expect(queryAllByText('*')).toHaveLength(1)

    // Using inactive class to check for the disabled columns in the table.
    expect(container.querySelectorAll('.inactive')).toHaveLength(1)
  })
  test('Test selectedScheduleTab: "Custom"', () => {
    const { queryByText } = render(
      <TestComponent
        formikValues={{
          selectedScheduleTab: 'Custom',
          amPm: 'PM',
          expression: '30 12 4 7 MON,WED,FRI',
          breakdownValues: {
            minutes: '30',
            hours: '12',
            dayOfMonth: '4',
            month: '7',
            dayOfWeek: []
          }
        }}
        activeInputs={[
          ActiveInputs.MINUTES,
          ActiveInputs.HOURS,
          ActiveInputs.DAY_OF_MONTH,
          ActiveInputs.MONTH,
          ActiveInputs.DAY_OF_WEEK
        ]}
      />
    )

    // Minutes
    expect(queryByText('30')).toBeInTheDocument()

    // Hours
    expect(queryByText('12')).toBeInTheDocument()

    // Day of month
    expect(queryByText('4')).toBeInTheDocument()

    // Month
    expect(queryByText('7')).toBeInTheDocument()

    // Day of week
    expect(queryByText('MON,WED,FRI')).toBeInTheDocument()

    // All the columns are enabled for Custom
    expect(queryByText('*')).toBeNull()
  })
})
