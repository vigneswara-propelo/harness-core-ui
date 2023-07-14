import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import {
  healthSourcesValidation,
  monitoredServiceRefValidation,
  validateMonitoredService,
  resetFormik,
  isAnExpression
} from '../AnalyzeDeploymentImpactWidget.utils'

describe('healthSourcesValidation', () => {
  const mockGetString = jest.fn(key => `Mocked string: ${key}`)

  test('adds healthSources validation error when monitoredServiceRef is not RUNTIME_INPUT_VALUE, not an expression, and healthSources is empty', () => {
    const monitoredServiceRef = 'exampleRef'
    const healthSources: { identifier: string }[] | undefined = []
    const errors = {}
    const expectedResult = {
      spec: {
        healthSources: 'Mocked string: connectors.cdng.validations.healthSourceRequired'
      }
    }

    const result = healthSourcesValidation(monitoredServiceRef, healthSources, mockGetString, errors)
    expect(result).toEqual(expectedResult)
  })

  test('returns empty errors when monitoredServiceRef is RUNTIME_INPUT_VALUE', () => {
    const monitoredServiceRef = RUNTIME_INPUT_VALUE
    const healthSources: { identifier: string }[] | undefined = []
    const errors = {}
    const result = healthSourcesValidation(monitoredServiceRef, healthSources, mockGetString, errors)
    expect(result).toEqual(errors)
  })

  test('returns empty errors when monitoredServiceRef is an expression', () => {
    const monitoredServiceRef = '<+example>'
    const healthSources: { identifier: string }[] | undefined = []
    const errors = {}
    const result = healthSourcesValidation(monitoredServiceRef, healthSources, mockGetString, errors)
    expect(result).toEqual(errors)
  })

  test('returns empty errors when healthSources is not empty', () => {
    const monitoredServiceRef = 'exampleRef'
    const healthSources = [{ identifier: 'healthSource1' }]
    const errors = {}
    const result = healthSourcesValidation(monitoredServiceRef, healthSources, mockGetString, errors)
    expect(result).toEqual(errors)
  })
})

describe('monitoredServiceRefValidation', () => {
  test('adds monitoredService validation error when monitoredServiceRef is undefined', () => {
    const monitoredServiceRef = undefined
    const expectedResult = {
      spec: {
        monitoredService: {
          spec: {
            monitoredServiceRef: 'Monitored service is required'
          }
        }
      }
    }

    const result = monitoredServiceRefValidation(monitoredServiceRef)
    expect(result).toEqual(expectedResult)
  })

  test('returns empty errors when monitoredServiceRef is defined', () => {
    const monitoredServiceRef = 'exampleRef'
    const errors = {}
    const result = monitoredServiceRefValidation(monitoredServiceRef)
    expect(result).toEqual(errors)
  })
})

describe('validateMonitoredService', () => {
  const mockGetString = jest.fn(key => `Mocked string: ${key}`)

  test('returns the validation errors for monitoredServiceRef and healthSources', () => {
    const monitoredServiceRef = 'exampleRef'
    const healthSources: { identifier: string }[] = []
    const expectedResult = {
      spec: {
        healthSources: 'Mocked string: connectors.cdng.validations.healthSourceRequired'
      }
    }

    const result = validateMonitoredService(monitoredServiceRef, mockGetString, healthSources)
    expect(result).toEqual(expectedResult)
  })

  test('returns empty errors when monitoredServiceRef and healthSources are defined', () => {
    const monitoredServiceRef = 'exampleRef'
    const healthSources = [{ identifier: 'healthSource1' }]
    const errors = {}
    const result = validateMonitoredService(monitoredServiceRef, mockGetString, healthSources)
    expect(result).toEqual(errors)
  })
})

describe('resetFormik', () => {
  const mockResetForm = jest.fn()

  test('resets the formik values with the provided formValues and newSpecs', () => {
    const formValues = {
      spec: { monitoredServiceRef: 'exampleRef', otherField: 'otherValue' }
    } as any
    const newSpecs = { monitoredServiceRef: 'newRef', otherField: 'newValue' } as any
    const formik = { resetForm: mockResetForm } as any

    resetFormik(formValues, newSpecs, formik)
    expect(mockResetForm).toHaveBeenCalledWith({ values: { ...formValues, spec: newSpecs } })
  })
})

describe('isAnExpression', () => {
  test('returns true for an expression starting with "<+"', () => {
    const value = '<+example>'
    const result = isAnExpression(value)
    expect(result).toBe(true)
  })

  test('returns true for an expression starting with "<+" but not equal to RUNTIME_INPUT_VALUE', () => {
    const value = '<+example>'
    const result = isAnExpression(value)
    expect(result).toBe(true)
  })

  test('returns false for any other value', () => {
    const value = 'example'
    const result = isAnExpression(value)
    expect(result).toBe(false)
  })
})
