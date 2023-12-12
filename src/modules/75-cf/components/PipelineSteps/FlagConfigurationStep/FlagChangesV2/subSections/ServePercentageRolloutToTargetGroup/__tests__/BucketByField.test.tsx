/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import * as cfServices from 'services/cf'
import MockFeature from '@cf/utils/testData/data/mockFeature'
import SubSectionTestWrapper, { SubSectionTestWrapperProps } from '../../__tests__/SubSectionTestWrapper.mock'
import BucketByField, { BucketByFieldProps } from '../BucketByField'

const renderComponent = (
  props: Partial<BucketByFieldProps> = {},
  wrapperProps: Partial<SubSectionTestWrapperProps> = {}
): RenderResult =>
  render(
    <SubSectionTestWrapper {...wrapperProps}>
      <BucketByField prefixPath="test" {...props} />
    </SubSectionTestWrapper>
  )

describe('BucketByField', () => {
  const useGetAllTargetAttributesMock = jest.spyOn(cfServices, 'useGetAllTargetAttributes')

  beforeEach(() => {
    jest.clearAllMocks()

    useGetAllTargetAttributesMock.mockReturnValue({
      data: [],
      error: null,
      loading: false,
      refetch: jest.fn()
    } as any)
  })

  test('it should display as FIXED by default', async () => {
    renderComponent({}, { flag: MockFeature })

    expect(await screen.findByPlaceholderText('cf.percentageRollout.bucketBy.placeholder')).toBeInTheDocument()
  })

  test('it should change type when RUNTIME is selected', async () => {
    renderComponent()

    expect(await screen.findByPlaceholderText('cf.percentageRollout.bucketBy.placeholder')).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button'))
    await userEvent.click(await screen.findByText('Runtime input'))

    expect(screen.queryByPlaceholderText('cf.percentageRollout.bucketBy.placeholder')).not.toBeInTheDocument()
    expect(await screen.findByPlaceholderText(RUNTIME_INPUT_VALUE)).toBeInTheDocument()
  })

  test('it should fetch target attributes when the env, project, org and account IDs are available', async () => {
    const environmentIdentifier = 'env1'
    const accountIdentifier = 'acc1'
    const orgIdentifier = 'org1'
    const projectIdentifier = 'proj1'

    const attrs = ['attr1', 'attr2', 'attr3']

    useGetAllTargetAttributesMock.mockReturnValue({
      data: attrs,
      error: null,
      loading: false,
      refetch: jest.fn()
    } as any)

    renderComponent({}, { environmentIdentifier, orgIdentifier, projectIdentifier, accountIdentifier })

    await waitFor(() =>
      expect(useGetAllTargetAttributesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: expect.objectContaining({
            environmentIdentifier,
            orgIdentifier,
            projectIdentifier,
            accountIdentifier
          }),
          lazy: false
        })
      )
    )

    for (const attr of attrs) {
      expect(screen.queryByText(attr)).not.toBeInTheDocument()
    }

    await userEvent.click(screen.getByPlaceholderText('cf.percentageRollout.bucketBy.placeholder'))

    expect(await screen.findByText('cf.percentageRollout.bucketBy.identifierDefault')).toBeInTheDocument()
    expect(screen.getByText('cf.percentageRollout.bucketBy.name')).toBeInTheDocument()

    for (const attr of attrs) {
      expect(screen.getByText(attr)).toBeInTheDocument()
    }
  })
})
