import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, useParams } from 'react-router-dom'
import { HealthSource } from 'services/cv'
import AnalyseStepHealthSourcesList from '../AnalyseStepHealthSourcesList'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn()
}))

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

describe('AnalyseStepHealthSourcesList', () => {
  beforeEach(() => {
    ;(useParams as any).mockReturnValue({
      accountId: 'mock-account',
      orgIdentifier: 'mock-org',
      projectIdentifier: 'mock-project'
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders detail not present message when healthSourcesList is empty', () => {
    const healthSourcesList = [] as HealthSource[]
    const fetchMonitoredServiceDataMock = jest.fn()

    const { getByText } = render(
      <MemoryRouter>
        <AnalyseStepHealthSourcesList
          healthSourcesList={healthSourcesList}
          fetchMonitoredServiceData={fetchMonitoredServiceDataMock}
          identifier="mock-identifier"
        />
        )
      </MemoryRouter>
    )

    const detailNotPresentMessage = getByText('cv.analyzeStep.healthSources.healthSourceNotPresent')
    expect(detailNotPresentMessage).toBeInTheDocument()
  })

  test('renders health sources table when healthSourcesList is not empty', () => {
    const healthSourcesList = [
      { name: 'Health Source 1', type: 'type1' },
      { name: 'Health Source 2', type: 'type2' }
    ] as any
    const fetchMonitoredServiceDataMock = jest.fn()

    const { getByText } = render(
      <MemoryRouter>
        <AnalyseStepHealthSourcesList
          healthSourcesList={healthSourcesList}
          fetchMonitoredServiceData={fetchMonitoredServiceDataMock}
          identifier="mock-identifier"
        />
      </MemoryRouter>
    )

    const healthSource1Name = getByText('Health Source 1')
    expect(healthSource1Name).toBeInTheDocument()

    const healthSource2Name = getByText('Health Source 2')
    expect(healthSource2Name).toBeInTheDocument()
  })

  test('renders configure health source link', () => {
    const healthSourcesList = [] as HealthSource[]
    const fetchMonitoredServiceDataMock = jest.fn()

    const { getByText } = render(
      <MemoryRouter>
        <AnalyseStepHealthSourcesList
          healthSourcesList={healthSourcesList}
          fetchMonitoredServiceData={fetchMonitoredServiceDataMock}
          identifier="mock-identifier"
        />
      </MemoryRouter>
    )

    const configureHealthSourceLink = getByText('Configure Health Source')
    expect(configureHealthSourceLink).toBeInTheDocument()
  })
})
