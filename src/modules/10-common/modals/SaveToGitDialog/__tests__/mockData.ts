import { StoreType } from '@modules/10-common/constants/GitSyncTypes'

export const pipelinePayload = {
  pipeline: {
    name: 'jestTest',
    identifier: 'jestTest',
    projectIdentifier: 'TEST_PROJECT',
    orgIdentifier: 'TEST_ORG',
    tags: {},
    stages: [
      {
        stage: {
          name: 'f',
          identifier: 'f',
          description: '',
          type: 'Custom',
          spec: {
            execution: {
              steps: [
                {
                  step: {
                    type: 'ShellScript',
                    name: 'ShellScript_1',
                    identifier: 'ShellScript_1',
                    spec: {
                      shell: 'Bash',
                      onDelegate: true,
                      source: { type: 'Inline', spec: { script: 'gvf' } },
                      environmentVariables: [],
                      outputVariables: []
                    },
                    timeout: '10m'
                  }
                }
              ]
            }
          },
          tags: {}
        }
      }
    ],
    description: 'description'
  }
}

export const dummyGitDetails = {
  objectId: 'objectId',
  branch: 'jest-testing',
  repoIdentifier: undefined,
  rootFolder: undefined,
  filePath: '.harness/jestTest.yaml',
  repoName: 'gitX2',
  commitId: 'jestCommitId',
  fileUrl: 'https://github.com/harness/gitX2/blob/jest-testing/.harness/jestTest.yaml',
  repoUrl: undefined,
  parentEntityConnectorRef: undefined,
  parentEntityRepoName: undefined
}

export const dummyStoreMetadata = {
  connectorRef: 'git_connector',
  storeType: StoreType.REMOTE,
  repoName: 'gitX2',
  branch: 'jest-testing',
  filePath: '.harness/jestTest.yaml'
}

export const mockBranches = {
  status: 'SUCCESS',
  data: {
    branches: [{ name: 'main' }, { name: 'jest-testing' }, { name: 'main-patch' }, { name: 'dev' }],
    defaultBranch: { name: 'main' }
  },
  metaData: null,
  correlationId: 'correlationId'
}

export const saveResponseWithOPAError = {
  status: 'SUCCESS',
  data: {
    identifier: 'policy_1',
    governanceMetadata: {
      id: '1148737',
      deny: false,
      details: [
        {
          policySetId: '',
          deny: false,
          policyMetadata: [
            {
              policyId: '',
              policyName: 'warn for shellScript',
              severity: 'warning',
              denyMessages: [
                'deployment stage \u0027t1\u0027 has step \u0027ShellScript_1\u0027 that is forbidden type \u0027ShellScript\u0027'
              ],
              status: 'warning',
              identifier: 'warn_for_shellScript',
              accountId: 'px7xd_BFRCi-pfWPYXVjvw',
              orgId: 'AAAsunnyGitExp',
              projectId: 'policy_test',
              created: '1699522620094',
              updated: '1699522620094',
              error: ''
            }
          ],
          policySetName: 'Warn for shell script',
          status: 'warning',
          identifier: 'policy_set_pipeline_forbidden_steps_11_08_17_38',
          created: '1699445400432',
          accountId: 'px7xd_BFRCi-pfWPYXVjvw',
          orgId: 'AAAsunnyGitExp',
          projectId: 'policy_test',
          description: 'Ensuring that deployments do not contain forbidden steps'
        },
        {
          policySetId: '',
          deny: false,
          policyMetadata: [
            {
              policyId: '',
              policyName: 'Block for Approval',
              severity: 'pass',
              denyMessages: [],
              status: 'pass',
              identifier: 'Block_for_Approval',
              accountId: 'px7xd_BFRCi-pfWPYXVjvw',
              orgId: 'AAAsunnyGitExp',
              projectId: 'policy_test',
              created: '1699522504684',
              updated: '1699522504684',
              error: ''
            }
          ],
          policySetName: 'error test',
          status: 'pass',
          identifier: 'error_test',
          created: '1699445657092',
          accountId: 'px7xd_BFRCi-pfWPYXVjvw',
          orgId: 'AAAsunnyGitExp',
          projectId: 'policy_test',
          description: ''
        }
      ],
      message: '',
      timestamp: '1700111661931',
      status: 'warning',
      accountId: 'px7xd_BFRCi-pfWPYXVjvw',
      orgId: 'AAAsunnyGitExp',
      projectId: 'policy_test',
      entity: 'policy_1',
      type: 'pipeline',
      action: 'onsave',
      created: '1700111661916'
    },
    publicAccessResponse: { errorMessage: null, public: false }
  },
  metaData: null,
  correlationId: '6ed0d408-d7a0-4f7f-827d-f187327e8a07'
}
