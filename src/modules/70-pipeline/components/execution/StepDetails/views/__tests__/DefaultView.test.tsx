/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { getDefaultReducerState } from '@pipeline/components/LogsContent/LogsState/utils'
import type { UseActionCreatorReturn } from '@pipeline/components/LogsContent/LogsState/actions'
import { DefaultView } from '../DefaultView/DefaultView'
import { executionMetadata, policyOutputDetails } from './mock'

const actions: UseActionCreatorReturn = {
  createSections: jest.fn(),
  fetchSectionData: jest.fn(),
  fetchingSectionData: jest.fn(),
  updateSectionData: jest.fn(),
  toggleSection: jest.fn(),
  updateManuallyToggled: jest.fn(),
  resetSection: jest.fn(),
  search: jest.fn(),
  resetSearch: jest.fn(),
  goToNextSearchResult: jest.fn(),
  goToPrevSearchResult: jest.fn()
}

jest.mock('@pipeline/components/LogsContent/useLogsContent.tsx', () => ({
  useLogsContent: jest.fn(() => ({
    state: getDefaultReducerState(),
    actions
  }))
}))

const aidaMock = {
  loading: false,
  data: {
    data: {
      valueType: 'Boolean',
      value: 'true'
    }
  }
}

jest.mock('services/cd-ng', () => ({
  useGetSettingValue: jest.fn().mockImplementation(() => aidaMock)
}))

const checkPolicyEnforcementTab = async (): Promise<void> => {
  const policyEnforcementTab = await screen.findByRole('tab', {
    name: 'pipeline.policyEnforcement.title'
  })
  await userEvent.click(policyEnforcementTab)
  const tabpanel = screen.getByRole('tabpanel', {
    name: 'pipeline.policyEnforcement.title'
  })
  const policyEvaluationText = await within(tabpanel).findByText('pipeline.policyEvaluations.title')

  expect(policyEvaluationText).toBeInTheDocument()
}

describe('Default View Test', () => {
  test('renders snapshot', async () => {
    const { getByText } = render(
      <TestWrapper>
        <DefaultView
          step={{
            status: ExecutionStatusEnum.InterventionWaiting,
            outcomes: policyOutputDetails
          }}
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )
    expect(getByText('pipeline.failureStrategies.strategiesLabel.ManualIntervention')).toBeInTheDocument()

    await checkPolicyEnforcementTab()
  })

  test('error in step evaluation', () => {
    const { getByText } = render(
      <TestWrapper>
        <DefaultView
          step={{
            status: ExecutionStatusEnum.Failed,
            executableResponses: [
              {
                skipTask: {
                  message: 'Failure to evaluate step'
                }
              }
            ]
          }}
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )

    expect(getByText('Failure to evaluate step')).toBeInTheDocument()
  })
})
