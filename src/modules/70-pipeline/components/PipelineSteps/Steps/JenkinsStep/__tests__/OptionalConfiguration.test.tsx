/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import OptionalConfiguration from '../OptionalConfiguration'

describe('Jira Approval fetch projects', () => {
  test('OptionalConfiguration: with readonly false', () => {
    const { getByLabelText } = render(
      <TestWrapper>
        <OptionalConfiguration readonly={false} />
      </TestWrapper>
    )
    expect(getByLabelText('pipeline.jenkinsStep.unstableStatusAsSuccess')).not.toBeDisabled()
    expect(getByLabelText('pipeline.jenkinsStep.useConnectorUrlForJobExecution')).not.toBeDisabled()
  })
  test('OptionalConfiguration: with readonly true', () => {
    const { getByLabelText } = render(
      <TestWrapper>
        <OptionalConfiguration readonly={true} />
      </TestWrapper>
    )
    expect(getByLabelText('pipeline.jenkinsStep.unstableStatusAsSuccess')).toBeDisabled()
    expect(getByLabelText('pipeline.jenkinsStep.useConnectorUrlForJobExecution')).toBeDisabled()
  })
})
