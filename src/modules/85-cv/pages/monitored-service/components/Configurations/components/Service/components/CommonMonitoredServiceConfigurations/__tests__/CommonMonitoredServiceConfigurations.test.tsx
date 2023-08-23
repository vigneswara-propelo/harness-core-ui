/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Button, Container, Formik, FormikForm, Views } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import {
  CD_MONITORED_SERVICE_CONFIG,
  PROJECT_MONITORED_SERVICE_CONFIG
} from '@cv/components/MonitoredServiceListWidget/MonitoredServiceListWidget.constants'
import routes from '@common/RouteDefinitions'
import { MonitoredServiceEnum } from '@cv/pages/monitored-service/MonitoredServicePage.constants'
import * as licenseStoreContextMock from 'framework/LicenseStore/LicenseStoreContext'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import CommonMonitoredServiceConfigurations, {
  CommonMonitoredServiceConfigurationsProps
} from '../CommonMonitoredServiceConfigurations'
import type { MonitoredServiceForm } from '../../../Service.types'
import { handleTabChange } from '../CommonMonitoredServiceConfigurations.utils'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({
    accountId: 'accountId',
    orgIdentifier: 'orgIdentifier',
    projectIdentifier: 'projectIdentifier',
    identifier: 'identifier'
  })
}))

jest.mock('@common/hooks', () => ({
  useQueryParams: () => jest.fn(),
  useDeepCompareEffect: () => jest.fn(),
  useLocalStorage: jest.fn().mockImplementation(() => [5, jest.fn()])
}))

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

function WrapperComponent(props: CommonMonitoredServiceConfigurationsProps): JSX.Element {
  const history = createMemoryHistory()
  const initialValues = {
    serviceRef: 'service-1',
    environmentRef: 'env-1',
    sources: {
      changeSources: [
        { name: 'adadas', identifier: 'adadas', type: 'HarnessCD', enabled: true, spec: {}, category: 'Deployment' }
      ]
    }
  }
  return (
    <Router history={history}>
      <Formik initialValues={initialValues} onSubmit={jest.fn()} formName="wrapperComponent">
        <FormikForm>
          <CommonMonitoredServiceConfigurations {...props} />
        </FormikForm>
      </Formik>
    </Router>
  )
}

