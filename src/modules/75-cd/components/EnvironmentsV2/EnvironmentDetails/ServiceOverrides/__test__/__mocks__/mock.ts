export const serviceList = [
  {
    service: {
      accountId: 'test',
      identifier: 'kustomizeservice',
      orgIdentifier: 'default',
      projectIdentifier: 'testproject',
      name: 'kustomize-service',
      deleted: false,
      tags: {},
      yaml: 'service:\n  name: "kustomize-service"\n  identifier: "kustomizeservice"\n  tags: {}\n',
      v2Service: false
    },
    createdAt: 123456789012345,
    lastModifiedAt: 123456789012341
  }
]

export const fileOverrides = [
  {
    configFile: {
      identifier: 'd',
      type: 'Git',
      spec: {
        store: {
          type: 'Git',
          spec: {
            connectorRef: '<+input>',
            gitFetchType: 'Branch',
            paths: ['d'],
            repoName: 'd',
            branch: 'd'
          }
        },
        valuesPaths: []
      }
    }
  }
]
