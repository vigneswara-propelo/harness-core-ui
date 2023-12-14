/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { Container, Button } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import * as dbHook from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import * as cvServices from 'services/cv'
import {
  TemplateContext,
  TemplateContextInterface
} from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { yamlResponse } from '@cv/pages/monitored-service/CVMonitoredService/__test__/CVMonitoredService.mock'
import { MonitoredServiceContext } from '@cv/pages/monitored-service/MonitoredServiceContext'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { cvModuleParams } from '@cv/RouteDestinations'
import { editParams } from '@cv/utils/routeUtils'
import mockImport from 'framework/utils/mockImport'
import Configurations, { ConfigurationsWithRef } from '../Configurations'
import { cachedData, editModeData } from '../components/Service/__tests__/Service.mock'

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  useGetHarnessServices: () => ({
    serviceOptions: [
      { label: 'service1', value: 'service1' },
      { label: 'AppDService101', value: 'AppDService101' }
    ]
  }),
  HarnessServiceAsFormField: function MockComponent(props: any) {
    return (
      <Container>
        <Button
          className="addService"
          onClick={() => props.serviceProps.onNewCreated({ name: 'newService', identifier: 'newService' })}
        />
      </Container>
    )
  },
  HarnessEnvironmentAsFormField: function MockComponent(props: any) {
    return (
      <Container>
        <Button
          className="addEnv"
          onClick={() => props.environmentProps.onNewCreated({ name: 'newEnv', identifier: 'newEnv' })}
        />
      </Container>
    )
  },
  useGetHarnessEnvironments: () => {
    return {
      environmentOptions: [
        { label: 'env1', value: 'env1' },
        { label: 'AppDTestEnv1', value: 'AppDTestEnv1' }
      ]
    }
  }
}))

const fetchMonitoredServiceYAML = jest.fn(() => Promise.resolve({ data: {} }))
const updateMonitoredService = jest.fn()

jest.mock('services/cv', () => ({
  useSaveMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: jest.fn() })),
  useUpdateMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: {}, mutate: updateMonitoredService })),
  useGetMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: editModeData, refetch: jest.fn() })),
  useGetMonitoredServiceYamlTemplate: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: fetchMonitoredServiceYAML })),
  useGetNotificationRulesForMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useSaveNotificationRuleData: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useUpdateNotificationRuleData: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useGetMonitoredServiceList: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useIsReconciliationRequiredForMonitoredServices: jest.fn().mockImplementation(() => ({ data: {} }))
}))

mockImport('framework/LicenseStore/LicenseStoreContext', {
  useLicenseStore: jest.fn().mockImplementation(() => ({
    licenseInformation: {
      CV: {
        status: 'ACTIVE'
      }
    }
  }))
})