describe('CommonMonitoredServiceConfigurations', () => {
  const mockHideDrawer = jest.fn()
  const mockShowDrawer = jest.fn()
  const mockOnSuccessChangeSource = jest.fn()
  const mockOpenChangeSourceDrawer = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockonDependencySuccess = jest.fn()

  const mockInitialValues = {
    sources: {
      healthSources: []
    },
    isEdit: false,
    identifier: 'service_env',
    name: 'service_env',
    serviceRef: 'service',
    type: 'Application'
  } as MonitoredServiceForm

  const props = {
    identifier: 'test',
    hideDrawer: mockHideDrawer,
    showDrawer: mockShowDrawer,
    onSuccessChangeSource: mockOnSuccessChangeSource,
    openChangeSourceDrawer: mockOpenChangeSourceDrawer,
    initialValues: mockInitialValues,
    onSuccess: mockOnSuccess,
    onDependencySuccess: mockonDependencySuccess,
    config: PROJECT_MONITORED_SERVICE_CONFIG,
    isEdit: false,
    onChangeMonitoredServiceType: jest.fn(),
    cachedInitialValues: null,
    onDiscard: jest.fn()
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders tabs correctly when project level monitored service config is passed', () => {
    render(<WrapperComponent {...props} />)
    const overViewTab = screen.getByRole('tab', { name: 'overview' })
    const healthSourceTab = screen.getByRole('tab', { name: 'platform.connectors.cdng.healthSources.label' })
    const changeSourceTab = screen.getByRole('tab', { name: 'cv.navLinks.adminSideNavLinks.activitySources' })

    expect(overViewTab).toBeInTheDocument()
    expect(healthSourceTab).toBeInTheDocument()
    expect(changeSourceTab).toBeInTheDocument()
  })

  test('renders tabs correctly in Templates mode also', () => {
    const updatedProps = { ...props, isTemplate: true }
    render(<WrapperComponent {...updatedProps} />)
    const overViewTab = screen.getByRole('tab', { name: 'overview' })
    const healthSourceTab = screen.getByRole('tab', { name: 'platform.connectors.cdng.healthSources.label' })
    const changeSourceTab = screen.getByRole('tab', { name: 'cv.navLinks.adminSideNavLinks.activitySources' })

    expect(overViewTab).toBeInTheDocument()
    expect(healthSourceTab).toBeInTheDocument()
    expect(changeSourceTab).toBeInTheDocument()
  })

  test('renders tabs correctly when Deployments level level monitored service config is passed', () => {
    const updatedProps = { ...props, config: CD_MONITORED_SERVICE_CONFIG }
    const { queryByText } = render(<WrapperComponent {...updatedProps} />)
    const overViewTab = screen.getByRole('tab', { name: 'overview' })
    const healthSourceTab = queryByText('platform.connectors.cdng.healthSources.label')
    const changeSourceTab = queryByText('cv.navLinks.adminSideNavLinks.activitySources')
    expect(overViewTab).toBeInTheDocument()
    expect(healthSourceTab).toBeInTheDocument()
    expect(changeSourceTab).not.toBeInTheDocument()
  })

  test('renders tabs correctly when config is undefined', () => {
    const updatedProps = { ...props, config: undefined }
    const { queryByText } = render(<WrapperComponent {...updatedProps} />)
    const overViewTab = screen.getByRole('tab', { name: 'overview' })
    const healthSourceTab = queryByText('platform.connectors.cdng.healthSources.label')
    const changeSourceTab = queryByText('cv.navLinks.adminSideNavLinks.activitySources')
    expect(overViewTab).toBeInTheDocument()
    expect(healthSourceTab).toBeInTheDocument()
    expect(changeSourceTab).toBeInTheDocument()
  })

  test('should not show the tabs if the component is rendered in create scenario', () => {
    const updatedProps = { ...props, identifier: '' }
    const { queryByText } = render(<WrapperComponent {...updatedProps} />)
    const healthSourceTab = queryByText('platform.connectors.cdng.healthSources.label')
    const changeSourceTab = queryByText('cv.navLinks.adminSideNavLinks.activitySources')

    expect(healthSourceTab).not.toBeInTheDocument()
    expect(changeSourceTab).not.toBeInTheDocument()
  })

  test('should show the tabs of agent configurations and dependencies when feature flags of Agent configurations and Dependencies are enabled', () => {
    jest.spyOn(licenseStoreContextMock, 'useLicenseStore').mockReturnValue({
      licenseInformation: {
        CET: { status: 'ACTIVE' },
        CV: { status: 'ACTIVE' }
      }
    } as any)

    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CET_PLATFORM_MONITORED_SERVICE: true
    })

    const updatedProps = { ...props }
    const { queryByText } = render(<WrapperComponent {...updatedProps} />)
    const healthSourceTab = queryByText('platform.connectors.cdng.healthSources.label')
    const changeSourceTab = queryByText('cv.navLinks.adminSideNavLinks.activitySources')
    const dependenciesTab = queryByText('pipelines-studio.dependenciesGroupTitle')
    const agentConfigurationsTab = queryByText('cet.monitoredservice.agentconfig')

    expect(healthSourceTab).toBeInTheDocument()
    expect(changeSourceTab).toBeInTheDocument()
    expect(dependenciesTab).toBeInTheDocument()
    expect(agentConfigurationsTab).toBeInTheDocument()
  })

  test('should render', async () => {
    const { container, getByText, queryByText } = render(<WrapperComponent {...props} />)
    await userEvent.click(queryByText('cv.navLinks.adminSideNavLinks.activitySources')!)
    await waitFor(() => expect(getByText('cv.changeSource.addChangeSource')).toBeTruthy())
    act(() => {
      fireEvent.click(getByText('cv.changeSource.addChangeSource'))
    })
    await waitFor(() => expect(container.querySelector('.TableV2--body div[role="row"]')).toBeTruthy())
    act(() => {
      fireEvent.click(getByText('adadas'))
    })
    await waitFor(() =>
      expect(mockShowDrawer).toHaveBeenCalledWith({
        hideDrawer: mockHideDrawer,
        isEdit: true,
        onSuccess: mockOnSuccessChangeSource,
        rowdata: {
          category: 'Deployment',
          enabled: true,
          identifier: 'adadas',
          name: 'adadas',
          spec: {},
          type: 'HarnessCD'
        },
        tableData: [
          {
            category: 'Deployment',
            enabled: true,
            identifier: 'adadas',
            name: 'adadas',
            spec: {},
            type: 'HarnessCD'
          }
        ]
      })
    )
  })
})

