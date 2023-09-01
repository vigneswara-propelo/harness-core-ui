/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ResponseApprovalInstanceResponse } from 'services/pipeline-ng'

export function encodeURIWithReservedChars(uri: string): string {
  return encodeURIComponent(uri).replace(/[;,/?:@&=+$#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16)
  })
}

export interface ExecutionMetadataType {
  approvalInstanceId: string
  mock?: {
    data?: ResponseApprovalInstanceResponse
    loading?: boolean
  }
}
