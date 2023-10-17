/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockApplicationResponse = {
  content: [
    {
      agentIdentifier: 'agent1',
      name: 'helmapp1',
      repoIdentifier: 'account.ishant',
      app: {
        spec: {
          source: {
            helm: {},
            repoURL: 'https://github.com/wings-software/ishant-local-gitsync.git',
            path: 'single',
            targetRevision: 'sales-demo'
          }
        },
        status: {
          sourceType: 'Helm'
        }
      }
    },
    {
      agentIdentifier: 'agent1',
      name: 'kustomize1',
      repoIdentifier: 'ishant2',
      app: {
        spec: {
          source: {
            repoURL: 'https://github.com/wings-software/ishant-local-gitsync.git',
            path: 'single',
            targetRevision: 'hello-demo'
          }
        },
        status: {
          sourceType: 'Kustomize'
        }
      }
    }
  ]
}
