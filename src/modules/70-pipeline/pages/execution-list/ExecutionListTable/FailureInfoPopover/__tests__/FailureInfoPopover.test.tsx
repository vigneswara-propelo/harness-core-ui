/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getAllByText, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper, findPopoverContainer } from '@modules/10-common/utils/testUtils'
import { FailureInfoPopover } from '../FailureInfoPopover'
import { failureInfo, pathParams, queryParams, rowData } from './mock'

describe('FailureInfoPopover', () => {
  test('Should render failure popover with failure info', async () => {
    const { getByText } = render(
      <TestWrapper>
        <FailureInfoPopover
          failureInfo={failureInfo}
          pathParams={pathParams as any}
          queryParams={queryParams as any}
          rowData={rowData as any}
        />
      </TestWrapper>
    )

    const failureInfoSummaryText = getByText('activeInstance')
    userEvent.hover(failureInfoSummaryText)
    const user = userEvent.setup()
    await user.hover(failureInfoSummaryText)

    await waitFor(() => {
      const popover = findPopoverContainer() as HTMLElement
      const failureMessages = getAllByText(popover!, 'Kubernetes API call failed with message: Forbidden')
      expect(failureMessages.length).toBe(3)
    })
  })
})
