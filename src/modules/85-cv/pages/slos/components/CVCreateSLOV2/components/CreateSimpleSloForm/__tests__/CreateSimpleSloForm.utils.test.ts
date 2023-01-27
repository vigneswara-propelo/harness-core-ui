/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { SLIMetricTypes } from '../../../CVCreateSLOV2.types'
import { validateConfigureServiceLevelIndicatiors } from '../CreateSimpleSloForm.utils'

describe('validateConfigureServiceLevelIndicatiors', () => {
  test('should return true when all required fields have valid input', () => {
    const formikProps = {
      values: {
        SLIMetricType: SLIMetricTypes.RATIO,
        validRequestMetric: 'valid_metric',
        goodRequestMetric: 'good_metric',
        objectiveComparator: '>',
        objectiveValue: 50,
        SLIMissingDataType: 'omit',
        eventType: 'good'
      },
      setTouched: jest.fn()
    }
    expect(validateConfigureServiceLevelIndicatiors(formikProps as any)).toBe(true)
  })

  test('should return false when SLIMetricType is missing', () => {
    const formikProps = {
      values: {
        validRequestMetric: 'valid_metric',
        goodRequestMetric: 'good_metric',
        objectiveComparator: '>',
        objectiveValue: 50,
        SLIMissingDataType: 'omit'
      },
      setTouched: jest.fn()
    }
    expect(validateConfigureServiceLevelIndicatiors(formikProps as any)).toBe(false)
  })

  test('should return false when goodRequestMetric equals validRequestMetric', () => {
    const formikProps = {
      values: {
        SLIMetricType: SLIMetricTypes.RATIO,
        validRequestMetric: 'valid_metric',
        goodRequestMetric: 'valid_metric',
        objectiveComparator: '>',
        objectiveValue: 50,
        SLIMissingDataType: 'omit'
      },
      setTouched: jest.fn()
    }
    expect(validateConfigureServiceLevelIndicatiors(formikProps as any)).toBe(false)
  })

  test('should return false when validRequestMetric is missing for SLIMetricType RATIO', () => {
    const formikProps = {
      values: {
        SLIMetricType: SLIMetricTypes.RATIO,
        goodRequestMetric: 'good_metric',
        objectiveComparator: '>',
        objectiveValue: 50,
        SLIMissingDataType: 'omit'
      },
      setTouched: jest.fn()
    }
    expect(validateConfigureServiceLevelIndicatiors(formikProps as any)).toBe(false)
  })

  test('should return false when goodRequestMetric is missing for SLIMetricType RATIO', () => {
    const formikProps = {
      values: {
        SLIMetricType: SLIMetricTypes.RATIO,
        validRequestMetric: 'valid_metric',
        objectiveComparator: '>',
        objectiveValue: 50,
        SLIMissingDataType: 'omit'
      },
      setTouched: jest.fn()
    }
    expect(validateConfigureServiceLevelIndicatiors(formikProps as any)).toBe(false)
  })

  test('should return false when objectiveComparator is missing', () => {
    const formikProps = {
      values: {
        SLIMetricType: SLIMetricTypes.RATIO,
        validRequestMetric: 'valid_metric',
        goodRequestMetric: 'good_metric',
        objectiveValue: 50,
        SLIMissingDataType: 'omit'
      },
      setTouched: jest.fn()
    }
    expect(validateConfigureServiceLevelIndicatiors(formikProps as any)).toBe(false)
  })

  test('should return false when objectiveValue is missing', () => {
    const formikProps = {
      values: {
        SLIMetricType: SLIMetricTypes.RATIO,
        validRequestMetric: 'valid_metric',
        goodRequestMetric: 'good_metric',
        objectiveComparator: '>',
        SLIMissingDataType: 'omit'
      },
      setTouched: jest.fn()
    }
    expect(validateConfigureServiceLevelIndicatiors(formikProps as any)).toBe(false)
  })

  test('should return false when objectiveValue is less than 0', () => {
    const formikProps = {
      values: {
        SLIMetricType: SLIMetricTypes.RATIO,
        validRequestMetric: 'valid_metric',
        goodRequestMetric: 'good_metric',
        objectiveComparator: '>',
        objectiveValue: -1,
        SLIMissingDataType: 'omit'
      },
      setTouched: jest.fn()
    }
    expect(validateConfigureServiceLevelIndicatiors(formikProps as any)).toBe(false)
  })

  test('should return false when objectiveValue is greater than 99', () => {
    const formikProps = {
      values: {
        SLIMetricType: SLIMetricTypes.RATIO,
        validRequestMetric: 'valid_metric',
        goodRequestMetric: 'good_metric',
        objectiveComparator: '>',
        objectiveValue: 100,
        SLIMissingDataType: 'omit'
      },
      setTouched: jest.fn()
    }
    expect(validateConfigureServiceLevelIndicatiors(formikProps as any)).toBe(false)
  })

  test('should return false when SLIMissingDataType is missing', () => {
    const formikProps = {
      values: {
        SLIMetricType: SLIMetricTypes.RATIO,
        validRequestMetric: 'valid_metric',
        goodRequestMetric: 'good_metric',
        objectiveComparator: '>',
        objectiveValue: 50
      },
      setTouched: jest.fn()
    }
    expect(validateConfigureServiceLevelIndicatiors(formikProps as any)).toBe(false)
  })
})