/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const webhookListResponse = {
  content: [
    {
      webhook_identifier: 'vikranttestwebhook',
      webhook_name: 'vikrant-test-webhook',
      connector_ref: 'account.DoNotDeleteVikrantGithubConnector',
      repo_name: 'vikrant-gitsync',
      folder_paths: ['test/abc'],
      is_enabled: true,
      event_trigger_time: 1701084797562
    }
  ],
  pagination: {
    total: 1
  }
}

export { webhookListResponse }
