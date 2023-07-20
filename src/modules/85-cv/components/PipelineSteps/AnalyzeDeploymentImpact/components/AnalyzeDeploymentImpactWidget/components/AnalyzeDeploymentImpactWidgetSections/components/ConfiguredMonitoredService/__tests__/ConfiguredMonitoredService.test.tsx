/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypes, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, useParams } from 'react-router-dom'
import { MonitoredServiceDTO, MonitoredServiceWithHealthSources, useGetMonitoredService } from 'services/cv'
import { AnalyzeDeploymentImpactData } from '@cv/components/PipelineSteps/AnalyzeDeploymentImpact/AnalyzeDeploymentImpact.types'
import {
  isMonitoredServiceFixedInput,
  getMonitoredServiceOptions,
  getDefaultOption,
  isServiceAndEnvNotFixed,
  isMonitoredServiceValidFixedInput,
  getMonitoredServiceIdentifier,
  getUpdatedSpecs,
  getIsMonitoredServiceDefaultInput,
  getShouldFetchMonitoredServiceData,
  updateAnalyseImpactFormik,
  checkIfMonitoredServiceIsNotPresent,
  getShouldRenderNotifications
} from '../ConfiguredMonitoredService.utils'
import ConfiguredMonitoredService from '../ConfiguredMonitoredService'
import {
  mockedAnalyseFormData,
  mockedMonitoredService,
  mockedMonitoredServiceForFetchingDetails
} from './ConfiguredMonitoredService.mock'
import { MONITORED_SERVICE_NOT_PRESENT_ERROR } from '../ConfiguredMonitoredService.constants'

const serviceEnvironmentProps = {
  serviceIdentifier: 'service101',
  environmentIdentifier: 'environment101',
  hasMultiServiceOrEnv: false
}

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

  test('renders Monitored service input box when monitored service is not set up', () => {
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
        <ConfiguredMonitoredService {...serviceEnvironmentProps} allowableTypes={allowableTypes} formik={formik} />
      </MemoryRouter>
    )

    const monitoredServiceDisplay = screen.getByText('connectors.cdng.monitoredService.monitoredServiceDef')
    expect(monitoredServiceDisplay).toBeInTheDocument()
  })

  test('renders monitored service when monitored service value in formik is valid', () => {
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

    const { getAllByText } = render(
      <MemoryRouter>
        <ConfiguredMonitoredService {...serviceEnvironmentProps} allowableTypes={allowableTypes} formik={formik} />
      </MemoryRouter>
    )

    expect(getAllByText('cv.monitoredServices.heading').length).toEqual(2)
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
        <ConfiguredMonitoredService {...serviceEnvironmentProps} allowableTypes={allowableTypes} formik={formik} />
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
        <ConfiguredMonitoredService {...serviceEnvironmentProps} allowableTypes={allowableTypes} formik={formik} />
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
        <ConfiguredMonitoredService {...serviceEnvironmentProps} allowableTypes={allowableTypes} formik={formik} />
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
          monitoredService: {
            type: 'Configured',
            monitoredServiceRef: 'service_env'
          }
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
        <ConfiguredMonitoredService {...serviceEnvironmentProps} allowableTypes={allowableTypes} formik={formik} />
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
        monitoredService: {
          type: 'Configured',
          spec: {
            monitoredServiceRef: 'service_env'
          }
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

    render(
      <MemoryRouter>
        <ConfiguredMonitoredService {...serviceEnvironmentProps} allowableTypes={allowableTypes} formik={formik} />
      </MemoryRouter>
    )

    const monitoredServiceDisplay = screen.getByText('connectors.cdng.monitoredService.monitoredServiceDef')
    expect(monitoredServiceDisplay).toBeInTheDocument()
  })

  test('renders correct ux for default when we have multi services and environment', () => {
    const allowableTypes = [
      MultiTypeInputType.FIXED,
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.EXPRESSION
    ] as AllowedTypes
    const formik = {
      values: {
        spec: {
          monitoredServiceRef: 'Default'
        }
      },
      setFieldValue: jest.fn(),
      validateForm: jest.fn()
    } as any

    ;(useGetMonitoredService as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: {},
      error: null,
      refetch: jest.fn()
    }))

    const { queryByText } = render(
      <MemoryRouter>
        <ConfiguredMonitoredService
          {...{
            serviceIdentifier: '',
            environmentIdentifier: '',
            hasMultiServiceOrEnv: true
          }}
          allowableTypes={allowableTypes}
          formik={formik}
        />
      </MemoryRouter>
    )

    const monitoredServiceDisplay = screen.getByText('connectors.cdng.monitoredService.monitoredServiceDef')
    expect(monitoredServiceDisplay).toBeInTheDocument()
    expect(queryByText('Health Source')).not.toBeInTheDocument()
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
  test('should return true if monitoredServiceRef is a valid fixed input', () => {
    const monitoredServiceRef = 'fixedInput1'

    const result = isMonitoredServiceValidFixedInput(monitoredServiceRef)

    expect(result).toBe(true)
  })

  test('should return false if monitoredServiceRef is not a valid fixed input', () => {
    const monitoredServiceRef = '<+input>'

    const result = isMonitoredServiceValidFixedInput(monitoredServiceRef)

    expect(result).toBe(false)
  })
})

