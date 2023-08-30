import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import UsefulOrNot, { AidaClient } from '../UsefulOrNot'

const trackEventMock = jest.fn()
jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: trackEventMock })
}))

jest.mock('@common/components/ResourceCenter/SubmitTicketModal/SubmitTicketModal', () => ({
  SubmitTicketModal: jest.fn().mockImplementation(() => <div>SubmitTicketModal</div>)
}))

describe('UsefulOrNot', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should fire events on yes vote', async () => {
    const user = userEvent.setup()
    const { getByText } = render(
      <TestWrapper>
        <UsefulOrNot telemetry={{ aidaClient: AidaClient.CS_BOT, metadata: { dummy: 'value' } }} />
      </TestWrapper>
    )
    const yesButton = getByText('yes')

    await user.click(yesButton)
    expect(trackEventMock).toHaveBeenCalledWith('AIDA Vote Received', {
      aidaClient: 'CS_BOT',
      helpful: 'yes',
      metadata: { dummy: 'value' }
    })
  })

  test('should fire events on no vote', async () => {
    const user = userEvent.setup()
    const { getByText } = render(
      <TestWrapper>
        <UsefulOrNot allowCreateTicket telemetry={{ aidaClient: AidaClient.CS_BOT, metadata: { dummy: 'value' } }} />
      </TestWrapper>
    )
    const noButton = getByText('no')

    await user.click(noButton)
    expect(trackEventMock).toHaveBeenCalledWith('AIDA Vote Received', {
      aidaClient: 'CS_BOT',
      helpful: 'no',
      metadata: { dummy: 'value' }
    })

    expect(getByText('common.csBot.ticketOnError')).toBeTruthy()
  })
})
