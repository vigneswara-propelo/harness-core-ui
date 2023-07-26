/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import * as cdService from 'services/cd-ng'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { AnalyzeDeploymentImpact } from '../AnalyzeDeploymentImpact'
import {
  mockedMonitoredServiceAndHealthSources,
  PipelineResponse,
  ANALYZE_STEP_INITIAL_VALUES
} from './AnalyzeDeploymentImpactMocks'
import {
  getMonitoredServiceYamlData,
  getMonitoredServiceRef,
  getSpecFormData,
  validateField,
  validateMonitoredServiceForRunTimeView,
  checkIfRunTimeInput
} from '../AnalyzeDeploymentImpact.utils'
import { AnalyzeDeploymentImpactData } from '../AnalyzeDeploymentImpact.types'
import { MONITORED_SERVICE_TYPE } from '../AnalyzeDeploymentImpact.constants'

import * as AnalyzeDeploymentImpactWidgetUtils from '../components/AnalyzeDeploymentImpactWidget/components/AnalyzeDeploymentImpactWidgetSections/AnalyzeDeploymentImpactWidgetSections.utils'

jest.mock('services/cv', () => ({
  useGetMonitoredServiceFromServiceAndEnvironment: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: mockedMonitoredServiceAndHealthSources, error: null })),
  useGetMonitoredService: jest.fn().mockImplementation(() => ({ loading: false, data: {}, error: null })),
  useGetAllMonitoredServicesWithTimeSeriesHealthSources: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: {}, error: null, refetch: jest.fn() })),
  useUpdateMonitoredService: () =>
    jest.fn().mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: jest.fn() }))
}))

jest.mock('services/pipeline-ng', () => ({
  useGetPipeline: jest.fn(() => PipelineResponse)
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('@cv/pages/health-source/HealthSourceDrawer/component/defineHealthSource/useValidConnector', () => ({
  useValidConnector: jest.fn().mockReturnValue({
    isConnectorEnabled: true
  })
}))

describe('Test AnalyzeDeploymentImpact Step', () => {
  beforeEach(() => {
    factory.registerStep(new AnalyzeDeploymentImpact())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render editView when current step is being edited', () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={ANALYZE_STEP_INITIAL_VALUES}
        type={StepType.AnalyzeDeploymentImpact}
        stepViewType={StepViewType.Edit}
        onChange={jest.fn()}
        onUpdate={jest.fn()}
      />
    )

    expect(getByText('AnalyzeDeploymentImpact')).toBeInTheDocument()
  })

  test('should render Templatised view when current step is rendered in template mode', async () => {
    jest.spyOn(cdService, 'useGetCdDeployStageMetadata').mockImplementation(() => ({ loading: false } as any))
    jest.spyOn(AnalyzeDeploymentImpactWidgetUtils, 'getStageServiceAndEnv').mockImplementation(
      () =>
        ({
          serviceIdentifier: '',
          environmentIdentifier: '',
          hasMultiServiceOrEnv: false,
          errorInfo: ''
        } as any)
    )
    const { getByText } = render(
      <TestStepWidget
        initialValues={ANALYZE_STEP_INITIAL_VALUES}
        type={StepType.AnalyzeDeploymentImpact}
        stepViewType={StepViewType.Template}
        onChange={jest.fn()}
        onUpdate={jest.fn()}
      />
    )
    await waitFor(() =>
      expect(getByText('platform.connectors.cdng.monitoredService.monitoredServiceDef')).toBeInTheDocument()
    )
  })

  test('should render InputSet view when current step is rendered in InputSet mode', () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={ANALYZE_STEP_INITIAL_VALUES}
        type={StepType.AnalyzeDeploymentImpact}
        stepViewType={StepViewType.InputSet}
        onChange={jest.fn()}
        onUpdate={jest.fn()}
      />
    )

    expect(getByText('Errors')).toBeInTheDocument()
  })

  test('should render InputSet view when current step is rendered in InputSet mode with correct template data', () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={ANALYZE_STEP_INITIAL_VALUES}
        type={StepType.AnalyzeDeploymentImpact}
        stepViewType={StepViewType.InputSet}
        onChange={jest.fn()}
        onUpdate={jest.fn()}
        template={{
          spec: {
            duration: '<+input>',
            monitoredService: { type: MONITORED_SERVICE_TYPE.CONFIGURED, monitoredServiceRef: '<+input>' }
          },
          timeout: '<+input>'
        }}
        path={'pipeline'}
      />
    )

    expect(getByText('Errors')).toBeInTheDocument()
  })

  test('should render InputSet view when current step is rendered in InputSet mode with incorrect template data', () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={ANALYZE_STEP_INITIAL_VALUES}
        type={StepType.AnalyzeDeploymentImpact}
        stepViewType={StepViewType.InputSet}
        onChange={jest.fn()}
        onUpdate={jest.fn()}
        template={{
          spec: {
            duration: '<+input>',
            monitoredService: { monitoredServiceRef: '<+input>' }
          },
          timeout: '<+input>'
        }}
        path={''}
      />
    )

    expect(getByText('Errors')).toBeInTheDocument()
  })

  test('should render InputSet view when current step is rendered in InputSet mode when no template spec is present', () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={ANALYZE_STEP_INITIAL_VALUES}
        type={StepType.AnalyzeDeploymentImpact}
        stepViewType={StepViewType.InputSet}
        onChange={jest.fn()}
        onUpdate={jest.fn()}
        template={{
          timeout: '<+input>'
        }}
        path={''}
      />
    )

    expect(getByText('Errors')).toBeInTheDocument()
  })

  test('should render Variables view when current step is open in variable mode', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={ANALYZE_STEP_INITIAL_VALUES}
        type={StepType.AnalyzeDeploymentImpact}
        stepViewType={StepViewType.InputVariable}
        onChange={jest.fn()}
        onUpdate={jest.fn()}
      />
    )

    expect(container.firstChild).not.toBeInTheDocument()
  })

  test('should be able to edit the step in edit view', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={ANALYZE_STEP_INITIAL_VALUES}
        type={StepType.AnalyzeDeploymentImpact}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'Analyze step' } })

    expect(getByText('pipelineSteps.stepNameLabel')).toBeTruthy()
  })
})

