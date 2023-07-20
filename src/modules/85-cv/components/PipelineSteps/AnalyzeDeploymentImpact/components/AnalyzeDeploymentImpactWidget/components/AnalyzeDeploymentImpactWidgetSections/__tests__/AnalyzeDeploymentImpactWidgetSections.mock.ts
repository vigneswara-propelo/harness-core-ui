/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const serviceEnvRefList = [
  { environmentRef: 'env1', serviceRef: 'account.test_scoped_service' },
  { environmentRef: 'env2', serviceRef: 'account.test_scoped_service' },
  { environmentRef: 'env1', serviceRef: 'account.test_AcccountLevel_MS' },
  { environmentRef: 'env2', serviceRef: 'account.test_AcccountLevel_MS' }
]

export const stageMetaMock = {
  status: 'SUCCESS',
  data: {
    environmentRef: null,
    serviceRef: null,
    serviceEnvRefList: [serviceEnvRefList[0]]
  },
  metaData: null,
  correlationId: '2fa503ec-4184-485e-acb5-083292e92098'
}

export const stageMetaWithMultipleEnvMock = {
  status: 'SUCCESS',
  data: {
    environmentRef: null,
    serviceRef: null,
    serviceEnvRefList
  },
  metaData: null,
  correlationId: '2fa503ec-4184-485e-acb5-083292e92098'
}
