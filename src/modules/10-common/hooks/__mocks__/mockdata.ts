export const mockRemotePipelineSummary = {
  status: 'SUCCESS',
  data: {
    name: 'reference test remote',
    identifier: 'reference_test_remote',
    description: 'edited in git',
    tags: {},
    version: 1,
    numOfStages: 1,
    createdAt: 1679466156540,
    lastUpdatedAt: 1679547352181,
    modules: ['pms'],
    executionSummaryInfo: { numOfErrors: [], deployments: [] },
    filters: { pms: { stageTypes: [], featureFlagStepCount: 0 } },
    stageNames: ['test'],
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: '.harness/reference_test.yaml',
      repoName: 'gitX2',
      commitId: null,
      fileUrl: null,
      repoUrl: 'https://github.com/harness/gitX2',
      parentEntityConnectorRef: null,
      parentEntityRepoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    storeType: 'REMOTE',
    connectorRef: 'git_connector',
    isDraft: false
  },
  metaData: null,
  correlationId: '786fbfcc-d717-44ce-a20d-70d068db4aac'
}

export const mockInlinePipelineSummary = {
  status: 'SUCCESS',
  data: {
    name: 'reference test inline',
    identifier: 'reference_test_inline',
    description: 'edited',
    tags: {},
    version: 1,
    numOfStages: 1,
    createdAt: 1679466156540,
    lastUpdatedAt: 1679547352181,
    modules: ['pms'],
    executionSummaryInfo: { numOfErrors: [], deployments: [] },
    filters: { pms: { stageTypes: [], featureFlagStepCount: 0 } },
    stageNames: ['test'],
    gitDetails: {},
    entityValidityDetails: { valid: true, invalidYaml: null },
    storeType: 'INLINE',
    connectorRef: null,
    isDraft: false
  },
  metaData: null,
  correlationId: '786fbfcc-d717-44ce-a20d-70d068db4aac'
}

export const mockTemplateMetadataList = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        accountId: 'accountId',
        orgIdentifier: 'default',
        projectIdentifier: 'sunnyQA_test',
        identifier: 'pipline_using_stage_template',
        name: 'pipline using stage template',
        description: 'edited',
        tags: {},
        versionLabel: 'v1',
        stableTemplate: true,
        templateEntityType: 'Pipeline',
        templateScope: 'project',
        version: 1,
        gitDetails: {
          objectId: null,
          branch: null,
          repoIdentifier: null,
          rootFolder: null,
          filePath: '.harness/pipline_using_stage_template_v1.yaml',
          repoName: 'sunny-git',
          commitId: null,
          fileUrl: null,
          repoUrl: null,
          parentEntityConnectorRef: null,
          parentEntityRepoName: null
        },
        lastUpdatedAt: 1678262133720,
        createdAt: 1678261957386,
        storeType: 'REMOTE',
        connectorRef: 'abc_triaging'
      }
    ],
    pageable: {
      sort: { sorted: true, unsorted: false, empty: false },
      pageSize: 25,
      pageNumber: 0,
      offset: 0,
      paged: true,
      unpaged: false
    },
    totalPages: 1,
    totalElements: 1,
    last: true,
    sort: { sorted: true, unsorted: false, empty: false },
    first: true,
    number: 0,
    numberOfElements: 1,
    size: 25,
    empty: false
  },
  metaData: null,
  correlationId: 'd3bf3466-ad42-4e52-a9cc-6d8e805f21f3'
}
