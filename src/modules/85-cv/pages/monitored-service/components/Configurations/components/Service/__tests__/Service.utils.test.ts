/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep } from 'lodash-es'
import { NGMonitoredServiceTemplateInfoConfig } from '@cv/components/MonitoredServiceTemplate/components/MonitoredServiceTemplateCanvas.types'
import { MonitoredServiceDTO } from 'services/cv'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getEnvironmentRef, getMonitoredServiceType, updateMonitoredServiceDTOOnTypeChange } from '../Service.utils'
import { MockMonitoredServiceDTO } from './Service.mock'

describe('Unit tests for Servicee utils', () => {
  test('Ensure updateMonitoredServiceDTOOnTypeChange works as expected', () => {
    const clonedObj = cloneDeep(MockMonitoredServiceDTO)
    clonedObj.sources?.changeSources?.push({
      category: 'Deployment',
      enabled: true,
      identifier: '1234_iden',
      name: 'deployment',
      spec: {},
      type: 'HarnessCDNextGen'
    })

    // for infra expect deployment to be removed
    expect(updateMonitoredServiceDTOOnTypeChange('Infrastructure', clonedObj)).toEqual({
      dependencies: [],
      environmentRef: '1234_env',
      identifier: '1234_ident',
      name: 'solo-dolo',
      serviceRef: '1234_serviceRef',
      sources: {
        changeSources: [
          {
            category: 'Infrastructure',
            enabled: true,
            identifier: '343_iden',
            name: 'k8',
            spec: {},
            type: 'K8sCluster'
          },
          {
            category: 'Alert',
            enabled: true,
            identifier: '343_iden',
            name: 'pager',
            spec: {},
            type: 'PagerDuty'
          }
        ]
      },
      tags: {},
      type: 'Infrastructure'
    })

    // for application expect k8s to be removed
    expect(updateMonitoredServiceDTOOnTypeChange('Application', cloneDeep(MockMonitoredServiceDTO))).toEqual({
      dependencies: [],
      environmentRef: '1234_env',
      identifier: '1234_ident',
      name: 'solo-dolo',
      serviceRef: '1234_serviceRef',
      sources: {
        changeSources: [
          {
            category: 'Deployment',
            enabled: true,
            identifier: '1234_iden',
            name: 'deployment',
            spec: {},
            type: 'HarnessCD'
          },
          {
            category: 'Alert',
            enabled: true,
            identifier: '343_iden',
            name: 'pager',
            spec: {},
            type: 'PagerDuty'
          }
        ]
      },
      tags: {},
      type: 'Application'
    })
  })

  test('getMonitoredServiceType should return correct for templates and template spec is already defined', () => {
    const result = getMonitoredServiceType({
      isTemplate: true,
      templateValue: {
        spec: {
          type: 'Application'
        }
      } as unknown as NGMonitoredServiceTemplateInfoConfig
    })

    expect(result).toBe('Application')
  })

  test('getMonitoredServiceType should return correct for non templates and it should be taken from defaultMonitoredService values', () => {
    const result = getMonitoredServiceType({
      isTemplate: false,
      defaultMonitoredService: {
        type: 'Infrastructure'
      } as unknown as MonitoredServiceDTO
    })

    expect(result).toBe('Infrastructure')
  })

  test('getMonitoredServiceType should return Application as default monitored service type when no values are passed in templates', () => {
    const result = getMonitoredServiceType({
      isTemplate: true
    })

    expect(result).toBe('Application')
  })

  test('getEnvironmentRef should return runtime input as value when templateScope is not Project', () => {
    const result = getEnvironmentRef({
      templateValue: {} as unknown as NGMonitoredServiceTemplateInfoConfig,
      templateScope: 'org' as Scope
    })

    expect(result).toBe('<+input>')
  })

  test('getEnvironmentRef should return congiured environmentRef value when it is of type string and monitored service type is Application', () => {
    const result = getEnvironmentRef({
      templateValue: {
        spec: {
          type: 'Application',
          environmentRef: 'testENV'
        }
      } as unknown as NGMonitoredServiceTemplateInfoConfig,
      templateScope: 'project' as Scope
    })

    expect(result).toBe('testENV')
  })

  test('getEnvironmentRef should return undefined environmentRef value is of array type and and monitored service type is Application', () => {
    const result = getEnvironmentRef({
      templateValue: {
        spec: {
          type: 'Application',
          environmentRef: ['testENV']
        }
      } as unknown as NGMonitoredServiceTemplateInfoConfig,
      templateScope: 'project' as Scope
    })

    expect(result).toBe(undefined)
  })

  test('getEnvironmentRef should return congiured environmentRef value when it is of type array and monitored service type is Infrastructure', () => {
    const result = getEnvironmentRef({
      templateValue: {
        spec: {
          type: 'Infrastructure',
          environmentRef: ['testENV']
        }
      } as unknown as NGMonitoredServiceTemplateInfoConfig,
      templateScope: 'project' as Scope
    })

    expect(result).toEqual(['testENV'])
  })

  test('getEnvironmentRef should return undefined environmentRef value is of string type and and monitored service type is Infrastructure', () => {
    const result = getEnvironmentRef({
      templateValue: {
        spec: {
          type: 'Infrastructure',
          environmentRef: 'testENV'
        }
      } as unknown as NGMonitoredServiceTemplateInfoConfig,
      templateScope: 'project' as Scope
    })

    expect(result).toBe(undefined)
  })

  test('getEnvironmentRef should return runtime input value if environmentRef is a runtime', () => {
    const result = getEnvironmentRef({
      templateValue: {
        spec: {
          type: 'Application',
          environmentRef: '<+input>'
        }
      } as unknown as NGMonitoredServiceTemplateInfoConfig,
      templateScope: 'project' as Scope
    })

    expect(result).toEqual('<+input>')
  })

  test('getEnvironmentRef should return runtime input value if environmentRef is a runtime for Infrastructure type', () => {
    const result = getEnvironmentRef({
      templateValue: {
        spec: {
          type: 'Infrastructure',
          environmentRef: '<+input>'
        }
      } as unknown as NGMonitoredServiceTemplateInfoConfig,
      templateScope: 'project' as Scope
    })

    expect(result).toBe('<+input>')
  })
})
