import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { MultiTypeDeploymentSummary } from '../MultiTypeDeploymentSummary'
import { GITOPS_STAGE } from './MultiTypeDeploymentSummaryHelper'

export const accountId = 'accountId'
export const projectIdentifier = 'project1'
export const orgIdentifier = 'default'

describe('MultiTypeDeploymentSummary', () => {
  test('render service, env and gitops applications', () => {
    const { container } = render(
      <TestWrapper
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', applicationId: 'applicationId' }}
      >
        <MultiTypeDeploymentSummary stage={GITOPS_STAGE} onToggleClick={jest.fn()} isStagesExpanded={true} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
