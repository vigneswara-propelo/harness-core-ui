import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import DocsChat from '../DocsChat'

import mockResponse from './DocsChat.mock.json'
import aidaMock from './aidaSetting.mock.json'

jest.mock('services/notifications', () => ({
  useHarnessSupportBot: jest.fn().mockImplementation(() => {
    return {
      mutate: () => mockResponse,
      data: mockResponse,
      loading: false
    }
  })
}))

jest.mock('services/cd-ng', () => ({
  useGetSettingValue: jest.fn().mockImplementation(() => {
    return Object.assign(aidaMock, { data: { data: { value: 'false' } } })
  })
}))

jest.mock('@common/components/ResourceCenter/SubmitTicketModal/SubmitTicketModal', () => ({
  SubmitTicketModal: jest.fn().mockImplementation(() => <div>SubmitTicketModal</div>)
}))

jest.mock('@common/hooks', () => ({
  useDeepCompareEffect: jest.fn().mockImplementation(jest.fn()),
  useLocalStorage: jest.fn().mockImplementation((_key, defaultVal) => [defaultVal, jest.fn()])
}))
describe('DocsChat with AIDA disabled', () => {
  test('should fail if eula is not accepted', async () => {
    const { getByText } = render(
      <TestWrapper>
        <DocsChat />
      </TestWrapper>
    )

    expect(getByText('common.csBot.eulaNotAccepted')).toBeDefined()
  })
})
