import { AllowedTypes, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, useParams } from 'react-router-dom'
import {
  MonitoredServiceDTO,
  MonitoredServiceWithHealthSources,
  ResponseMonitoredServiceResponse,
  useGetMonitoredService
} from 'services/cv'
import {
  isMonitoredServiceFixedInput,
  isFirstTimeOpenForConfiguredMonitoredSvc,
  getMonitoredServiceOptions,
  getDefaultOption,
  isServiceAndEnvNotFixed,
  isMonitoredServiceValidFixedInput,
  getMonitoredServiceIdentifier,
  getMonitoredServiceNotPresentErrorMessage,
  getUpdatedSpecs
} from '../ConfiguredMonitoredService.utils'
import ConfiguredMonitoredService from '../ConfiguredMonitoredService'
import { mockedMonitoredService } from './ConfiguredMonitoredService.mock'
import { MONITORED_SERVICE_NOT_PRESENT_ERROR } from '../ConfiguredMonitoredService.constants'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn()
}))

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

jest.mock('services/cv', () => ({
  useGetMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: {}, error: null, refetch: jest.fn() })),
  useGetAllMonitoredServicesWithTimeSeriesHealthSources: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: {}, error: null })),
  useGetNotificationRulesForMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() }))
}))

describe('ConfiguredMonitoredService', () => {
  beforeEach(() => {
    ;(useParams as any).mockReturnValue({
      accountId: 'mock-account',
      orgIdentifier: 'mock-org',
      projectIdentifier: 'mock-project'
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders "Monitored Service not set up" message when monitored service is not set up', () => {
    const allowableTypes = [
      MultiTypeInputType.FIXED,
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.EXPRESSION
    ] as AllowedTypes
    const formik = {
      values: {
        spec: {
          monitoredServiceRef: ''
        }
      },
      setFieldValue: jest.fn(),
      validateForm: jest.fn()
    } as any

    render(
      <MemoryRouter>
        <ConfiguredMonitoredService allowableTypes={allowableTypes} formik={formik} />
      </MemoryRouter>
    )

    const monitoredServiceDisplay = screen.getByText('connectors.cdng.monitoredService.monitoredServiceDef')
    expect(monitoredServiceDisplay).toBeInTheDocument()
  })

  test('renders AnalyseStepHealthSourcesList when monitored service is valid', () => {
    const allowableTypes: AllowedTypes = []
    const formik = {
      values: {
        spec: {
          monitoredServiceRef: 'mock-monitored-service'
        }
      },
      setFieldValue: jest.fn(),
      validateForm: jest.fn()
    } as any

    render(
      <MemoryRouter>
        <ConfiguredMonitoredService allowableTypes={allowableTypes} formik={formik} />
      </MemoryRouter>
    )

    const healthSourcesList = screen.getByText('Health Source')
    expect(healthSourcesList).toBeInTheDocument()
  })

  test('does not render AnalyseStepNotifications when monitored service is not valid', () => {
    const allowableTypes: AllowedTypes = []
    const formik = {
      values: {
        spec: {
          monitoredServiceRef: ''
        }
      },
      setFieldValue: jest.fn(),
      validateForm: jest.fn()
    } as any

    render(
      <MemoryRouter>
        <ConfiguredMonitoredService allowableTypes={allowableTypes} formik={formik} />
      </MemoryRouter>
    )

    const notifications = screen.queryByTestId('analyseStepNotifications')
    expect(notifications).toBeNull()
  })

  test('renders correct message when monitored service is in loading state', () => {
    const allowableTypes = [
      MultiTypeInputType.FIXED,
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.EXPRESSION
    ] as AllowedTypes
    const formik = {
      values: {
        spec: {
          monitoredServiceRef: ''
        }
      },
      setFieldValue: jest.fn(),
      validateForm: jest.fn()
    } as any

    ;(useGetMonitoredService as jest.Mock).mockImplementation(() => ({
      loading: true,
      data: {},
      error: false
    }))

    const { getByText } = render(
      <MemoryRouter>
        <ConfiguredMonitoredService allowableTypes={allowableTypes} formik={formik} />
      </MemoryRouter>
    )

    const monitoredServiceDisplay = screen.getByText('connectors.cdng.monitoredService.monitoredServiceDef')
    expect(monitoredServiceDisplay).toBeInTheDocument()
    expect(getByText('cv.analyzeStep.monitoredService.fetchingMonitoredService')).toBeInTheDocument()
  })

  test('renders correct message when fetching monitored service errors out', () => {
    const allowableTypes = [
      MultiTypeInputType.FIXED,
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.EXPRESSION
    ] as AllowedTypes
    const formik = {
      values: {
        spec: {
          monitoredServiceRef: ''
        }
      },
      setFieldValue: jest.fn(),
      validateForm: jest.fn()
    } as any

    ;(useGetMonitoredService as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: null,
      error: {
        data: {
          message: MONITORED_SERVICE_NOT_PRESENT_ERROR
        }
      }
    }))

    const { container } = render(
      <MemoryRouter>
        <ConfiguredMonitoredService allowableTypes={allowableTypes} formik={formik} />
      </MemoryRouter>
    )

    const monitoredServiceDisplay = screen.getByText('connectors.cdng.monitoredService.monitoredServiceDef')
    expect(monitoredServiceDisplay).toBeInTheDocument()
    const monitoredServiceInput = container.querySelector(
      '[name="spec.monitoredService.spec.monitoredServiceRef"]'
    ) as HTMLInputElement
    expect(monitoredServiceInput.value).toEqual('')
  })

  test('renders correct ux when no monitored service exists for selected service and env.', () => {
    const allowableTypes = [
      MultiTypeInputType.FIXED,
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.EXPRESSION
    ] as AllowedTypes
    const formik = {
      values: {
        spec: {
          monitoredServiceRef: 'service_env'
        }
      },
      setFieldValue: jest.fn(),
      validateForm: jest.fn()
    } as any

    ;(useGetMonitoredService as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: null,
      error: {
        data: {
          message: `Invalid request: Monitored Source Entity with identifier ${formik.values.spec.monitoredServiceRef} is not present`
        }
      },
      refetch: jest.fn()
    }))

    const { getByText } = render(
      <MemoryRouter>
        <ConfiguredMonitoredService allowableTypes={allowableTypes} formik={formik} />
      </MemoryRouter>
    )

    const monitoredServiceDisplay = screen.getByText('connectors.cdng.monitoredService.monitoredServiceDef')
    expect(monitoredServiceDisplay).toBeInTheDocument()
    expect(getByText('cv.analyzeStep.monitoredService.monitoredServiceNotPresent')).toBeInTheDocument()
  })

  test('renders correct ux when monitored service exists for selected service and env.', () => {
    const allowableTypes = [
      MultiTypeInputType.FIXED,
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.EXPRESSION
    ] as AllowedTypes
    const formik = {
      values: {
        spec: {
          monitoredServiceRef: 'service_env'
        }
      },
      setFieldValue: jest.fn(),
      validateForm: jest.fn()
    } as any

    ;(useGetMonitoredService as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: mockedMonitoredService,
      error: null,
      refetch: jest.fn()
    }))

    const { getByText } = render(
      <MemoryRouter>
        <ConfiguredMonitoredService allowableTypes={allowableTypes} formik={formik} />
      </MemoryRouter>
    )

    const monitoredServiceDisplay = screen.getByText('connectors.cdng.monitoredService.monitoredServiceDef')
    expect(monitoredServiceDisplay).toBeInTheDocument()
    expect(getByText('Health Source')).toBeInTheDocument()
  })
})

