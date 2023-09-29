/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import FlagDialog, { FlagDialogProps } from '../FlagDialog'

const trackEventMock = jest.fn()
jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: trackEventMock })
}))

const renderComponent = (props: Partial<FlagDialogProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <FlagDialog environment="nonProduction" {...props} />
    </TestWrapper>
  )
}

describe('FlagDialog', () => {
  test('it should fire telemetary event when Create Flag Dialog opened', async () => {
    renderComponent()

    const createFlagButton = screen.getByRole('button', { name: 'cf.featureFlags.newFlag' })
    expect(createFlagButton).toBeInTheDocument()

    await userEvent.click(createFlagButton)

    expect(trackEventMock).toHaveBeenCalled()
  })
})
