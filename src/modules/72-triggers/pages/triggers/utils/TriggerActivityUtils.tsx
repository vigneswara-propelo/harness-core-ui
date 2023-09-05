/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { get } from 'lodash-es'
import { CellProps, Renderer } from 'react-table'
import { Drawer } from '@blueprintjs/core'
import { MonacoEditorProps } from 'react-monaco-editor'
import { NGTriggerEventHistoryResponse, NGTriggerSourceV2 } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import { TriggerArtifactType } from '@triggers/components/Triggers/TriggerInterface'
import css from '../TriggerLandingPage/TriggerActivityHistoryPage/TriggerActivityHistoryPage.module.scss'

interface PayloadDrawerInterface {
  onClose: () => void
  selectedPayloadRow?: string
  selectedTriggerType?: string
}

export type CellType = Renderer<CellProps<NGTriggerEventHistoryResponse>>

export const RenderColumnEventId: CellType = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal flex={{ align: 'center-center' }} style={{ justifyContent: 'flex-start' }} spacing="xsmall">
      <Text lineClamp={1}>{data.eventCorrelationId}</Text>
    </Layout.Horizontal>
  )
}

export const RenderColumnPayload: CellType = ({ row, column }) => {
  return (
    <Layout.Horizontal flex={{ align: 'center-center' }} style={{ justifyContent: 'flex-start' }}>
      <Icon
        name="main-notes"
        size={20}
        className={css.notesIcon}
        onClick={() => {
          ;(column as any).setShowPayload(true)
          ;(column as any).setSelectedPayloadRow(get(row.original, 'payload'))
        }}
      />
    </Layout.Horizontal>
  )
}

export const PayloadDrawer = ({
  onClose,
  selectedPayloadRow,
  selectedTriggerType
}: PayloadDrawerInterface): React.ReactElement => {
  const { getString } = useStrings()
  const payloadValue = (): string => {
    try {
      const parsedValue = selectedPayloadRow ? JSON.parse(selectedPayloadRow) : ''
      if (parsedValue) {
        return JSON.stringify(parsedValue, null, 2)
      }
      return ''
    } catch (e) {
      return ''
    }
  }
  return (
    <Drawer
      className={css.drawer}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={true}
      hasBackdrop={true}
      usePortal={true}
      isOpen={true}
      size={790}
      title={<Text font={{ variation: FontVariation.H4 }}>{getString('common.payload')}</Text>}
      onClose={onClose}
    >
      <MonacoEditor
        language="yaml"
        value={
          selectedTriggerType === 'Artifact' ||
          selectedTriggerType === 'MultiRegionArtifact' ||
          selectedTriggerType === 'Manifest'
            ? selectedPayloadRow
            : payloadValue()
        }
        data-testid="monaco-editor"
        alwaysShowDarkTheme={true}
        options={
          {
            readOnly: true,
            wordBasedSuggestions: false,
            minimap: {
              enabled: false
            },
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 13,
            scrollBeyondLastLine: false
          } as MonacoEditorProps['options']
        }
      />
    </Drawer>
  )
}

export const isWebhookTrigger = (triggerType: NGTriggerSourceV2['type']): boolean => {
  return triggerType === 'Webhook'
}

export const artifactTriggerTypes: Array<TriggerArtifactType> = [
  'Gcr',
  'Ecr',
  'DockerRegistry',
  'Nexus3Registry',
  'Nexus2Registry',
  'ArtifactoryRegistry',
  'Acr',
  'AmazonS3',
  'Jenkins',
  'CustomArtifact',
  'GoogleArtifactRegistry',
  'GithubPackageRegistry',
  'AzureArtifacts',
  'AmazonMachineImage',
  'GoogleCloudStorage',
  'Bamboo'
]
