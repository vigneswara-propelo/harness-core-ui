/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, screen, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CVCreateDowntime from '../CVCreateDowntime'
import { downtimeResponse } from './CVCreateDowntime.mock'

jest.mock('services/cv', () => ({
  useGetDowntime: jest
    .fn()
    .mockImplementation(() => ({ data: downtimeResponse, loading: false, error: null, refetch: jest.fn() }))
}))

describe('CVCreateDowntime', () => {
  test('should render CVCreateDowntime and show validations', async () => {
    const { container, getByText, getAllByText } = render(
      <TestWrapper>
        <CVCreateDowntime />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(getByText('cv.sloDowntime.addDowntime')).toBeInTheDocument()
      expect(getAllByText('cv.sloDowntime.steps.identification')).toHaveLength(2)
    })

    expect(container).toMatchSnapshot()
  })

  test('should render data on edit page', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cv/orgs/:orgIdentifier/projects/:projectIdentifier/slos/edit/downtime/:identifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', identifier: 'dummy' }}
      >
        <CVCreateDowntime />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(screen.getByText('next'))
    })

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(screen.getByText('save'))
    })
  })
})
