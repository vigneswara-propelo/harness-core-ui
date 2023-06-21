/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { LogAnalysisRowMetadata } from '../LogAnalysisRowMetadata'
import { feedbackData } from './LogAnalysisRiskDisplayTooltip.mock'

describe('LogAnalysisRowContextMenu', () => {
  test('should not render the feedback details if isFeedbackApplied flag is false', () => {
    render(
      <TestWrapper>
        <LogAnalysisRowMetadata isFeedbackApplied={false} isFeedbackTicketPresent={false} />
      </TestWrapper>
    )
    expect(screen.queryByTestId(/feedbackContainer/)).not.toBeInTheDocument()
  })

  test('should open the link in new window when the user clicks on the link', async () => {
    const openSpy = jest.spyOn(window, 'open')
    render(
      <TestWrapper>
        <LogAnalysisRowMetadata
          isFeedbackApplied
          isFeedbackTicketPresent
          feedbackApplied={feedbackData}
          ticketDetails={feedbackData.ticket}
        />
      </TestWrapper>
    )
    expect(screen.getByTestId(/feedbackContainer/)).toBeInTheDocument()
    expect(screen.getByTestId(/createdJiraTicketIdDisplay/)).toBeInTheDocument()

    await userEvent.click(screen.getByTestId(/createdJiraTicketIdDisplay/))

    await waitFor(() => expect(openSpy).toHaveBeenCalledWith('abc.com', '_blank'))
  })

  test('should show only ticket information if ticket is present but not applied feedback', async () => {
    render(
      <TestWrapper>
        <LogAnalysisRowMetadata
          isFeedbackApplied={false}
          isFeedbackTicketPresent={true}
          feedbackApplied={feedbackData}
          ticketDetails={feedbackData.ticket}
        />
      </TestWrapper>
    )
    expect(screen.queryByTestId(/feedbackContainer/)).not.toBeInTheDocument()
    expect(screen.getByTestId(/createdJiraTicketIdDisplay/)).toBeInTheDocument()
  })
})
