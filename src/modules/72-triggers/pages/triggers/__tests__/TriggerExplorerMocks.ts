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
