/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, getByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, secretPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import SecretReferences from '../SecretReferences'
import referencedData from './secret-references-entities-data.json'
import { mockSecretEntitySetupUsageData } from './SecreteReferences.mock'

jest.mock('services/cd-ng', () => ({
  useListAllEntityUsageByFqn: jest.fn().mockImplementation(() => {
    return { data: mockSecretEntitySetupUsageData, refetch: jest.fn(), error: null, loading: false }
  })
}))

const windowOpenFn = jest.fn()
const spyWindowOpen = jest.spyOn(window, 'open')
spyWindowOpen.mockImplementation(windowOpenFn)

describe('Secret Referenced By Overrides', () => {
  beforeEach(() => {
    windowOpenFn.mockReset()
  })
  test('render override references: INFRA_SERVICE_OVERRIDE', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretReferences secretData={referencedData as any} />
      </TestWrapper>
    )
    const infraServiceOverrideElement = getByText(
      container,
      'test_env_Nexus3_artifact_testing_CDS83367_artifactory_infra'
    )
    expect(infraServiceOverrideElement).toBeInTheDocument()
    const elementData = mockSecretEntitySetupUsageData.data.content[0]
    const elementRefData = elementData.referredEntity.entityRef
    const routeURL = routes.toServiceOverrides({
      accountId: elementRefData.accountIdentifier,
      orgIdentifier: elementRefData.orgIdentifier,
      projectIdentifier: elementRefData.projectIdentifier,
      serviceOverrideType: 'INFRA_SERVICE_OVERRIDE'
    })
    fireEvent.click(infraServiceOverrideElement)
    expect(window.open).toBeCalledWith(`http://localhost/ng${routeURL}`, '_blank')
  })

  test('render override references: INFRA_GLOBAL_OVERRIDE', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretReferences secretData={referencedData as any} />
      </TestWrapper>
    )

    const infraGlobalOverrideElement = getByText(container, 'test_env_artifactory_infra')
    expect(infraGlobalOverrideElement).toBeInTheDocument()
    const elementData = mockSecretEntitySetupUsageData.data.content[1]
    const elementRefData = elementData.referredEntity.entityRef
    const routeURL = routes.toServiceOverrides({
      accountId: elementRefData.accountIdentifier,
      orgIdentifier: elementRefData.orgIdentifier,
      projectIdentifier: elementRefData.projectIdentifier,
      serviceOverrideType: 'INFRA_GLOBAL_OVERRIDE'
    })
    fireEvent.click(infraGlobalOverrideElement)
    expect(window.open).toBeCalledWith(`http://localhost/ng${routeURL}`, '_blank')
  })

  test('render override references: ENV_GLOBAL_OVERRIDE', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretReferences secretData={referencedData as any} />
      </TestWrapper>
    )

    const envGlobalOverrideElement = getByText(container, 'test_env_global')
    expect(envGlobalOverrideElement).toBeInTheDocument()
    const elementData = mockSecretEntitySetupUsageData.data.content[2]
    const elementRefData = elementData.referredEntity.entityRef
    const routeURL = routes.toServiceOverrides({
      accountId: elementRefData.accountIdentifier,
      orgIdentifier: elementRefData.orgIdentifier,
      projectIdentifier: elementRefData.projectIdentifier,
      serviceOverrideType: 'ENV_GLOBAL_OVERRIDE'
    })
    fireEvent.click(envGlobalOverrideElement)
    expect(window.open).toBeCalledWith(`http://localhost/ng${routeURL}`, '_blank')
  })
})
