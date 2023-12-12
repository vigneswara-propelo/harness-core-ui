/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import { TargetAttributesProvider, useTargetAttributes } from '@cf/hooks/useTargetAttributes'
import * as serviceHooks from 'services/cf'
import { sortStrings } from '@cf/utils/sortStrings'

const sampleTargetAttributes = ['test_1', 'a_sample', 'sample_3']

describe('useTargetAttributes', () => {
  let useGetAllTargetAttributesMock: jest.SpyInstance

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const renderTargetAttributesHook = ({
    loading = false,
    data = sampleTargetAttributes,
    ...serviceProps
  }: {
    loading?: boolean
    data?: string[]
    projectIdentifier?: string
    orgIdentifier?: string
    accountIdentifier?: string
    environmentIdentifier?: string
  } = {}) => {
    useGetAllTargetAttributesMock = jest
      .spyOn(serviceHooks, 'useGetAllTargetAttributes')
      .mockReturnValue({ loading, data } as any)

    return renderHook(() => useTargetAttributes(), {
      wrapper: TargetAttributesProvider,
      initialProps: {
        projectIdentifier: 'TEST_PROJECT',
        orgIdentifier: 'TEST_ORG',
        accountIdentifier: 'TEST_ACC',
        environmentIdentifier: 'TEST_ENV',
        ...serviceProps
      }
    })
  }

  beforeEach(() => jest.resetAllMocks())

  test('it should return loading, targetAttributes and targetAttributeOptions', async () => {
    const { result } = renderTargetAttributesHook()

    expect(result.current).toHaveProperty('loading', false)
    expect(result.current).toHaveProperty('targetAttributes')
    expect(result.current).toHaveProperty('targetAttributeOptions')
  })

  test('it should sort the targetAttributes into alphabetical order', () => {
    const { result } = renderTargetAttributesHook()
    const sortedSampleTargetAttributes = sortStrings(sampleTargetAttributes)

    expect(result.current).toHaveProperty('targetAttributes', sortedSampleTargetAttributes)
  })

  test('it should call the useGetAllTargetAttributes hook with the appropriate params', () => {
    const projectIdentifier = 'TEST_PROJECT_123'
    const orgIdentifier = 'TEST_ORG_123'
    const accountIdentifier = 'TEST_ACC_123'
    const environmentIdentifier = 'ENV_123'

    renderTargetAttributesHook({ projectIdentifier, orgIdentifier, accountIdentifier, environmentIdentifier })

    expect(useGetAllTargetAttributesMock).toHaveBeenCalled()

    const params = useGetAllTargetAttributesMock.mock.calls[0][0].queryParams
    expect(params).toHaveProperty('projectIdentifier', projectIdentifier)
    expect(params).toHaveProperty('orgIdentifier', orgIdentifier)
    expect(params).toHaveProperty('accountIdentifier', accountIdentifier)
    expect(params).toHaveProperty('environmentIdentifier', environmentIdentifier)
  })

  test('it should return targetAttributeOptions as an array of SelectOption objects', async () => {
    const { result } = renderTargetAttributesHook()

    expect(result.current.targetAttributeOptions).toEqual(
      expect.arrayContaining(sampleTargetAttributes.map(attr => ({ label: attr, value: attr })))
    )
  })
})
