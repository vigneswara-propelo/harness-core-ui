/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, within, screen, RenderResult } from '@testing-library/react'

import { get } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { executionPathProps, modulePathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { getIdentifierFromScopedRef } from '@common/utils/utils'
import { Scope } from '@common/interfaces/SecretsInterface'
import { InfraDefinitionTabs } from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfraDefinitionDetailsDrawer/InfraDefinitionDetailsDrawer'

import props from './props.json'
import propsWithGitOpsApps from './propsWithGitOpsApps.json'
import propsAccountSrvcEnv from './propsAccountSrvcEnv.json'
import propsWithClusters from './props_gitops.json'
import { CDStageDetails } from '../CDStageDetails'

const getModuleParams = (scope: Scope, module = 'cd') => ({
  accountId: 'accountId',
  ...(scope !== Scope.ACCOUNT && { orgIdentifier: 'orgIdentifier' }),
  ...(scope === Scope.PROJECT && { projectIdentifier: 'projectIdentifier' }),
  module
})

const renderComponent = (stageProps: any): RenderResult => {
  return render(
    <TestWrapper
      path={routes.toExecutionPipelineView({ ...executionPathProps, ...modulePathProps })}
      pathParams={{
        ...getModuleParams(Scope.PROJECT),
        pipelineIdentifier: 'pipeline',
        executionIdentifier: 'execution',
        source: 'deployments'
      }}
    >
      <CDStageDetails {...stageProps} />
    </TestWrapper>
  )
}

describe('<CDStageDetails /> tests', () => {
  test('snapshot test', () => {
    renderComponent(props)

    const serviceLinkElement = screen.getByTestId('serviceLink')
    expect(
      within(serviceLinkElement).getByRole('link', {
        name: 'Order'
      })
    ).toHaveAttribute(
      'href',
      routes.toServiceStudio({
        ...getModuleParams(Scope.PROJECT),
        serviceId: 'Order'
      } as any)
    )
    const envLinkElement = screen.getByTestId('environmentLink')
    expect(
      within(envLinkElement).getByRole('link', {
        name: 'Production'
      })
    ).toHaveAttribute(
      'href',
      routes.toEnvironmentDetails({
        ...getModuleParams(Scope.PROJECT),
        environmentIdentifier: 'Production',
        sectionId: 'INFRASTRUCTURE'
      } as any)
    )
    expect(
      within(envLinkElement).getByRole('link', {
        name: 'infra1'
      })
    ).toHaveAttribute(
      'href',
      routes.toEnvironmentDetails({
        ...getModuleParams(Scope.PROJECT),
        environmentIdentifier: 'Production',
        sectionId: 'INFRASTRUCTURE',
        infraDetailsTab: InfraDefinitionTabs.CONFIGURATION,
        infrastructureId: 'infra1'
      } as any)
    )
  })

  test('account level service environment route test', () => {
    renderComponent(propsAccountSrvcEnv)

    const srvcId = get(propsAccountSrvcEnv, 'stage.moduleInfo.cd.serviceInfo.identifier', '')
    const envId = get(propsAccountSrvcEnv, 'stage.moduleInfo.cd.infraExecutionSummary.identifier', '')
    const serviceScope = getScopeFromValue(srvcId)
    const infrastructureScope = getScopeFromValue(envId)

    const serviceLinkElement = screen.getByTestId('serviceLink')
    expect(
      within(serviceLinkElement).getByRole('link', {
        name: 'Order'
      })
    ).toHaveAttribute(
      'href',
      routes.toServiceStudio({
        ...getModuleParams(serviceScope),
        serviceId: getIdentifierFromScopedRef(srvcId),
        accountRoutePlacement: 'settings'
      } as any)
    )
    const envLinkElement = screen.getByTestId('environmentLink')
    expect(
      within(envLinkElement).getByRole('link', {
        name: 'Production'
      })
    ).toHaveAttribute(
      'href',
      routes.toEnvironmentDetails({
        ...getModuleParams(infrastructureScope),
        environmentIdentifier: getIdentifierFromScopedRef(envId),
        accountRoutePlacement: 'settings',
        sectionId: 'INFRASTRUCTURE'
      } as any)
    )
  })

  test('test gitops apps', () => {
    const { container } = render(
      <TestWrapper
        path={routes.toExecutionPipelineView({ ...executionPathProps, ...modulePathProps })}
        pathParams={{
          ...getModuleParams(Scope.PROJECT),
          pipelineIdentifier: 'pipeline',
          executionIdentifier: 'execution',
          source: 'deployments'
        }}
      >
        <CDStageDetails
          {...(propsWithGitOpsApps as any)}
          path={routes.toExecutionPipelineView({ ...executionPathProps, ...modulePathProps })}
          pathParams={{
            ...getModuleParams(Scope.PROJECT),
            pipelineIdentifier: 'pipeline',
            executionIdentifier: 'execution',
            source: 'deployments'
          }}
        />
      </TestWrapper>
    )

    const gitOpsAppsNode = container.querySelector('[data-test-id="GitopsApplications"]')
    expect(gitOpsAppsNode).toMatchSnapshot()
  })

  test('test gitops - account level service environment', () => {
    renderComponent(propsWithGitOpsApps)

    const gitOpsEnvironments = get(propsWithGitOpsApps, 'stage.moduleInfo.cd.gitopsExecutionSummary.environments')
    const accountLevelEnvId = gitOpsEnvironments[0].identifier
    const accountLevelEnvScope = getScopeFromValue(accountLevelEnvId)
    const projectLevelEnvId = gitOpsEnvironments[1].identifier
    const projectLevelEnvScope = getScopeFromValue(projectLevelEnvId)

    const envLinkElement = screen.getByTestId('environmentLink')
    expect(
      within(envLinkElement).getByRole('link', {
        name: 'account level env'
      })
    ).toHaveAttribute(
      'href',
      routes.toEnvironmentDetails({
        ...getModuleParams(accountLevelEnvScope),
        environmentIdentifier: getIdentifierFromScopedRef(accountLevelEnvId),
        accountRoutePlacement: 'settings'
      } as any)
    )
    expect(
      within(envLinkElement).getByRole('link', {
        name: 'customEnv'
      })
    ).toHaveAttribute(
      'href',
      routes.toEnvironmentDetails({
        ...getModuleParams(projectLevelEnvScope),
        environmentIdentifier: getIdentifierFromScopedRef(projectLevelEnvId)
      } as any)
    )
  })

  test('test gitops with environments and clusters', () => {
    render(
      <TestWrapper
        path={routes.toExecutionPipelineView({ ...executionPathProps, ...modulePathProps })}
        pathParams={{
          ...getModuleParams(Scope.PROJECT),
          pipelineIdentifier: 'pipeline',
          executionIdentifier: 'execution',
          source: 'deployments'
        }}
      >
        <CDStageDetails {...(propsWithClusters as any)} />
      </TestWrapper>
    )

    expect(screen.getByText('serviceOrServices')).toBeInTheDocument()
    expect(screen.getByText('environmentOrEnvironments')).toBeInTheDocument()
    expect(screen.getByText('cluster1')).toBeInTheDocument()
    expect(screen.getByText('cluster2')).toBeInTheDocument()
  })
})