describe('getMonitoredServiceYamlData', () => {
  const defaultMonitoredServiceSpec = {
    type: 'Default',
    spec: {}
  }

  test('returns defaultMonitoredServiceSpec when spec.monitoredService.type is MONITORED_SERVICE_TYPE.DEFAULT', () => {
    const spec = {
      monitoredService: {
        type: 'default',
        spec: {
          monitoredServiceRef: 'Default'
        }
      }
    } as AnalyzeDeploymentImpactData['spec']
    const expectedResult = defaultMonitoredServiceSpec
    const result = getMonitoredServiceYamlData(spec)
    expect(result).toEqual(expectedResult)
  })

  test('returns configured monitored service when spec.monitoredService.type is MONITORED_SERVICE_TYPE.CONFIGURED', () => {
    const spec = {
      monitoredService: {
        type: 'Configured',
        spec: {
          monitoredServiceRef: 'exampleRef'
        }
      }
    } as AnalyzeDeploymentImpactData['spec']
    const expectedResult = {
      type: 'Configured',
      spec: {
        monitoredServiceRef: 'exampleRef'
      }
    }
    const result = getMonitoredServiceYamlData(spec)
    expect(result).toEqual(expectedResult)
  })

  test('returns defaultMonitoredServiceSpec when spec.monitoredService.type is undefined', () => {
    const spec = {} as AnalyzeDeploymentImpactData['spec']
    const expectedResult = defaultMonitoredServiceSpec
    const result = getMonitoredServiceYamlData(spec)
    expect(result).toEqual(expectedResult)
  })
})

describe('getMonitoredServiceRef', () => {
  test('returns the monitoredServiceRef from the spec', () => {
    const spec = {
      monitoredService: {
        spec: {
          monitoredServiceRef: 'exampleRef'
        }
      }
    } as AnalyzeDeploymentImpactData['spec']
    const expectedResult = 'exampleRef'
    const result = getMonitoredServiceRef(spec)
    expect(result).toEqual(expectedResult)
  })

  test('returns undefined when spec.monitoredService is undefined', () => {
    const spec = {} as AnalyzeDeploymentImpactData['spec']
    const result = getMonitoredServiceRef(spec)
    expect(result).toBeUndefined()
  })
})

