import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import MetricPath from '../MetricPath'

const refetchMock = jest.fn()
describe('Metric Path', () => {
  beforeAll(() => {
    jest.spyOn(cvServices, 'useGetAppdynamicsMetricStructure').mockImplementation(
      () =>
        ({
          loading: false,
          error: null,
          data: { data: [{ name: 'Number of Very Slow Calls' }, { name: 'calls per minute' }] },
          refetch: refetchMock
        } as any)
    )
  })
  test('should render', () => {
    const onChange = jest.fn()
    const { container, rerender } = render(
      <TestWrapper>
        <MetricPath
          baseFolder={'basefolder'}
          connectorIdentifier={'TestAppD'}
          appName={'AppDApplication'}
          tier={'cvng'}
          onChange={onChange}
          metricPathValue={{
            metricPathDropdown_0: { path: '', value: 'Number of Very Slow Calls' }
          }}
        />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.metricPathDropdown').length).toEqual(1)
    expect(container.querySelector('input[value="Number of Very Slow Calls"]')).toBeTruthy()

    rerender(
      <TestWrapper>
        <MetricPath
          baseFolder={'basefolder'}
          connectorIdentifier={'TestAppD'}
          appName={'AppDApplication'}
          tier={'cvng'}
          onChange={onChange}
          metricPathValue={{
            metricPathDropdown_0: { path: '', value: 'Number of Very Slow Calls' },
            metricPathDropdown_1: { path: 'Number of Very Slow Calls', value: 'calls per minute' }
          }}
        />
      </TestWrapper>
    )

    expect(container.querySelectorAll('.metricPathDropdown').length).toEqual(2)
    expect(container.querySelector('input[value="Number of Very Slow Calls"]')).toBeTruthy()
    expect(container.querySelector('input[value="calls per minute"]')).toBeTruthy()

    expect(container).toMatchSnapshot()
  })
})
