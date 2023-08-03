/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  getShouldRenderConfiguredMonitoredService,
  getStageServiceAndEnv
} from '../AnalyzeDeploymentImpactWidgetSections.utils'
import { stageMetaMock, stageMetaWithMultipleEnvMock } from './AnalyzeDeploymentImpactWidgetSections.mock'

describe('Validate Service Environment', () => {
  test('should return correct for multi service and enironment', async () => {
    const data = await getStageServiceAndEnv({
      pipeline: {} as any,
      selectedStage: {} as any,
      selectedStageId: 'stage101',
      getDeploymentStageMeta: jest.fn().mockImplementation(() => ({ ...stageMetaWithMultipleEnvMock }))
    })
    expect(data).toEqual({
      errorInfo: '',
      hasMultiServiceOrEnv: true,
      environmentIdentifier: '',
      serviceIdentifier: ''
    })
  })
  test('should return correct service and enironment', async () => {
    const getDeploymentStageMeta = jest.fn().mockImplementation(() => ({ ...stageMetaMock }))
    const data = await getStageServiceAndEnv({
      pipeline: {} as any,
      selectedStage: {} as any,
      selectedStageId: 'stage101',
      getDeploymentStageMeta
    })
    expect(data).toEqual({
      errorInfo: '',
      hasMultiServiceOrEnv: false,
      environmentIdentifier: 'env1',
      serviceIdentifier: 'account.test_scoped_service'
    })
  })

  test('should return error on failure', async () => {
    const getDeploymentStageMeta = jest.fn().mockRejectedValue({
      data: {
        message: 'error encountered'
      }
    })
    const data = await getStageServiceAndEnv({
      pipeline: {} as any,
      selectedStage: {} as any,
      selectedStageId: 'stage101',
      getDeploymentStageMeta
    })
    expect(data).toEqual({
      errorInfo: 'error encountered',
      hasMultiServiceOrEnv: false,
      environmentIdentifier: '',
      serviceIdentifier: ''
    })
  })

  test('should return when no service and env value is present', async () => {
    const defaultValue = {
      environmentIdentifier: '',
      errorInfo: '',
      hasMultiServiceOrEnv: false,
      serviceIdentifier: ''
    }

    const withNodata = await getStageServiceAndEnv({
      pipeline: {} as any,
      selectedStage: {} as any,
      selectedStageId: 'stage101',
      getDeploymentStageMeta: jest.fn().mockReturnValue({
        data: {}
      })
    })
    expect(withNodata).toEqual(defaultValue)

    const withNoServiceData = await getStageServiceAndEnv({
      pipeline: {} as any,
      selectedStage: {} as any,
      selectedStageId: 'stage101',
      getDeploymentStageMeta: jest.fn().mockReturnValue({
        data: { serviceEnvRefList: [{ environmentRef: 'env1' }] }
      })
    })
    expect(withNoServiceData).toEqual({ ...defaultValue, environmentIdentifier: 'env1' })

    const withNoEnvData = await getStageServiceAndEnv({
      pipeline: {} as any,
      selectedStage: {} as any,
      selectedStageId: 'stage101',
      getDeploymentStageMeta: jest.fn().mockReturnValue({
        data: { serviceEnvRefList: [{ serviceRef: 'svc1' }] }
      })
    })
    expect(withNoEnvData).toEqual({ ...defaultValue, serviceIdentifier: 'svc1' })
  })
})

describe('getShouldRenderConfiguredMonitoredService', () => {
  test('should return false when stepViewType is undefined', () => {
    const shouldRender = getShouldRenderConfiguredMonitoredService('', '', undefined)
    expect(shouldRender).toBe(false)
  })

  test('should return false when stepViewType is not Edit, Template, or a templatized view', () => {
    const shouldRender = getShouldRenderConfiguredMonitoredService('', '', StepViewType.InputVariable)
    expect(shouldRender).toBe(false)
  })

  test('should return false when stepViewType is Edit but serviceIdentifier and environmentIdentifier are missing', () => {
    const shouldRender = getShouldRenderConfiguredMonitoredService('', '', StepViewType.Edit)
    expect(shouldRender).toBe(false)
  })

  test('should return true when stepViewType is Template', () => {
    const shouldRender = getShouldRenderConfiguredMonitoredService('', '', StepViewType.Template)
    expect(shouldRender).toBe(true)
  })

  test('should return true when stepViewType is a templatized view', () => {
    const shouldRender = getShouldRenderConfiguredMonitoredService('', '', StepViewType.TemplateUsage)
    expect(shouldRender).toBe(true)
  })

  test('should return true when stepViewType is Edit and serviceIdentifier and environmentIdentifier are provided', () => {
    const shouldRender = getShouldRenderConfiguredMonitoredService('service-id', 'env-id', StepViewType.Edit)
    expect(shouldRender).toBe(true)
  })
})