describe('getSpecFormData', () => {
  test('returns spec with monitoredServiceRef set to DEFAULT when spec.monitoredService.type is MONITORED_SERVICE_TYPE.DEFAULT', () => {
    const spec = {
      monitoredService: {
        type: 'default',
        spec: {
          monitoredServiceRef: 'Default'
        }
      }
    } as AnalyzeDeploymentImpactData['spec']
    const expectedResult = {
      monitoredService: {
        type: 'default',
        spec: {
          monitoredServiceRef: 'Default'
        }
      }
    }
    const result = getSpecFormData(spec)
    expect(result).toEqual(expectedResult)
  })

  test('returns spec with monitoredServiceRef unchanged when spec.monitoredService.type is not MONITORED_SERVICE_TYPE.DEFAULT', () => {
    const spec = {
      monitoredService: {
        type: 'Configured',
        spec: {
          monitoredServiceRef: 'exampleRef'
        }
      }
    } as AnalyzeDeploymentImpactData['spec']
    const expectedResult = {
      monitoredService: {
        type: 'Configured',
        spec: {
          monitoredServiceRef: 'exampleRef'
        }
      }
    }
    const result = getSpecFormData(spec)
    expect(result).toEqual(expectedResult)
  })
})

describe('checkIfRunTimeInput', () => {
  test('should return true if field is of type RUNTIME', () => {
    const result = checkIfRunTimeInput('<+input>')
    expect(result).toBe(true)
  })

  test('should return false if field is not of type RUNTIME', () => {
    const result = checkIfRunTimeInput('OTHER')
    expect(result).toBe(false)
  })

  test('should return false if field is undefined', () => {
    const result = checkIfRunTimeInput(undefined)
    expect(result).toBe(false)
  })
})

describe('validateField', () => {
  test('should not set error message if field is not empty', () => {
    const fieldValue = 'someValue'
    const fieldKey = 'fieldName'
    const data = {
      spec: {
        monitoredService: { spec: { monitoredServiceRef: 'someValue' }, type: MONITORED_SERVICE_TYPE.CONFIGURED },
        duration: '1D'
      },
      failureStrategies: [],
      identifier: 'analyze',
      name: 'analyze',
      type: StepType.AnalyzeDeploymentImpact
    }
    const isRequired = true
    const errors = {}
    const getString = jest.fn().mockReturnValue('Field is required')

    validateField({ fieldValue, fieldKey, data, errors, getString, isRequired })

    expect(errors).toEqual({})
  })
})

describe('validateMonitoredServiceForRunTimeView', () => {
  test('should set error message if monitored service is required and value is empty', () => {
    const monitoredService = { spec: { monitoredServiceRef: '<+input>' }, type: MONITORED_SERVICE_TYPE.CONFIGURED }
    const data = {
      spec: {
        monitoredService: { spec: { monitoredServiceRef: '' }, type: MONITORED_SERVICE_TYPE.CONFIGURED },
        duration: '1D'
      },
      failureStrategies: [],
      identifier: 'analyze',
      name: 'analyze',
      type: StepType.AnalyzeDeploymentImpact
    }
    const errors = {}
    const isRequired = true
    const getString = jest.fn().mockReturnValue('Field is required')

    validateMonitoredServiceForRunTimeView({ monitoredService, data, errors, getString, isRequired })

    expect(errors).toEqual({ spec: { monitoredService: { spec: { monitoredServiceRef: 'Field is required' } } } })
  })

  test('should not set error message if monitored service is not required', () => {
    const monitoredService = { spec: { monitoredServiceRef: '' }, type: MONITORED_SERVICE_TYPE.CONFIGURED }
    const data = {
      spec: {
        monitoredService: { spec: { monitoredServiceRef: '' }, type: MONITORED_SERVICE_TYPE.CONFIGURED },
        duration: '1D'
      },
      failureStrategies: [],
      identifier: 'analyze',
      name: 'analyze',
      type: StepType.AnalyzeDeploymentImpact
    }
    const errors = {}
    const getString = jest.fn().mockReturnValue('Field is required')

    validateMonitoredServiceForRunTimeView({ monitoredService, data, errors, getString, isRequired: false })

    expect(errors).toEqual({})
  })

  test('should not set error message if monitored service value is not empty', () => {
    const monitoredService = { spec: { monitoredServiceRef: 'someValue' }, type: MONITORED_SERVICE_TYPE.CONFIGURED }
    const data = {
      spec: {
        monitoredService: { spec: { monitoredServiceRef: 'someValue' }, type: MONITORED_SERVICE_TYPE.CONFIGURED },
        duration: '1D'
      },
      failureStrategies: [],
      identifier: 'analyze',
      name: 'analyze',
      type: StepType.AnalyzeDeploymentImpact
    }
    const errors = {}
    const isRequired = true
    const getString = jest.fn().mockReturnValue('Field is required')
    validateMonitoredServiceForRunTimeView({ monitoredService, data, errors, getString, isRequired })

    expect(errors).toEqual({})
  })
})
