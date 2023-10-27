/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ResponsePageServiceOverridesResponseDTOV2 } from 'services/cd-ng'

export const serviceOverrideListV2ResponseDataMock: ResponsePageServiceOverridesResponseDTOV2['data'] = {
  content: [
    {
      identifier: 'Env_1_Svc_1',
      environmentRef: 'Env_1',
      infraIdentifier: undefined,
      serviceRef: 'Svc_1',
      orgIdentifier: 'dummyOrg',
      projectIdentifier: 'dummyProject',
      spec: { variables: [{ name: 'var1', type: 'String' }] }
    }
  ]
}
