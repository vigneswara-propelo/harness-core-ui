import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { waitFor, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ConfigFileWrapper } from 'services/cd-ng'

import { mockResponse } from '@platform/connectors/components/CreateConnector/GithubConnector/__test__/githubMocks'
import {
  fileOverrides,
  serviceList
} from '@modules/75-cd/components/EnvironmentsV2/EnvironmentDetails/ServiceOverrides/__test__/__mocks__/mock'

import useConfigFileOverride from '../useConfigFileOverride'

const handleConfigFileOverrideSubmit = jest.fn()

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: mockResponse }
  })
}))

describe('Test hook for config files override', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('hook return create config override function', async () => {
    const { result } = renderHook(useConfigFileOverride, {
      initialProps: {
        fileOverrides: fileOverrides as ConfigFileWrapper[],
        serviceList,
        isReadonly: false,
        fromEnvConfigPage: true,
        handleConfigFileOverrideSubmit: jest.fn(),
        expressions: [],
        allowableTypes: []
      },
      wrapper: (props: React.PropsWithChildren<unknown>) => (
        <TestWrapper queryParams={{ stage: 'C21' }}>{props.children}</TestWrapper>
      )
    })
    expect(result.current.createNewFileOverride).toBeDefined()
    await waitFor(() => {
      result.current.createNewFileOverride()
    })
  })

  test('useConfigFileOverride hook with edit', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useConfigFileOverride({
          fileOverrides: fileOverrides as ConfigFileWrapper[],
          serviceList,
          isReadonly: false,
          fromEnvConfigPage: true,
          handleConfigFileOverrideSubmit: jest.fn(),
          expressions: [],
          allowableTypes: []
        }),
      { wrapper }
    )

    await act(async () => {
      await result.current.editFileOverride()
    })

    expect(handleConfigFileOverrideSubmit).toBeCalledTimes(0)
  })
})