describe('handleTabChange', () => {
  const mockHistory = {
    push: jest.fn()
  } as any

  const mockParams = {
    nextTab: 'your-next-tab' as MonitoredServiceEnum,
    tab: 'your-current-tab' as MonitoredServiceEnum,
    history: mockHistory,
    accountId: 'your-account-id',
    orgIdentifier: 'your-org-identifier',
    projectIdentifier: 'your-project-identifier',
    identifier: 'your-identifier',
    view: 'your-view' as Views,
    notificationTime: 12345,
    config: PROJECT_MONITORED_SERVICE_CONFIG
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should push the correct route to history when config is defined for Project level', () => {
    handleTabChange(mockParams)

    expect(mockHistory.push).toHaveBeenCalledWith({
      pathname: routes.toMonitoredServicesConfigurations({
        accountId: 'your-account-id',
        orgIdentifier: 'your-org-identifier',
        projectIdentifier: 'your-project-identifier',
        identifier: 'your-identifier'
      }),
      search: '?view=your-view&tab=your-current-tab&subTab=your-next-tab&notificationTime=12345'
    })
  })

  test('should push the correct route to history when config is defined for CD level', () => {
    const paramsWithCDConfig = { ...mockParams, config: CD_MONITORED_SERVICE_CONFIG }
    handleTabChange(paramsWithCDConfig)

    expect(mockHistory.push).toHaveBeenCalledWith({
      pathname: routes.toMonitoredServicesConfigurations({
        accountId: 'your-account-id',
        orgIdentifier: 'your-org-identifier',
        projectIdentifier: 'your-project-identifier',
        identifier: 'your-identifier',
        module: 'cd'
      }),
      search: '?view=your-view&tab=your-current-tab&subTab=your-next-tab&notificationTime=12345'
    })
  })

  test('should push the correct route to history when config is undefined', () => {
    const paramsWithoutConfig = { ...mockParams, config: undefined }
    handleTabChange(paramsWithoutConfig)

    expect(mockHistory.push).toHaveBeenCalledWith({
      pathname: routes.toCVAddMonitoringServicesEdit({
        accountId: 'your-account-id',
        orgIdentifier: 'your-org-identifier',
        projectIdentifier: 'your-project-identifier',
        identifier: 'your-identifier',
        module: 'cv' // Check that the module is set to 'cv'
      }),
      search: '?view=your-view&tab=your-current-tab&subTab=your-next-tab&notificationTime=12345'
    })
  })

  test('should not push any routes when tabs are in templates mode', () => {
    const paramsWithoutConfig = { ...mockParams, isTemplate: true }
    handleTabChange(paramsWithoutConfig)
    expect(mockHistory.push).not.toHaveBeenCalled()
  })

  test('should not push any routes when tabs are opened in create mode of monitored service', () => {
    const paramsWithoutConfig = { ...mockParams, identifier: '' }
    handleTabChange(paramsWithoutConfig)
    expect(mockHistory.push).not.toHaveBeenCalled()
  })
})