describe('isMonitoredServiceFixedInput', () => {
  test('returns true when monitoredServiceRef is not RUNTIME_INPUT_VALUE and not an expression', () => {
    const monitoredServiceRef = 'example'
    const result = isMonitoredServiceFixedInput(monitoredServiceRef)
    expect(result).toBe(true)
  })

  test('returns false when monitoredServiceRef is RUNTIME_INPUT_VALUE', () => {
    const monitoredServiceRef = RUNTIME_INPUT_VALUE
    const result = isMonitoredServiceFixedInput(monitoredServiceRef)
    expect(result).toBe(false)
  })

  test('returns false when monitoredServiceRef is an expression', () => {
    const monitoredServiceRef = '<+ example >'
    const result = isMonitoredServiceFixedInput(monitoredServiceRef)
    expect(result).toBe(false)
  })
})

describe('isFirstTimeOpenForConfiguredMonitoredSvc', () => {
  test('returns true when formValues.spec.monitoredServiceRef is empty and monitoredServiceData contains identifier', () => {
    const formValues = { spec: { monitoredServiceRef: '' } } as any
    const monitoredServiceData = {
      data: { monitoredService: { identifier: 'example' } }
    } as ResponseMonitoredServiceResponse
    const result = isFirstTimeOpenForConfiguredMonitoredSvc(formValues, monitoredServiceData)
    expect(result).toBe(true)
  })

  test('returns false when formValues.spec.monitoredServiceRef is not empty', () => {
    const formValues = { spec: { monitoredServiceRef: 'example' } } as any
    const monitoredServiceData = {
      data: { monitoredService: { identifier: 'example' } }
    } as ResponseMonitoredServiceResponse
    const result = isFirstTimeOpenForConfiguredMonitoredSvc(formValues, monitoredServiceData)
    expect(result).toBe(false)
  })

  test('returns false when monitoredServiceData does not contain identifier', () => {
    const formValues = { spec: { monitoredServiceRef: '' } } as any
    const monitoredServiceData = { data: { monitoredService: {} } } as ResponseMonitoredServiceResponse
    const result = isFirstTimeOpenForConfiguredMonitoredSvc(formValues, monitoredServiceData)
    expect(result).toBe(false)
  })

  test('returns false when monitoredServiceData is null', () => {
    const formValues = { spec: { monitoredServiceRef: '' } } as any
    const monitoredServiceData = null
    const result = isFirstTimeOpenForConfiguredMonitoredSvc(formValues, monitoredServiceData)
    expect(result).toBe(false)
  })
})

