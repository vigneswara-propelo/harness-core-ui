import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import GetStartedWithCDV2 from '../GetStartedWithCDv2'
const trackEventMock = jest.fn()
const mockHistoryPush = jest.fn()
jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: trackEventMock })
}))

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush
  })
}))
describe('GetStartedWithCDV2 Component', () => {
  test('renders without crashing', () => {
    const renderedComponent = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCDV2 />
      </TestWrapper>
    )
    expect(renderedComponent).toMatchSnapshot()
  })

  test('handles button click and navigation', () => {
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCDV2 />
      </TestWrapper>
    )
    const button = getByText('cd.getStartedWithCD.getStartedBtn')
    act(() => {
      fireEvent.click(button)
    })

    expect(trackEventMock).toHaveBeenCalledWith(CDOnboardingActions.GetStartedClicked, {})
  })
})
