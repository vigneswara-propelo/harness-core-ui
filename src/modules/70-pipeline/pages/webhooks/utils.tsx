/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { IconProps, SelectOption } from '@harness/uicore'
import { Scope } from '@common/interfaces/SecretsInterface'
import { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { StringsMap } from 'stringTypes'
import { StringKeys } from 'framework/strings'

export interface AddWebhookModalData {
  name: string
  identifier: string
  connectorRef: string
  repo: string
  folderPaths: { id: string; value: string }[]
}

export interface NewWebhookModalProps {
  isEdit: boolean
  initialData: AddWebhookModalData
  entityScope?: Scope
  closeModal: () => void
}
export function processFolderPaths(folderPaths: string[]): { id: string; value: string }[] {
  return folderPaths.map(path => ({ id: uuid('', nameSpace()), value: path }))
}

export const initialWebhookModalData = {
  name: '',
  identifier: '',
  connectorRef: '',
  repo: '',
  folderPaths: processFolderPaths([''])
}

export enum STATUS {
  'loading',
  'error',
  'ok'
}

export interface Error {
  message: RBACError
}

export enum WebhookTabIds {
  ListTab = 'ListTab',
  EventsTab = 'EventsTab'
}

export type WebhookEventStatus = 'FAILED' | 'PROCESSING' | 'QUEUED' | 'SKIPPED' | 'SUCCESSFUL'

export const stringsMap: Readonly<Record<WebhookEventStatus, StringKeys>> = {
  FAILED: 'pipeline.executionFilters.labels.Failed',
  PROCESSING: 'pipeline.eventStatus.processing',
  QUEUED: 'pipeline.eventStatus.queued',
  SKIPPED: 'pipeline.testsReports.skipped',
  SUCCESSFUL: 'pipeline.executionFilters.labels.Success'
}

export function getStatusList(getString: (key: keyof StringsMap) => string): SelectOption[] {
  return Object.keys(stringsMap).map(status => {
    return {
      label: getString(stringsMap[status as WebhookEventStatus]),
      value: status
    }
  })
}

export const iconMap: Record<WebhookEventStatus, IconProps> = {
  SUCCESSFUL: { name: 'tick-circle', size: 10 },
  FAILED: { name: 'warning-sign', size: 9 },
  PROCESSING: { name: 'loading', size: 10 },
  QUEUED: { name: 'queued', size: 10 },
  SKIPPED: { name: 'skipped', size: 8 }
}
