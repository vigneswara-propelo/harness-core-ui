export const webhookTriggerData = {
  data: {
    content: [
      {
        triggerIdentifier: 'testabc',
        accountId: 'testAcc',
        eventCorrelationId: '64c9636c631aceabcdef',
        payload: '{"sample_key": "sample_value"}',
        eventCreatedAt: 1690919788988,
        finalStatus: 'INVALID_RUNTIME_INPUT_YAML',
        message: 'Failed while requesting Pipeline Execution',
        triggerEventStatus: {
          status: 'FAILED',
          message: 'Invalid runtime input yaml'
        },
        orgIdentifier: 'testOrg',
        projectIdentifier: 'test',
        targetIdentifier: 'test1',
        targetExecutionSummary: {
          triggerId: 'test',
          targetId: 'abcde',
          runtimeInput: 'pipeline: {}\n',
          planExecutionId: null,
          runSequence: null,
          executionStatus: null,
          startTs: null
        }
      }
    ]
  }
}

export const dockerArtifactTriggerData = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        triggerIdentifier: 'testDockerTrigger',
        accountId: 'testAcc',
        payload:
          'type: ARTIFACT\nartifactData {\n  build: "test.20231024.8"\n  metadata {\n    key: "image"\n    value: "docker.dev.harness.io/v2/test:test.20.8"\n  }\n  metadata {\n    key: "tag"\n    value: "test.20.8"\n  }\n  metadata {\n    key: "url"\n    value: "https://docker.dev.harness.io/v2/v2/test/tags/test.20.8"\n  }\n}\nconnectorRef: "testDockerConnector"\nimagePath: "v2/test"\n',
        eventCreatedAt: 1698309786406,
        finalStatus: 'TARGET_EXECUTION_REQUESTED',
        message: 'Pipeline execution was requested successfully',
        triggerEventStatus: {
          status: 'SUCCESS',
          message: 'Target execution requested'
        },
        orgIdentifier: 'NgTriggersOrg',
        projectIdentifier: 'projectTest',
        targetIdentifier: 'ThreeStagesPipeline',
        targetExecutionSummary: {
          triggerId: 'testDockerTrigger',
          targetId: 'ThreeStagesPipeline',
          runtimeInput:
            'pipeline:\n  identifier: ThreeStagesPipeline\n  stages:\n    - stage:\n        identifier: stage1\n        type: Custom\n        variables:\n          - name: stage1var\n            type: String\n            value: a\n    - stage:\n        identifier: stage2\n        type: Custom\n        variables:\n          - name: stage2var\n            type: String\n            value: v\n    - stage:\n        identifier: stage3\n        type: Custom\n        variables:\n          - name: stage3var\n            type: String\n            value: d\n',
          planExecutionId: 'gHfclx3lSSKLP3RxY5grqQ',
          runSequence: 66,
          executionStatus: 'RUNNING',
          startTs: 1698309787637
        }
      },
      {
        triggerIdentifier: 'myDockerTrigger',
        accountId: 'testAcc',
        payload:
          'type: ARTIFACT\nartifactData {\n  build: "test.20231024.8"\n  metadata {\n    key: "image"\n    value: "docker.dev.harness.io/v2/hello-world:test.20231024.8"\n  }\n  metadata {\n    key: "tag"\n    value: "test.20231024.8"\n  }\n  metadata {\n    key: "url"\n    value: "https://docker.dev.harness.io/v2/v2/hello-world/tags/test.20231024.8"\n  }\n}\nconnectorRef: "viniciusNewDockerConnector"\nimagePath: "v2/hello-world"\n',
        eventCreatedAt: 1698309778994,
        finalStatus: 'TARGET_EXECUTION_REQUESTED',
        message: 'Pipeline execution was requested successfully',
        triggerEventStatus: {
          status: 'SUCCESS',
          message: 'Target execution requested'
        },
        orgIdentifier: 'NgTriggersOrg',
        projectIdentifier: 'projectTest',
        targetIdentifier: 'remotePipelieneREmoteTeample',
        targetExecutionSummary: {
          triggerId: 'myDockerTrigger',
          targetId: 'remotePipelieneREmoteTeample',
          runtimeInput:
            'pipeline:\n  identifier: remotePipelieneREmoteTeample\n  stages:\n    - stage:\n        identifier: stage1\n        template:\n          templateInputs:\n            type: Custom\n            variables:\n              - name: myVar1\n                type: String\n                value: abc\n',
          planExecutionId: 'lF3xlhtZQ_mellsJwNR2vA',
          runSequence: 49,
          executionStatus: 'RUNNING',
          startTs: 1698309785963
        }
      }
    ],
    pageable: {
      sort: {
        empty: false,
        unsorted: false,
        sorted: true
      },
      offset: 0,
      pageNumber: 0,
      pageSize: 100
    },
    last: true,
    totalPages: 1,
    totalElements: 2,
    size: 100,
    number: 0,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true
    },
    first: true,
    numberOfElements: 2,
    empty: false
  },
  metaData: null
}
