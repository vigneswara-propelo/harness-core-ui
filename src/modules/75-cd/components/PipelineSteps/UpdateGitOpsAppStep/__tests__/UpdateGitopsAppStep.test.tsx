/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, screen, waitFor, findByText as findByTextGlobal } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { mockApplicationResponse } from './data'
import { UpdateGitOpsApp } from '../UpdateGitOpsAppStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/gitops', () => ({
  useApplicationServiceListApps: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => mockApplicationResponse),
    cancel: jest.fn()
  })),
  useAgentRepositoryServiceGetAppDetails: jest
    .fn()
    .mockImplementation(() => ({ loading: false, refetch: jest.fn(), data: undefined }))
}))

describe('UpdateGitOpsAppStep tests', () => {
  beforeEach(() => {
    factory.registerStep(new UpdateGitOpsApp())
  })

  test('basic test for rendering', () => {
    act(() => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.UpdateGitOpsApp} stepViewType={StepViewType.Edit} />
      )
      expect(container).toMatchSnapshot()
    })
  })
  test.only('Select Helm App and see if Helm options are appearing', async () => {
    render(<TestStepWidget initialValues={{}} type={StepType.UpdateGitOpsApp} stepViewType={StepViewType.Edit} />)
    const selectBox = screen.getByPlaceholderText('selectApplication')
    userEvent.click(selectBox)

    await waitFor(() => expect(document.body.querySelector('.bp3-menu')).toBeInTheDocument())

    const menu = document.body.querySelector<HTMLDivElement>('.bp3-menu')!
    await act(async () => {
      const app1 = await findByTextGlobal(menu, 'helmapp1 (agent1)')
      await userEvent.click(app1)
    })

    expect(document.body.querySelector('.formGroup')).toMatchSnapshot('helm options visible')
  })
})
