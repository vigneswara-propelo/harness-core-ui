import React from 'react'
import { render } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import qs from 'qs'
import { compile } from 'path-to-regexp'
import userEvent from '@testing-library/user-event'
import { useGetMonitoredService } from 'services/cv'
import routes from '@common/RouteDefinitions'
import { PROJECT_MONITORED_SERVICE_CONFIG } from '@cv/components/MonitoredServiceListWidget/MonitoredServiceListWidget.constants'
import CommonMonitoredServiceDetails from '../CommonMonitoredServiceDetails'

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

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

const fetchMonitoredServiceYAML = jest.fn(() => Promise.resolve({ data: {} }))
const fetchMonitoredService = jest.fn(() => Promise.resolve({ data: {} }))

jest.mock('services/cv', () => ({
  useGetMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: {}, error: null, refetch: fetchMonitoredService })),
  useGetMonitoredServiceYamlTemplate: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: fetchMonitoredServiceYAML })),
  useSaveMonitoredService: () =>
    jest.fn().mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: jest.fn() })),
  useUpdateMonitoredService: () =>
    jest.fn().mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: jest.fn() })),
  useGetNotificationRulesForMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useSaveNotificationRuleData: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useUpdateNotificationRuleData: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() }))
}))

const CommonMonitoredServiceDetailsWrapper = () => {
  const queryParams = {}
  const path = routes.toMonitoredServicesConfigurations({
    accountId: 'accountId',
    orgIdentifier: 'orgIdentifier',
    projectIdentifier: 'projectIdentifier',
    identifier: 'identifier'
  })
  const pathParams = { accountId: 'accountId' }
  const search = qs.stringify(queryParams, { addQueryPrefix: true })
  const routePath = compile(path)(pathParams) + search
  const history = React.useMemo(() => createMemoryHistory({ initialEntries: [routePath] }), [])

  return (
    <Router history={history}>
      <CommonMonitoredServiceDetails config={PROJECT_MONITORED_SERVICE_CONFIG} />
    </Router>
  )
}

describe('CommonMonitoredServiceDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should render the loading state', () => {
    ;(useGetMonitoredService as jest.Mock).mockImplementation(() => ({
      loading: true,
      data: {},
      error: null
    }))

    const { getByTestId } = render(<CommonMonitoredServiceDetailsWrapper />)

    // Assert the loading state
    expect(getByTestId('loading')).toBeInTheDocument()
  })

  test('should render the error message', () => {
    ;(useGetMonitoredService as jest.Mock).mockImplementation(() => ({
      data: null,
      refetch: jest.fn(),
      loading: false,
      error: new Error('API error')
    }))

    const { getByText } = render(<CommonMonitoredServiceDetailsWrapper />)

    // Assert the error message
    expect(getByText('API error')).toBeInTheDocument()
    userEvent.click(getByText('Retry'))

    // Api error should persist
    expect(getByText('API error')).toBeInTheDocument()
  })
})