describe('getIsMonitoredServiceDefaultInput', () => {
  test('should return true if monitoredServiceRef is DEFAULT_VALUE and serviceIdentifier and environmentIdentifier are not fixed', () => {
    const monitoredServiceRef = 'Default'
    const serviceIdentifier = 'service1'
    const environmentIdentifier = '<+input>'

    const result = getIsMonitoredServiceDefaultInput(monitoredServiceRef, serviceIdentifier, environmentIdentifier)

    expect(result).toBe(true)
  })

  test('should return false if monitoredServiceRef is not DEFAULT_VALUE', () => {
    const monitoredServiceRef = '<+input>'
    const serviceIdentifier = 'service1'
    const environmentIdentifier = 'env1'

    const result = getIsMonitoredServiceDefaultInput(monitoredServiceRef, serviceIdentifier, environmentIdentifier)

    expect(result).toBe(false)
  })

  test('should return false if serviceIdentifier is fixed', () => {
    const monitoredServiceRef = 'DEFAULT_VALUE'
    const serviceIdentifier = 'fixedService'
    const environmentIdentifier = 'env1'

    const result = getIsMonitoredServiceDefaultInput(monitoredServiceRef, serviceIdentifier, environmentIdentifier)

    expect(result).toBe(false)
  })

  test('should return false if environmentIdentifier is fixed', () => {
    const monitoredServiceRef = 'DEFAULT_VALUE'
    const serviceIdentifier = 'service1'
    const environmentIdentifier = 'fixedEnv'

    const result = getIsMonitoredServiceDefaultInput(monitoredServiceRef, serviceIdentifier, environmentIdentifier)

    expect(result).toBe(false)
  })

  // Add more test cases as needed
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
      monitoredService: {
        type: 'Configured',
        spec: {
          monitoredServiceRef: 'exampleRef'
        }
      }
    } as any
    const monitoredServiceRef = 'exampleRef'
    const expectedResult = {
      monitoredService: { type: 'Configured', spec: { monitoredServiceRef: 'exampleRef' } },
      healthSources: [{ identifier: 'healthSource1' }, { identifier: 'healthSource2' }]
    }

    const result = getUpdatedSpecs(monitoredServiceData, formValues, monitoredServiceRef)
    expect(result).toEqual(expectedResult)
  })

  test('returns the updated spec with empty healthSources when monitoredServiceData is undefined', () => {
    const monitoredServiceData = undefined
    const formValues = {
      monitoredService: {
        spec: {
          monitoredServiceRef: 'exampleRef'
        }
      }
    } as any
    const monitoredServiceRef = 'exampleRef'
    const expectedResult = {
      monitoredService: { type: 'Configured', spec: { monitoredServiceRef: 'exampleRef' } },
      healthSources: []
    }

    const result = getUpdatedSpecs(monitoredServiceData, formValues, monitoredServiceRef)
    expect(result).toEqual(expectedResult)
  })
})

