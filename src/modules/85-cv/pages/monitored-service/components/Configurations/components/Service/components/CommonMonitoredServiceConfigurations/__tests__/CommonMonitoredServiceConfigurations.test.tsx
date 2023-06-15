import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { PROJECT_MONITORED_SERVICE_CONFIG } from '@cv/components/MonitoredServiceListWidget/MonitoredServiceListWidget.constants'
import CommonMonitoredServiceConfigurations, {
  CommonMonitoredServiceConfigurationsProps
} from '../CommonMonitoredServiceConfigurations'
import type { MonitoredServiceForm } from '../../../Service.types'

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

function WrapperComponent(props: CommonMonitoredServiceConfigurationsProps): JSX.Element {
  const initialValues = {
    sources: {
      changeSources: [
        { name: 'adadas', identifier: 'adadas', type: 'HarnessCD', enabled: true, spec: {}, category: 'Deployment' }
      ]
    }
  }
  return (
    <Formik initialValues={initialValues} onSubmit={jest.fn()} formName="wrapperComponent">
      <FormikForm>
        <CommonMonitoredServiceConfigurations {...props} />
      </FormikForm>
    </Formik>
  )
}

describe('CommonMonitoredServiceConfigurations', () => {
  const mockHideDrawer = jest.fn()
  const mockShowDrawer = jest.fn()
  const mockOnSuccessChangeSource = jest.fn()
  const mockOpenChangeSourceDrawer = jest.fn()
  const mockOnSuccess = jest.fn()

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
    config: PROJECT_MONITORED_SERVICE_CONFIG
  }

  test('renders tabs correctly', () => {
    render(<WrapperComponent {...props} />)
    const healthSourceTab = screen.getByRole('tab', { name: 'Health Source' })
    const changeSourceTab = screen.getByRole('tab', { name: 'Change Source' })

    expect(healthSourceTab).toBeInTheDocument()
    expect(changeSourceTab).toBeInTheDocument()
  })

  test('should not show the tabs if the component is rendered in create scenario', () => {
    const updatedProps = { ...props, identifier: '' }
    const { queryByText } = render(<WrapperComponent {...updatedProps} />)
    const healthSourceTab = queryByText('Health Source')
    const changeSourceTab = queryByText('Change Source')

    expect(healthSourceTab).not.toBeInTheDocument()
    expect(changeSourceTab).not.toBeInTheDocument()
  })

  test('should render', async () => {
    const { container, getByText, queryByText } = render(<WrapperComponent {...props} />)
    userEvent.click(queryByText('Change Source')!)
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
