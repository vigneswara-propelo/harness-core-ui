import { render } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { AidaClient } from '@common/components/UsefulOrNot/UsefulOrNot'
import { TestWrapper } from '@common/utils/testUtils'
import AidaFeedback from '../AidaFeedback'

jest.mock('@common/components/ResourceCenter/SubmitTicketModal/SubmitTicketModal', () => ({
  SubmitTicketModal: jest.fn().mockImplementation(() => <div>SubmitTicketModal</div>)
}))

const setShowFeedbackFn = jest.fn()

describe('AidaFeedback', () => {
  test('should render correctly', async () => {
    const { getByRole, getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <AidaFeedback
          telemetry={{ aidaClient: AidaClient.CS_BOT }}
          setShowFeedback={setShowFeedbackFn}
          allowCreateTicket={true}
        />
      </TestWrapper>
    )
    expect(getByText('common.aidaFeedback.title')).toBeTruthy()
    expect(getByText('common.aidaFeedback.notCorrect')).toBeTruthy()
    expect(getByText('common.aidaFeedback.notRelevant')).toBeTruthy()
    expect(getByPlaceholderText('common.aidaFeedback.placeholder')).toBeTruthy()
    expect(getByText('common.csBot.ticketOnError')).toBeTruthy()

    const user = userEvent.setup()
    await user.click(getByRole('close'))
    expect(setShowFeedbackFn).toBeCalledWith(false)
  })

  test('should submit feedback', async () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <AidaFeedback telemetry={{ aidaClient: AidaClient.CS_BOT }} setShowFeedback={setShowFeedbackFn} />
      </TestWrapper>
    )

    const user = userEvent.setup()
    await user.type(getByPlaceholderText('common.aidaFeedback.placeholder'), 'test feedback')
    await user.click(getByText('Submit'))
    expect(getByText('common.aidaFeedback.thanks')).toBeTruthy()
  })
})
