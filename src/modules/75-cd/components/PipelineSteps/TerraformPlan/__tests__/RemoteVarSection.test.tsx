/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiTypeInputType } from '@harness/uicore'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import type { TerraformPlanProps } from '../../Common/Terraform/TerraformInterfaces'

import TFRemoteSection from '../InputSteps/RemoteVarSection'

const defaultProps: TerraformPlanProps = {
  allowableTypes: [MultiTypeInputType.FIXED],
  initialValues: {
    name: 'vf',
    identifier: 'TerraformPlan_1',
    type: 'TerraformPlan',
    spec: {}
  },
  inputSetData: {
    template: {
      name: 'vf1',
      identifier: 'TerraformPlan_1',
      type: 'TerraformPlan',
      spec: {}
    },

    path: 'stages[1].stage.spec.execution.steps[0].step'
  }
}

const remoteVar = {
  varFile: {
    identifier: 'f',
    type: 'Remote',
    spec: {
      optional: '<+input>',
      store: {
        type: 'GitLab',
        spec: {
          branch: '<+input>',
          paths: '<+input>'
        }
      }
    }
  }
}

describe('Remote var section tests', () => {
  test('render RemoteVarSection', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <TFRemoteSection {...defaultProps} remoteVar={remoteVar} index={0} />
      </TestWrapper>
    )
    expect(container).toBeDefined()
  })
})