describe('getMonitoredServiceOptions', () => {
  test('returns the options array with the default option and monitored service options', () => {
    const serviceIdentifier = 'service1'
    const environmentIdentifier = 'env1'
    const monitoredServiceWithHealthSources = [
      { name: 'Service 1', identifier: 'service1' },
      { name: 'Service 2', identifier: 'service2' }
    ]
    const expectedResult = [
      { label: `Default (${serviceIdentifier}_${environmentIdentifier})`, value: 'Default' },
      { label: 'Service 1', value: 'service1' },
      { label: 'Service 2', value: 'service2' }
    ]

    const result = getMonitoredServiceOptions(
      serviceIdentifier,
      environmentIdentifier,
      monitoredServiceWithHealthSources
    )
    expect(result).toEqual(expectedResult)
  })

  test('returns the options array with only the default option when monitoredServiceWithHealthSources is empty', () => {
    const serviceIdentifier = 'service1'
    const environmentIdentifier = 'env1'
    const monitoredServiceWithHealthSources: MonitoredServiceWithHealthSources[] = []
    const expectedResult = [{ label: `Default (${serviceIdentifier}_${environmentIdentifier})`, value: 'Default' }]

    const result = getMonitoredServiceOptions(
      serviceIdentifier,
      environmentIdentifier,
      monitoredServiceWithHealthSources
    )
    expect(result).toEqual(expectedResult)
  })

  test('returns the options array with only the default option when monitoredServiceWithHealthSources is undefined', () => {
    const serviceIdentifier = 'service1'
    const environmentIdentifier = 'env1'
    const monitoredServiceWithHealthSources = undefined
    const expectedResult = [{ label: `Default (${serviceIdentifier}_${environmentIdentifier})`, value: 'Default' }]

    const result = getMonitoredServiceOptions(
      serviceIdentifier,
      environmentIdentifier,
      monitoredServiceWithHealthSources
    )
    expect(result).toEqual(expectedResult)
  })
})

describe('getDefaultOption', () => {
  test('returns the default option with fixed values in the label', () => {
    const serviceIdentifier = 'service1'
    const environmentIdentifier = 'env1'
    const expectedResult = { label: `Default (${serviceIdentifier}_${environmentIdentifier})`, value: 'Default' }

    const result = getDefaultOption(serviceIdentifier, environmentIdentifier)
    expect(result).toEqual(expectedResult)
  })

  test('returns the default option with input placeholder in the label', () => {
    const serviceIdentifier = '<+ service >'
    const environmentIdentifier = '<+ environment >'
    const expectedResult = { label: 'Default <+input>', value: 'Default' }

    const result = getDefaultOption(serviceIdentifier, environmentIdentifier)
    expect(result).toEqual(expectedResult)
  })
})

