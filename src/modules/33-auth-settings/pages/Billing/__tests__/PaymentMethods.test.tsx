/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, RenderResult } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetDefaultCard, useCreateClientSecret, useSaveCard } from 'services/cd-ng'
import PaymentMethods from '../PaymentMethods'

jest.mock('services/cd-ng')

const useGetPrimaryCarddMock = useGetDefaultCard as jest.MockedFunction<any>
const useCreateClientSecretMock = useCreateClientSecret as jest.MockedFunction<any>
const useSaveCardMock = useSaveCard as jest.MockedFunction<any>
useCreateClientSecretMock.mockImplementation(() => {
  return {
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementationOnce(() => {
      return {
        status: 'SUCCESS',
        data: 'sdaads'
      }
    })
  }
})

useSaveCardMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})
useGetPrimaryCarddMock.mockImplementation(() => {
  return {
    data: '',
    refetch: jest.fn()
  }
})
describe('billing page payment method', () => {
  let renderObj: RenderResult
  beforeEach(() => {
    renderObj = render(
      <TestWrapper>
        <PaymentMethods />
      </TestWrapper>
    )
  })
  afterEach(() => {
    renderObj.unmount()
  })
  test('render payment method card', async () => {
    const { container } = renderObj

    expect(container).toMatchSnapshot('payment method card snapshot')
  })

  test('adding new card', async () => {
    const { getByText } = renderObj
    const addText = getByText('authSettings.addCard')
    expect(addText).toBeTruthy()
    // click on add button

    fireEvent.click(addText)
  })
})
