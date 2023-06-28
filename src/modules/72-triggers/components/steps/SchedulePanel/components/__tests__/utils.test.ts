/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  getBreakdownValues,
  getDefaultExpressionBreakdownValues,
  getMilitaryHours,
  getSlashValue,
  getUpdatedExpression,
  isCronValid
} from '../utils'

describe('Test utils methods', () => {
  test('Test getSlashValue', () => {
    expect(getSlashValue({ selectedScheduleTab: 'Minutes', id: 'minutes', value: '25' })).toBe('0/25')
    expect(getSlashValue({ selectedScheduleTab: 'Hourly', id: 'hours', value: '5' })).toBe('0/5')
    expect(getSlashValue({ selectedScheduleTab: 'Monthly', id: 'month', value: '5', startMonth: '2' })).toBe('2/5')
    expect(getSlashValue({ selectedScheduleTab: 'Weekly', id: 'month', value: '5' })).toBe('5')
  })

  test('Test getDefaultExpressionBreakdownValues', () => {
    expect(getDefaultExpressionBreakdownValues('Custom')).toStrictEqual({
      minutes: undefined,
      hours: undefined,
      dayOfMonth: undefined,
      month: undefined,
      dayOfWeek: undefined
    })
    expect(getDefaultExpressionBreakdownValues('Minutes')).toStrictEqual({
      minutes: '5',
      hours: '*',
      amPm: 'AM',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: [],
      expression: '0/5 * * * *'
    })
    expect(getDefaultExpressionBreakdownValues('Hourly')).toStrictEqual({
      minutes: '0',
      hours: '1',
      amPm: 'AM',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: [],
      expression: '0 0/1 * * *'
    })
    expect(getDefaultExpressionBreakdownValues('Daily')).toStrictEqual({
      minutes: '0',
      hours: '1',
      amPm: 'AM',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: [],
      expression: '0 1 * * *'
    })
    expect(getDefaultExpressionBreakdownValues('Weekly')).toStrictEqual({
      minutes: '0',
      hours: '1',
      amPm: 'AM',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: ['MON'],
      expression: '0 1 * * MON'
    })
    expect(getDefaultExpressionBreakdownValues('Monthly')).toStrictEqual({
      minutes: '0',
      hours: '1',
      amPm: 'AM',
      dayOfMonth: '1',
      month: '1',
      dayOfWeek: [],
      startMonth: '1',
      expression: '0 1 1 1/1 *'
    })
    expect(getDefaultExpressionBreakdownValues('Yearly')).toStrictEqual({
      minutes: '0',
      hours: '1',
      amPm: 'AM',
      dayOfMonth: '1',
      month: '1',
      dayOfWeek: [],
      expression: '0 1 1 1 *'
    })
  })

  test('Test getUpdatedExpression', () => {
    expect(getUpdatedExpression({ expression: '* 1 * * *', id: 'minutes', value: '15' })).toBe('15 1 * * *')
    expect(getUpdatedExpression({ expression: '10 1 * * *', id: 'hours', value: '8' })).toBe('10 8 * * *')
    expect(getUpdatedExpression({ expression: '* 1 * * *', id: 'dayOfMonth', value: '15' })).toBe('* 1 15 * *')
    expect(getUpdatedExpression({ expression: '* 1 * * *', id: 'month', value: '8' })).toBe('* 1 * 8 *')
    expect(getUpdatedExpression({ expression: '* 1 * * *', id: 'dayOfWeek', value: '3' })).toBe('* 1 * * 3')
  })
  test('Test getMilitaryHours', () => {
    expect(getMilitaryHours({ hours: '*', amPm: 'AM' })).toBe('*')
    expect(getMilitaryHours({ hours: '10', amPm: 'AM' })).toBe('10')
    expect(getMilitaryHours({ hours: '12', amPm: 'AM' })).toBe('0')
    expect(getMilitaryHours({ hours: '12', amPm: 'PM' })).toBe('12')
    expect(getMilitaryHours({ hours: '2', amPm: 'PM' })).toBe('14')
  })
  test('Test getBreakdownValues', () => {
    expect(getBreakdownValues('5 1 2 3 4')).toEqual({
      minutes: '5',
      hours: '1',
      dayOfMonth: '2',
      month: '3',
      dayOfWeek: []
    })
  })
  test('Test isCronValid', () => {
    expect(isCronValid('0/5 * * * *')).toBeTruthy()
    expect(isCronValid('0/5 * * *')).toBeFalsy()
    expect(isCronValid('0/5 * * * * *', true)).toBeTruthy()
    expect(isCronValid('0/5 * * *', true)).toBeFalsy()
  })
})
