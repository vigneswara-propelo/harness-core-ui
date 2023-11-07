/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import * as cfServices from 'services/cf'
import MockFeature from '@cf/utils/testData/data/mockFeature'
import { buildMockTargetGroupsData } from '@cf/utils/testData/data/buildMockTargetGroupsData.mock'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import SubSectionTestWrapper, { SubSectionTestWrapperProps } from '../../__tests__/SubSectionTestWrapper.mock'
import * as getAllowableTypesModule from '../../../utils/getAllowableTypes'
import TargetGroupField, { TargetGroupFieldProps } from '../TargetGroupField'

const renderComponent = (
  props: Partial<TargetGroupFieldProps> = {},
  wrapperProps: Partial<SubSectionTestWrapperProps> = {}
): RenderResult =>
  render(
    <SubSectionTestWrapper {...wrapperProps}>
      <TargetGroupField prefixPath="test" {...props} />
    </SubSectionTestWrapper>
  )

describe('TargetGroupField', () => {
  const getAllowableTypesMock = jest.spyOn(getAllowableTypesModule, 'getAllowableTypes')
  const useGetAllSegmentsMock = jest.spyOn(cfServices, 'useGetAllSegments')

  beforeEach(() => {
    jest.clearAllMocks()

    getAllowableTypesMock.mockReturnValue([
      MultiTypeInputType.FIXED,
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.EXPRESSION
    ])

    useGetAllSegmentsMock.mockReturnValue({
      data: buildMockTargetGroupsData(),
      error: null,
      loading: false,
      refetch: jest.fn()
    } as any)
  })

  test('it should switch to RUNTIME when FIXED is not allowed', async () => {
    getAllowableTypesMock.mockReturnValue([MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION])

    renderComponent()

    expect(await screen.findByPlaceholderText(RUNTIME_INPUT_VALUE)).toBeInTheDocument()
  })

  test('it should switch to EXPRESSION when FIXED and RUNTIME are not allowed', async () => {
    getAllowableTypesMock.mockReturnValue([MultiTypeInputType.EXPRESSION])

    renderComponent()

    expect(await screen.findByPlaceholderText('<+expression>')).toBeInTheDocument()
  })

  test('it should display as FIXED by default', async () => {
    renderComponent({}, { flag: MockFeature })

    expect(await screen.findByPlaceholderText('cf.pipeline.flagConfiguration.selectTargetGroup')).toBeInTheDocument()
  })

  test('it should change type when RUNTIME is selected', async () => {
    renderComponent({}, { environmentIdentifier: 'abc' })

    expect(await screen.findByPlaceholderText('cf.pipeline.flagConfiguration.selectTargetGroup')).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button'))
    await userEvent.click(await screen.findByText('Runtime input'))

    expect(screen.queryByPlaceholderText('cf.pipeline.flagConfiguration.selectTargetGroup')).not.toBeInTheDocument()
    expect(await screen.findByPlaceholderText(RUNTIME_INPUT_VALUE)).toBeInTheDocument()
  })

  test('it should show a message when the mode is deployment form but no environment has been selected', async () => {
    renderComponent({}, { mode: StepViewType.DeploymentForm, environmentIdentifier: undefined })

    expect(await screen.findByText('cf.pipeline.flagConfiguration.pleaseSelectEnvironment')).toBeInTheDocument()
  })

  test('it should try to refetch target groups when the user searches', async () => {
    const refetchMock = jest.fn()
    useGetAllSegmentsMock.mockReturnValue({
      data: buildMockTargetGroupsData(),
      error: null,
      loading: false,
      refetch: refetchMock
    } as any)

    renderComponent(
      {},
      {
        path: '/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier',
        pathParams: {
          projectIdentifier: 'proj123',
          orgIdentifier: 'org123',
          accountId: 'acc123'
        }
      }
    )

    await userEvent.type(screen.getByPlaceholderText('cf.pipeline.flagConfiguration.selectTargetGroup'), 'x')

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalledWith(
        expect.objectContaining({ queryParams: expect.objectContaining({ name: 'x' }) })
      )
    })
  })
})
