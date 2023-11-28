/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as notifications from 'services/notifications'
import { useHarnessSupportBot } from 'services/notifications'
import { AIDASupportStep } from '../AIDASupportStep'
import mockResponse from './AIDAResponse.mock.json'

describe('AIDA Support Step', () => {
  test('renders all components', async () => {
    const { findByText, findByRole } = render(
      <TestWrapper>
        <AIDASupportStep name="Ticket Subject" stepName="Ticket Subject" />
      </TestWrapper>
    )
    expect(await findByText('Ticket Subject')).toBeInTheDocument()
    expect(await findByText('common.resourceCenter.ticketmenu.ticketSubjectDescription')).toBeInTheDocument()
    expect(await findByRole('button', { name: 'common.resourceCenter.aida.tryAidaSupport' })).toBeInTheDocument()
    expect(await findByRole('button', { name: 'continue' })).toBeInTheDocument()
    expect(await findByRole('textbox', { name: '' })).toBeInTheDocument()
  })

  test('should display response', async () => {
    jest.clearAllMocks()
    jest
      .spyOn(notifications, 'useHarnessSupportBot')
      .mockImplementation(() => ({ mutate: () => mockResponse, data: mockResponse, loading: false } as any))

    const { findByRole, findByText } = render(
      <TestWrapper>
        <AIDASupportStep name="Ticket Subject" stepName="Ticket Subject" />
      </TestWrapper>
    )

    const subjectBox = (await findByRole('textbox', { name: '' })) as HTMLInputElement
    const user = userEvent.setup()
    await user.type(subjectBox, 'query')

    const tryAIDASupportButton = await findByRole('button', { name: 'common.resourceCenter.aida.tryAidaSupport' })
    user.click(tryAIDASupportButton)

    await waitFor(() => expect(subjectBox?.value).toBe('query'))
    await waitFor(() => expect(useHarnessSupportBot).toBeCalledTimes(1))

    expect(await findByText('common.resourceCenter.aida.displayedResults')).toBeInTheDocument()
    expect(
      await findByText(
        "I'm sorry, I don't understand what you're asking. Can you please provide more context or a specific question?"
      )
    ).toBeInTheDocument()
    const continueButton = await findByRole('button', { name: 'continue' })
    await user.click(continueButton)
    expect(await findByText('common.resourceCenter.ticketmenu.ticketSubjectDescription')).toBeInTheDocument()
  })

  test('buttons should be disabled when subject field is empty', async () => {
    const { findByRole } = render(
      <TestWrapper>
        <AIDASupportStep name="Ticket Subject" stepName="Ticket Subject" />
      </TestWrapper>
    )

    const tryAIDASupportButton = await findByRole('button', { name: 'common.resourceCenter.aida.tryAidaSupport' })
    const continueButton = await findByRole('button', { name: 'continue' })
    expect(tryAIDASupportButton).toBeDisabled()
    expect(continueButton).toBeDisabled()
  })
})
