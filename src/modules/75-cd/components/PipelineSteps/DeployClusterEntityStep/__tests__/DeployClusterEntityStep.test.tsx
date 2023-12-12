/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'

import { StepViewType } from '@modules/70-pipeline/components/AbstractSteps/Step'
import { StepType } from '@modules/70-pipeline/components/PipelineSteps/PipelineStepInterface'

import { DeployClusterEntityStep } from '../DeployClusterEntityStep'

jest.mock('services/cd-ng', () => ({
  useGetClusterList: jest.fn().mockReturnValue({
    data: {
      content: [
        [
          {
            clusterRef: 'cluster22',
            orgIdentifier: 'default',
            projectIdentifier: 'MeenaSyncStep',
            agentIdentifier: 'syncstepqaagent',
            accountIdentifier: '1bvyLackQK-Hapk25-Ry4w',
            envRef: 'Prod',
            linkedAt: 1699386562826,
            scope: 'PROJECT',
            name: 'cluster22',
            tags: {}
          },
          {
            clusterRef: 'cls',
            orgIdentifier: 'default',
            projectIdentifier: 'MeenaSyncStep',
            agentIdentifier: 'account.logtest',
            accountIdentifier: '1bvyLackQK-Hapk25-Ry4w',
            envRef: 'Prod',
            linkedAt: 1699386562825,
            scope: 'PROJECT',
            name: 'cls',
            tags: {}
          },
          {
            clusterRef: 'cluster11',
            orgIdentifier: 'default',
            projectIdentifier: 'MeenaSyncStep',
            agentIdentifier: 'p1test',
            accountIdentifier: '1bvyLackQK-Hapk25-Ry4w',
            envRef: 'Prod',
            linkedAt: 1699386562825,
            scope: 'PROJECT',
            name: 'cluster11',
            tags: {}
          },
          {
            clusterRef: 'incluster',
            orgIdentifier: 'default',
            projectIdentifier: 'MeenaSyncStep',
            agentIdentifier: 'syncstepqaagent',
            accountIdentifier: '1bvyLackQK-Hapk25-Ry4w',
            envRef: 'Prod',
            linkedAt: 1699386562825,
            scope: 'PROJECT',
            name: 'incluster',
            tags: {}
          },
          {
            clusterRef: 'ishantclusterorgagent',
            orgIdentifier: 'default',
            projectIdentifier: 'MeenaSyncStep',
            agentIdentifier: 'org.cyorgagentaug1',
            accountIdentifier: '1bvyLackQK-Hapk25-Ry4w',
            envRef: 'Prod',
            linkedAt: 1699386562824,
            scope: 'PROJECT',
            name: 'ishantclusterorgagent',
            tags: {}
          },
          {
            clusterRef: 'account.incluster',
            agentIdentifier: 'account.rollouts',
            accountIdentifier: '1bvyLackQK-Hapk25-Ry4w',
            envRef: 'Prod',
            linkedAt: 1699304001158,
            scope: 'ACCOUNT',
            name: 'in-cluster',
            tags: {}
          },
          {
            clusterRef: 'cluster22',
            orgIdentifier: 'default',
            projectIdentifier: 'MeenaSyncStep',
            agentIdentifier: 'meena',
            accountIdentifier: '1bvyLackQK-Hapk25-Ry4w',
            envRef: 'Prod',
            linkedAt: 1686194158813,
            scope: 'PROJECT',
            name: 'cluster22',
            tags: {}
          },
          {
            clusterRef: 'cluster11',
            orgIdentifier: 'default',
            projectIdentifier: 'MeenaSyncStep',
            agentIdentifier: 'meena',
            accountIdentifier: '1bvyLackQK-Hapk25-Ry4w',
            envRef: 'Prod',
            linkedAt: 1686194158813,
            scope: 'PROJECT',
            name: 'cluster11',
            tags: {}
          }
        ]
      ]
    },
    refetch: jest.fn()
  } as any)
}))

describe('DeployCluster Tests', () => {
  factory.registerStep(new DeployClusterEntityStep())

  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('initial render', async () => {
    const { findByText } = render(
      <TestStepWidget
        customStepProps={{
          isMultipleCluster: true
        }}
        initialValues={{
          environmentRef: '',
          deployToAll: '',
          gitOpsClusters: ''
        }}
        type={StepType.DeployClusterEntity}
        stepViewType={StepViewType.DeploymentForm}
        allValues={{}}
        path={'stages[0].stage.spec.environment'}
        template={{ deployToAll: '<+input>', gitOpsClusters: '<+input>' }}
      />
    )

    expect(await findByText('pipeline.specifyGitOpsClusters')).toBeInTheDocument()
    const allClstrsTxt = await findByText('common.allClusters')
    expect(allClstrsTxt).toBeInTheDocument()
  })
})
