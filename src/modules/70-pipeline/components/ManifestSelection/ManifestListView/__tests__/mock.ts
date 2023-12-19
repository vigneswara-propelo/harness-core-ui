export const manifestsDefaultProps = {
  connectors: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 10,
    content: [
      {
        connector: {
          name: 'id1',
          identifier: 'id1',
          description: '',
          accountIdentifier: 'acc1',
          orgIdentifier: 'org1',
          projectIdentifier: 'p1',
          tags: {},
          type: 'Github',
          spec: {
            url: 'https://github.com/test/p.git',
            validationRepo: '',
            authentication: {
              type: 'Http',
              spec: {
                type: 'UsernameToken',
                spec: {
                  username: 'autouser@ha.io',
                  usernameRef: '',
                  tokenRef: 'account.token'
                }
              }
            },
            apiAccess: {
              type: 'Token',
              spec: {
                tokenRef: 'account.token'
              }
            },
            delegateSelectors: [],
            executeOnDelegate: true,
            proxy: false,
            type: 'Repo'
          }
        },
        createdAt: 1702557975641,
        lastModifiedAt: 1702557975637,
        status: {
          status: 'SUCCESS',
          errorSummary: '',
          testedAt: 1702594186715,
          lastTestedAt: 0,
          lastConnectedAt: 1702594186715
        },
        activityDetails: {
          lastActivityTime: 1702557975751
        },
        harnessManaged: false,
        gitDetails: {
          objectId: '',
          branch: '',
          repoIdentifier: '',
          rootFolder: '',
          filePath: '',
          repoName: '',
          commitId: '',
          fileUrl: '',
          repoUrl: '',
          parentEntityConnectorRef: '',
          parentEntityRepoName: ''
        },
        entityValidityDetails: {
          valid: true,
          invalidYaml: ''
        },
        isFavorite: false
      }
    ],
    pageIndex: 0,
    empty: false,
    pageToken: ''
  },
  listOfManifests: [
    {
      manifest: {
        identifier: 'id1',
        type: 'K8sManifest',
        spec: {
          store: {
            type: 'Github',
            spec: {
              connectorRef: 'account.CDNGAuto_1',
              gitFetchType: 'Branch',
              paths: ['f1'],
              branch: 'b1'
            }
          },
          valuesPaths: ['v1'],
          skipResourceVersioning: false,
          enableDeclarativeRollback: false
        }
      }
    },
    {
      manifest: {
        identifier: 'g11',
        type: 'Values',
        spec: {
          store: {
            type: 'Git',
            spec: {
              connectorRef: 'account.GitConnectorgJDa4slveI',
              gitFetchType: 'Branch',
              paths: ['f1'],
              branch: 'b1'
            }
          }
        }
      }
    },
    {
      manifest: {
        identifier: 'h1',
        type: 'OpenshiftParam',
        spec: {
          store: {
            type: 'Harness',
            spec: {
              files: ['/nginx.yaml']
            }
          }
        }
      }
    },
    {
      manifest: {
        identifier: 'v1',
        type: 'KustomizePatches',
        spec: {
          store: {
            type: 'GitLab',
            spec: {
              connectorRef: 'org.GitLabHelmConnectorForAutomationTest',
              gitFetchType: 'Branch',
              paths: ['f1'],
              branch: 'b1'
            }
          }
        }
      }
    }
  ],
  deploymentType: 'Kubernetes',
  isReadonly: false,
  allowableTypes: ['FIXED', 'RUNTIME', 'EXPRESSION'],
  allowOnlyOneManifest: false,
  availableManifestTypes: [
    'K8sManifest',
    'Values',
    'HelmChart',
    'OpenshiftTemplate',
    'OpenshiftParam',
    'Kustomize',
    'KustomizePatches'
  ]
}