describe('Unit tests for Configuration', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test('Ensure that any infra change source is removed when switching type to application', async () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: cachedData }))
      } as any,
      isInitializingDB: false
    })

    jest.spyOn(cvServices, 'useGetMonitoredServiceYamlTemplate').mockImplementation(
      () =>
        ({
          data: yamlResponse,
          refetch: jest.fn()
        } as any)
    )

    const { container, getByText } = render(
      <TestWrapper>
        <Configurations />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('input[value="Application"]')).toBeInTheDocument())

    await act(async () => {
      await userEvent.click(
        container.querySelector(`[class*="monitoredService"] .bp3-input-action [data-icon="chevron-down"]`)!
      )
    })
    await waitFor(() => expect(container.querySelector('[class*="menuItemLabel"]')).not.toBeNull())
    await act(async () => {
      await userEvent.click(getByText('Infrastructure'))
    })
    waitFor(() => expect(document.body.querySelector('[class*="ConfirmationDialog"]')).toBeDefined())
    waitFor(() => expect(document.body.querySelectorAll('[class*="ConfirmationDialog"] button')[0]).toBeDefined())
    await act(async () => {
      await fireEvent.click(document.body.querySelectorAll('[class*="ConfirmationDialog"] button')[0])
    })
    expect(document.title).toBe('common.module.srm | cv.monitoredServices.title | harness')
  })

  test('should fail saving monitored service', async () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: {} })),
        clear: jest.fn()
      } as any,
      isInitializingDB: false
    })

    const { getByText, queryByText } = render(
      <TestWrapper>
        <Configurations />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('save'))
    })
    await waitFor(() => expect(queryByText('unsavedChanges')).not.toBeInTheDocument())
  })

  test('should save monitored service', async () => {
    const testPath = routes.toCVAddMonitoringServicesEdit({
      ...accountPathProps,
      ...projectPathProps,
      ...editParams,
      ...cvModuleParams
    })

    const pathParams = {
      orgIdentifier: 'orgIdentifier',
      projectIdentifier: 'projectIdentifier',
      accountId: 'accountId',
      identifier: 'identifier',
      module: 'cv'
    }

    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: cachedData })),
        clear: jest.fn()
      } as any,
      isInitializingDB: false
    })

    const { getByText, queryByText } = render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <Configurations />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('save'))
    })
    await waitFor(() => expect(queryByText('unsavedChanges')).not.toBeInTheDocument())
  })
  test('should switch tabs and discard changes', async () => {
    const testPath = routes.toCVAddMonitoringServicesEdit({
      ...accountPathProps,
      ...projectPathProps,
      ...editParams,
      ...cvModuleParams
    })

    const pathParams = {
      orgIdentifier: 'orgIdentifier',
      projectIdentifier: 'projectIdentifier',
      accountId: 'accountId',
      identifier: 'identifier',
      module: 'cv'
    }

    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: cachedData })),
        clear: jest.fn()
      } as any,
      isInitializingDB: false
    })

    const { getByText, queryByText } = render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <Configurations />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('platform.connectors.cdng.healthSources.label')).toBeInTheDocument())
    await waitFor(() => expect(getByText('unsavedChanges')).toBeInTheDocument())
    act(() => {
      fireEvent.click(getByText('common.discard'))
    })
    await waitFor(() => expect(queryByText('unsavedChanges')).not.toBeInTheDocument())
  })

  test('should render default change source in MS Template', async () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: {} }))
      } as any,
      isInitializingDB: false
    })
    jest.spyOn(cvServices, 'useGetMonitoredServiceYamlTemplate').mockImplementation(
      () =>
        ({
          data: yamlResponse,
          refetch: jest.fn()
        } as any)
    )
    const updateTemplate = jest.fn()
    render(
      <TestWrapper>
        <TemplateContext.Provider
          value={{ state: { storeMetadata: { storeType: 'INLINE' } } } as TemplateContextInterface}
        >
          <MonitoredServiceContext.Provider value={{ isTemplate: true }}>
            <ConfigurationsWithRef
              updateTemplate={updateTemplate}
              templateValue={{
                identifier: '',
                orgIdentifier: 'orgIdentifier',
                projectIdentifier: 'projectIdentifier',
                name: 'tempalteMS',
                type: 'MonitoredService',
                versionLabel: ' -1',
                spec: {
                  sources: { changeSources: [], healthSources: [] }
                }
              }}
            />
          </MonitoredServiceContext.Provider>
        </TemplateContext.Provider>
      </TestWrapper>
    )
    await waitFor(() => expect(updateTemplate).toHaveBeenCalled())
  })

  test('should fail useGetMonitoredService', () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: {} })),
        clear: jest.fn()
      } as any,
      isInitializingDB: false
    })
    const testPath = routes.toCVAddMonitoringServicesEdit({
      ...accountPathProps,
      ...projectPathProps,
      ...editParams,
      ...cvModuleParams
    })
    const pathParams = {
      orgIdentifier: 'orgIdentifier',
      projectIdentifier: 'projectIdentifier',
      accountId: 'accountId',
      identifier: 'identifier',
      module: 'cv'
    }
    jest
      .spyOn(cvServices, 'useGetMonitoredService')
      .mockImplementation(
        () => ({ loading: false, error: { message: 'api failed' }, data: null, refetch: jest.fn() } as any)
      )
    jest
      .spyOn(cvServices, 'useGetMonitoredServiceYamlTemplate')
      .mockImplementation(
        () => ({ loading: false, error: { message: 'api failed' }, data: null, refetch: jest.fn() } as any)
      )
    const editModeContainer = render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <Configurations />
      </TestWrapper>
    )
    expect(editModeContainer.getByText('api failed')).toBeInTheDocument()

    const createModeContainer = render(
      <TestWrapper>
        <Configurations />
      </TestWrapper>
    )
    expect(createModeContainer.getAllByText('api failed')[1]).toBeInTheDocument()
  })
})
