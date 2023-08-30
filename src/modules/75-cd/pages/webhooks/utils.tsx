/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Scope } from '@common/interfaces/SecretsInterface'

export interface AddWebhookModalData {
  name: string
  identifier: string
  connectorRef: string
  repo: string
  folderPaths: { id: string; value: string }[] | string
}

export interface NewWebhookModalProps {
  isEdit: boolean
  initialData: AddWebhookModalData
  entityScope?: Scope
  closeModal: () => void
}

export const initialWebhookModalData = {
  name: '',
  identifier: '',
  connectorRef: '',
  repo: '',
  folderPaths: []
}