describe('getShouldFetchMonitoredServiceData', () => {
  test('should update formik and return false if isMonitoredServiceDefaultInput is true', () => {
    const monitoredService = mockedMonitoredServiceForFetchingDetails as MonitoredServiceDTO
    const formValues = mockedAnalyseFormData as AnalyzeDeploymentImpactData
    const monitoredServiceRef = '<+input>'
    const setFieldValue = jest.fn()
    const isMonitoredServiceDefaultInput = true

    const result = getShouldFetchMonitoredServiceData({
      isMonitoredServiceDefaultInput,
      monitoredService,
      formValues,
      monitoredServiceRef,
      setFieldValue
    })

    expect(result).toBe(false)
  })

  test('should update formik and return false if monitoredServiceRef is "runtime"', () => {
    const monitoredService = mockedMonitoredServiceForFetchingDetails as MonitoredServiceDTO
    const formValues = mockedAnalyseFormData as AnalyzeDeploymentImpactData
    const monitoredServiceRef = '<+input>'
    const setFieldValue = jest.fn()
    const isMonitoredServiceDefaultInput = false

    const result = getShouldFetchMonitoredServiceData({
      isMonitoredServiceDefaultInput,
      monitoredService,
      formValues,
      monitoredServiceRef,
      setFieldValue
    })

    expect(result).toBe(false)
  })

  test('should set isMonitoredServiceDefaultInput to false and return the result of isMonitoredServiceValidFixedInput if monitoredServiceRef is not "runtime"', () => {
    const monitoredService = mockedMonitoredServiceForFetchingDetails as MonitoredServiceDTO
    const formValues = mockedAnalyseFormData as AnalyzeDeploymentImpactData
    const monitoredServiceRef = 'fixed'
    const setFieldValue = jest.fn()
    const isMonitoredServiceDefaultInput = false

    const result = getShouldFetchMonitoredServiceData({
      isMonitoredServiceDefaultInput,
      monitoredService,
      formValues,
      monitoredServiceRef,
      setFieldValue
    })

    expect(setFieldValue).toHaveBeenCalledWith('spec.isMonitoredServiceDefaultInput', false)
    expect(result).toBe(true)
  })
})

describe('updateAnalyseImpactFormik', () => {
  test('should update the formik spec with monitoredService and isMonitoredServiceDefaultInput', () => {
    const monitoredService = mockedMonitoredServiceForFetchingDetails as MonitoredServiceDTO
    const formValues = mockedAnalyseFormData as AnalyzeDeploymentImpactData
    const monitoredServiceRef = '<+input>'
    const setFieldValue = jest.fn()
    const isMonitoredServiceDefaultInput = true

    updateAnalyseImpactFormik({
      monitoredService,
      formValues,
      monitoredServiceRef,
      setFieldValue,
      isMonitoredServiceDefaultInput
    })

    const newSpecs = {
      duration: '1D',
      healthSources: [
        {
          identifier: 'cd'
        }
      ],
      isMonitoredServiceDefaultInput: true,
      monitoredService: {
        spec: {
          monitoredServiceRef: '<+input>'
        },
        type: 'Configured'
      },
      monitoredServiceRef: ''
    }
    expect(setFieldValue).toHaveBeenCalledWith('spec', newSpecs)
  })
})

describe('checkIfMonitoredServiceIsNotPresent', () => {
  test('should return true if the message includes the invalid request and is not present error', () => {
    const message = 'Invalid request: Monitored Source Entity with identifier abc is not present'
    const monitoredServiceRef = 'abc'

    const result = checkIfMonitoredServiceIsNotPresent(message, monitoredServiceRef)

    expect(result).toBe(true)
  })

  test('should return false if the message does not include the invalid request and is not present error', () => {
    const message = 'Some other error message'
    const monitoredServiceRef = 'abc'

    const result = checkIfMonitoredServiceIsNotPresent(message, monitoredServiceRef)

    expect(result).toBe(false)
  })
})

describe('getShouldRenderNotifications', () => {
  test('should return true if the monitored service error message does not indicate "is not present" and shouldFetchMonitoredServiceDetails is true', () => {
    const monitoredServiceError = { data: new Error('Some other error'), message: 'Some error' }
    const monitoredServiceIdentifier = 'abc'
    const shouldFetchMonitoredServiceDetails = true

    const result = getShouldRenderNotifications(
      monitoredServiceError,
      monitoredServiceIdentifier,
      shouldFetchMonitoredServiceDetails
    )

    expect(result).toBe(true)
  })

  test('should return false if shouldFetchMonitoredServiceDetails is false', () => {
    const monitoredServiceError = { data: { message: 'error response' }, message: 'Some error' }
    const monitoredServiceIdentifier = 'abc'
    const shouldFetchMonitoredServiceDetails = false

    const result = getShouldRenderNotifications(
      monitoredServiceError,
      monitoredServiceIdentifier,
      shouldFetchMonitoredServiceDetails
    )

    expect(result).toBe(false)
  })
})
