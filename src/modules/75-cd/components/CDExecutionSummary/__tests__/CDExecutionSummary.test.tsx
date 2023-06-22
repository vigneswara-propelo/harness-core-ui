/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { defaultTo } from 'lodash-es'
import type { Environment, ServiceExecutionSummary } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'

import { Scope } from '@common/interfaces/SecretsInterface'
import routes from '@common/RouteDefinitions'
import { executionPathProps, modulePathProps } from '@common/utils/routeUtils'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { getIdentifierFromScopedRef } from '@common/utils/utils'
import { CDExecutionSummary } from '../CDExecutionSummary'
import { EnvironmentsList } from '../EnvironmentsList'
import { ServicesList } from '../ServicesList'
import { ServicesTableProps, ServicesTable } from '../ServicesTable'
import props from './props.json'

const environmentProps: { environments: Environment[]; className: string } = {
  environments: [
    { name: 'demo1', identifier: 'demo1' },
    { name: 'demo2', identifier: 'demo2' },
    { name: 'demo3', identifier: 'demo3' }
  ],
  className: 'demo'
}
const getModuleParams = (scope: Scope, module = 'cd') => ({
  accountId: 'accountId',
  ...(scope != Scope.ACCOUNT && { orgIdentifier: 'orgIdentifier' }),
  ...(scope === Scope.PROJECT && { projectIdentifier: 'projectIdentifier' }),
  module
})

const servicesTableProps: ServicesTableProps = {
  services: [
    {
      identifier: 'nginx',
      displayName: 'todolist',
      deploymentType: 'Kubernetes',
      artifacts: {
        sidecars: [1],
        primary: []
      }
    },
    {
      identifier: 'service1',
      displayName: 'service1',
      deploymentType: 'Kubernetes'
    },
    {
      identifier: 'nginx',
      displayName: 'todolist',
      deploymentType: 'Kubernetes',
      artifacts: {
        primary: []
      }
    }
  ] as ServiceExecutionSummary[]
}

describe('<CDExecutionSummary /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <CDExecutionSummary {...(props as any)} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render environmentList', () => {
    const { container } = render(
      <TestWrapper>
        <EnvironmentsList {...environmentProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render serviceTable', () => {
    const { container } = render(
      <TestWrapper>
        <ServicesTable services={servicesTableProps.services} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render serviceList', () => {
    const { container } = render(
      <TestWrapper>
        <ServicesList services={servicesTableProps.services} limit={2} className={'demo'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

describe('CDExecutionSummary links navigation test', () => {
  test('Service & Env detail should be links to respective summary/config pages', () => {
    const envId = defaultTo(props.nodeMap[1].moduleInfo.cd.infraExecutionSummary?.identifier, '')
    const serviceId = defaultTo(props.nodeMap[1].moduleInfo.cd.serviceInfo?.identifier, '')
    const envScope = getScopeFromValue(envId)
    const serviceScope = getScopeFromValue(serviceId)
    const { getByText } = render(
      <TestWrapper
        path={routes.toExecutionPipelineView({ ...executionPathProps, ...modulePathProps })}
        pathParams={{
          ...getModuleParams(Scope.PROJECT),
          pipelineIdentifier: 'pipeline',
          executionIdentifier: 'execution',
          source: 'deployments'
        }}
      >
        <CDExecutionSummary {...(props as any)} />
      </TestWrapper>
    )
    const envText = getByText('UAT')
    const serviceText = getByText('service1')

    expect(envText).toHaveAttribute(
      'href',
      routes.toEnvironmentDetails({
        ...getModuleParams(envScope),
        environmentIdentifier: defaultTo(getIdentifierFromScopedRef(envId), ''),
        accountRoutePlacement: 'settings'
      } as any)
    )

    expect(serviceText).toHaveAttribute(
      'href',
      routes.toServiceStudio({
        ...getModuleParams(serviceScope),
        serviceId: defaultTo(getIdentifierFromScopedRef(serviceId), ''),
        accountRoutePlacement: 'settings'
      } as any)
    )
  })
})
