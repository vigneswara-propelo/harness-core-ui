/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MonitoredServiceForm } from '@cv/pages/monitored-service/components/Configurations/components/Service/Service.types'
import { getDependencyLinks, getEnvironmentRef, getNodes } from '../ServiceDependencyGraph.utils'
import { MonitoredServiceDependency } from '../ServiceDependencyGraph.types'
import { emptyNode, filteredList, nodesList } from './ServiceDependencyGraph.mock'

describe('validate ServiceDependencyGraph utils', () => {
  test('validate getEnvironmentRef when environmentRef is SelectOption', () => {
    const identifier = 'identifier'
    const value = {
      type: 'Application',
      environmentRef: 'env1'
    }
    const result = getEnvironmentRef(identifier, value as unknown as MonitoredServiceForm)
    expect(result).toEqual(['env1'])
  })
  test('validate getEnvironmentRef when environmentRef is SelectOption', () => {
    const identifier = 'identifier'
    const value = {
      type: 'Infrastructure',
      environmentRef: [{ value: 'env1' }]
    }
    const result = getEnvironmentRef(identifier, value as unknown as MonitoredServiceForm)
    expect(result).toEqual(['env1'])
  })

  test('validate getEnvironmentRef when identifier is undefined', () => {
    const identifier = 'identifier'
    const value = {
      type: 'Infrastructure',
      environmentRef: [{ value: 'env1' }]
    }
    const result = getEnvironmentRef(identifier, value as unknown as MonitoredServiceForm)
    expect(result).toEqual(['env1'])
  })

  test('validate getNodes', () => {
    expect(getNodes(filteredList, 'MS1', ['MS2'])).toEqual(nodesList)
    expect(
      getNodes([{ identifier: 'MS1' }, { identifier: 'MS2' }] as MonitoredServiceDependency[], 'MS1', ['MS2'])
    ).toEqual([
      { ...emptyNode, id: 'MS1' },
      { ...emptyNode, id: 'MS2' }
    ])
  })

  test('validate getDependencyLinks', () => {
    expect(getDependencyLinks(filteredList, 'MS1', [])).toEqual([])
    expect(getDependencyLinks(filteredList, 'MS1', ['MS2'])).toEqual([{ from: 'MS2', to: 'MS1' }])
    expect(getDependencyLinks(filteredList, 'MS3', ['MS3'])).toEqual([])
    expect(
      getDependencyLinks([{ identifier: 'MS1' }, { identifier: 'MS2' }] as MonitoredServiceDependency[], 'MS1', ['MS2'])
    ).toEqual([])
  })
})
