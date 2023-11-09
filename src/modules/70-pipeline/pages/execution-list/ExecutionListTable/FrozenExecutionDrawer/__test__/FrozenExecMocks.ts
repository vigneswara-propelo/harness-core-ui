/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponseFrozenExecutionDetails } from 'services/cd-ng'

export const frozenExecData: ResponseFrozenExecutionDetails = {
  status: 'SUCCESS',
  data: {
    freezeList: [
      {
        freeze: {
          accountId: 'accountId',
          type: 'MANUAL',
          status: 'Enabled',
          name: 'environmentFreeze',
          description: '',
          tags: {},
          orgIdentifier: 'default',
          projectIdentifier: 'projectId',
          windows: [
            {
              timeZone: 'Asia/Calcutta',
              startTime: '2023-02-23 02:14 PM',
              duration: '1h',
              endTime: undefined,
              recurrence: undefined
            }
          ],
          identifier: 'environmentFreeze',
          createdAt: 1677131089948,
          lastUpdatedAt: 1677143894285,
          freezeScope: 'project',
          yaml: 'freeze:\n  name: environmentFreeze\n  identifier: environmentFreeze\n  entityConfigs:\n    - name: rule1\n      entities:\n        - type: Service\n          filterType: All\n        - type: EnvType\n          filterType: All\n  status: Enabled\n  windows:\n    - timeZone: Asia/Calcutta\n      startTime: 2023-02-23 02:14 PM\n      duration: 1h\n  orgIdentifier: default\n  projectIdentifier: projectId\n  description: ""\n'
        },
        url: 'https://localhost:8181/ng/account/accountId/cd/orgs/default/projects/projectId/setup/freeze-windows/studio/window/environmentFreeze'
      },
      {
        freeze: {
          accountId: 'accountId',
          type: 'GLOBAL',
          status: 'Disabled',
          name: 'Global Freeze',
          description: 'this is a description',
          tags: {},
          identifier: '_GLOBAL_',
          createdAt: 1676199993036,
          lastUpdatedAt: 1678691544115,
          freezeScope: 'account',
          yaml: 'freeze:\n  identifier: _GLOBAL_\n  name: Global Freeze\n  description: "this is a description"\n  status: Disabled\n'
        },
        url: 'https://localhost:8181/ng/account/accountId/settings/freeze-windows'
      },
      {
        freeze: {
          accountId: 'accountId',
          type: 'MANUAL',
          status: 'Enabled',
          name: 'test-B-freeze',
          description: 'B - as in Alphabet',
          tags: {
            bc: '',
            b: ''
          },
          orgIdentifier: 'default',
          projectIdentifier: 'projectId',
          windows: [
            {
              timeZone: 'Asia/Calcutta',
              startTime: '2023-03-21 11:04 PM',
              duration: undefined,
              endTime: '2023-03-31 11:34 PM',
              recurrence: {
                spec: {
                  until: '2023-12-31 11:59 PM'
                },
                type: 'Weekly'
              }
            }
          ],
          currentOrUpcomingWindow: {
            startTime: 1679420040000,
            endTime: 1680285840000
          },
          identifier: 'testBfreeze',
          createdAt: 1679421173057,
          lastUpdatedAt: 1679423567725,
          freezeScope: 'project',
          yaml: 'freeze:\n  name: test-B-freeze\n  identifier: testBfreeze\n  entityConfigs:\n    - name: testSvc3Freeze\n      entities:\n        - type: Service\n          filterType: Equals\n          entityRefs:\n            - svc3\n        - type: Environment\n          filterType: All\n        - type: EnvType\n          filterType: All\n  status: Enabled\n  orgIdentifier: Ng_Pipelines_K8s_Organisations\n  projectIdentifier: projectId\n  windows:\n    - timeZone: Asia/Calcutta\n      startTime: 2023-03-21 11:04 PM\n      recurrence:\n        type: Weekly\n      endTime: 2023-03-31 11:34 PM\n  description: B - as in Alphabet\n  tags:\n    b: ""\n    bc: ""\n'
        }
      }
    ]
  },
  metaData: undefined,
  correlationId: 'e260719e-83de-4455-be1c-c87266853a25'
}
