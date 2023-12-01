/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const webhooksGetResponse = {
  content: {
    webhook_identifier: 'vikranttestwebhook',
    webhook_name: 'vikrant-test-webhook',
    connector_ref: 'account.DoNotDeleteVikrantGithubConnector',
    repo_name: 'vikrant-gitsync',
    folder_paths: [''],
    is_enabled: false,
    event_trigger_time: null
  }
}

const webhooksGetResponseWithNoFolderPaths = {
  content: {
    webhook_identifier: 'vikranttestwebhook',
    webhook_name: 'vikrant-test-webhook',
    connector_ref: 'account.DoNotDeleteVikrantGithubConnector',
    repo_name: 'vikrant-gitsync',
    folder_paths: [],
    is_enabled: false,
    event_trigger_time: null
  }
}

const webhookEventsResponse = {
  content: [
    {
      author_name: 'Vikrant Gupta',
      event_identifier: '1dZrcudYSHK9rf4kcXBNXw',
      webhook_identifier: 'vikranttestwebhook',
      payload: '{}',
      event_trigger_time: 1701084797562,
      repo_name: null,
      event_status: 'SUCCESSFUL'
    }
  ]
}

export { webhooksGetResponse, webhooksGetResponseWithNoFolderPaths, webhookEventsResponse }
