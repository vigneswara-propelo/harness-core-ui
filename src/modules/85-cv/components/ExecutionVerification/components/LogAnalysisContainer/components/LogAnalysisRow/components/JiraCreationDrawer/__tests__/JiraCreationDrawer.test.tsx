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

import * as ticketService from 'services/ticket-service/ticketServiceComponents'
import {
  jiraTicketDetailsMock,
  rowDataMockForJira
} from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/components/LogAnalysisRow/__tests__/LogAnalysisRow.mocks'

import { JiraCreationDrawer } from '../JiraCreationDrawer'
import {
  getIdentifiersPayload,
  getPrioritiesDropdownOptions,
  getProjectIssueTypesDropdownOptions
} from '../JiraCreationDrawer.utils'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
jest.spyOn(ticketService, 'useTicketsFindTicketById').mockReturnValue({
  error: null,
  isLoading: false,
  data: jiraTicketDetailsMock
})

describe('JiraViewDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('should show error toaster if any get API call results in error', async () => {
    const onHideCallbackMock = jest.fn()

    const { container } = render(
      <TestWrapper>
        <JiraCreationDrawer onHide={onHideCallbackMock} rowData={rowDataMockForJira} />
      </TestWrapper>
    )

    screen.debug(container, 50000)

    await userEvent.click(screen.getByTestId(/jiraDrawerClose_button_top/))

    await waitFor(() => expect(onHideCallbackMock).toHaveBeenCalled())
  })

  describe('JiraCreationDrawer utils', () => {
    test('getIdentifiersPayload should give correct result', () => {
      const result = getIdentifiersPayload([
        {
          key: 'key1',
          value: {
            value1: '',
            value2: ''
          }
        }
      ])

      expect(result).toEqual({ key1: ['value1', 'value2'] })
    })

    test('getProjectIssueTypesDropdownOptions should return empty array if invalid value is passed', () => {
      const result = getProjectIssueTypesDropdownOptions(undefined)

      expect(result).toEqual([])
    })

    test('getPrioritiesDropdownOptions should return empty array if invalid value is passed', () => {
      const result = getPrioritiesDropdownOptions(undefined)

      expect(result).toEqual([])
    })
  })
})