describe('isServiceAndEnvNotFixed', () => {
  test('returns true when either serviceIdentifier or environmentIdentifier is not fixed', () => {
    const serviceIdentifier = 'service1'
    const environmentIdentifier = '<+ environment >'
    const result = isServiceAndEnvNotFixed(serviceIdentifier, environmentIdentifier)
    expect(result).toBe(true)
  })

  test('returns false when both serviceIdentifier and environmentIdentifier are fixed', () => {
    const serviceIdentifier = 'service1'
    const environmentIdentifier = 'env1'
    const result = isServiceAndEnvNotFixed(serviceIdentifier, environmentIdentifier)
    expect(result).toBe(false)
  })
})

describe('isMonitoredServiceValidFixedInput', () => {
  test('returns true when monitoredServiceRef is fixed and both serviceIdentifier and environmentIdentifier are fixed', () => {
    const monitoredServiceRef = 'example'
    const serviceIdentifier = 'service1'
    const environmentIdentifier = 'env1'
    const result = isMonitoredServiceValidFixedInput(monitoredServiceRef, serviceIdentifier, environmentIdentifier)
    expect(result).toBe(true)
  })

  test('returns false when monitoredServiceRef is not fixed', () => {
    const monitoredServiceRef = '<+ example >'
    const serviceIdentifier = 'service1'
    const environmentIdentifier = 'env1'
    const result = isMonitoredServiceValidFixedInput(monitoredServiceRef, serviceIdentifier, environmentIdentifier)
    expect(result).toBe(false)
  })
})

describe('getMonitoredServiceIdentifier', () => {
  test('returns the monitoredServiceRef when it is not "Default"', () => {
    const monitoredServiceRef = 'example'
    const serviceIdentifier = 'service1'
    const environmentIdentifier = 'env1'
    const result = getMonitoredServiceIdentifier(monitoredServiceRef, serviceIdentifier, environmentIdentifier)
    expect(result).toBe(monitoredServiceRef)
  })

  test('returns the concatenated string when monitoredServiceRef is "Default"', () => {
    const monitoredServiceRef = 'Default'
    const serviceIdentifier = 'service1'
    const environmentIdentifier = 'env1'
    const expectedResult = `${serviceIdentifier}_${environmentIdentifier}`
    const result = getMonitoredServiceIdentifier(monitoredServiceRef, serviceIdentifier, environmentIdentifier)
    expect(result).toBe(expectedResult)
  })
})

describe('getUpdatedSpecs', () => {
  test('returns the updated spec with the provided monitoredServiceData, formValues, and monitoredServiceRef', () => {
    const monitoredServiceData = {
      sources: {
        healthSources: [{ identifier: 'healthSource1' }, { identifier: 'healthSource2' }]
      }
    } as MonitoredServiceDTO
    const formValues = {
      spec: {
        monitoredServiceRef: 'exampleRef',
        otherField: 'otherValue'
      }
    } as any
    const monitoredServiceRef = 'updatedRef'
    const expectedResult = {
      monitoredService: { type: 'Configured', spec: { monitoredServiceRef: 'updatedRef' } },
      healthSources: [{ identifier: 'healthSource1' }, { identifier: 'healthSource2' }],
      monitoredServiceRef: 'updatedRef',
      otherField: 'otherValue'
    }

    const result = getUpdatedSpecs(monitoredServiceData, formValues, monitoredServiceRef)
    expect(result).toEqual(expectedResult)
  })

  test('returns the updated spec with empty healthSources when monitoredServiceData is undefined', () => {
    const monitoredServiceData = undefined
    const formValues = {
      spec: {
        monitoredServiceRef: 'exampleRef',
        otherField: 'otherValue'
      }
    } as any
    const monitoredServiceRef = 'updatedRef'
    const expectedResult = {
      monitoredService: { type: 'Configured', spec: { monitoredServiceRef: 'updatedRef' } },
      healthSources: [],
      monitoredServiceRef: 'updatedRef',
      otherField: 'otherValue'
    }

    const result = getUpdatedSpecs(monitoredServiceData, formValues, monitoredServiceRef)
    expect(result).toEqual(expectedResult)
  })
})

describe('getMonitoredServiceNotPresentErrorMessage', () => {
  test('returns the error message with the provided monitoredServiceRef', () => {
    const monitoredServiceRef = 'exampleRef'
    const expectedResult = 'Invalid request: Monitored Source Entity with identifier exampleRef is not present'
    const result = getMonitoredServiceNotPresentErrorMessage(monitoredServiceRef)
    expect(result).toBe(expectedResult)
  })
})
