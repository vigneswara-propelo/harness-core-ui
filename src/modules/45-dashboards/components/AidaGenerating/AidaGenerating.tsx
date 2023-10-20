/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { useToaster, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useDashboardsContext } from '@dashboards/pages/DashboardsContext'
import { Message, MessageType } from '@dashboards/types/AidaTypes.types'
import { useTelemetry } from '@modules/10-common/hooks/useTelemetry'
import { CDBActions, Category } from '@modules/10-common/constants/TrackingConstants'
import { useStrings } from 'framework/strings'
import { AiAddTileRequestBody, useAiGenerateTile } from 'services/custom-dashboards'
import css from './AidaGenerating.module.scss'

interface AidaGeneratingProps {
  messages: Message[]
  onError: () => void
}

const getValueFromMessage = (messages: Message[], messageType: MessageType, key?: string): string => {
  for (const message of messages) {
    if (messageType === MessageType.Prompt && message.promptMapping) {
      const matchingMapping = message.promptMapping.find(mapping => mapping.key === key)
      if (matchingMapping) {
        return matchingMapping.value
      }
    }
    if (messageType === MessageType.Text && message.type === MessageType.Text) {
      return message.content
    }
  }
  return ''
}

const AidaGenerating: React.FC<AidaGeneratingProps> = ({ messages, onError }) => {
  const { updateAiTileDetails } = useDashboardsContext()
  const { showSuccess, showError } = useToaster()
  const { trackEvent } = useTelemetry()

  const { accountId, viewId } = useParams<Record<string, string>>()
  const { getString } = useStrings()

  const { mutate: generateAiTile } = useAiGenerateTile({
    dashboard_id: viewId,
    queryParams: { accountId },
    pathParams: { dashboard_id: viewId }
  })

  React.useEffect(() => {
    const performAiTileGeneration = async (requestBody: AiAddTileRequestBody): Promise<void> => {
      try {
        const { resource } = await generateAiTile(requestBody)
        if (resource) {
          trackEvent(CDBActions.AidaGenerateDashboardTileSuccess, {
            category: Category.CUSTOM_DASHBOARDS,
            requestBody
          })
          showSuccess(getString('dashboards.aida.successGeneratingTile'))
          updateAiTileDetails(requestBody)
        }
      } catch (e) {
        trackEvent(CDBActions.AidaGenerateDashboardTileFailure, {
          category: Category.CUSTOM_DASHBOARDS,
          requestBody
        })
        showError(getString('dashboards.aida.failureGeneratingTile'))
        onError()
      }
    }

    if (messages.length) {
      const model = getValueFromMessage(messages, MessageType.Prompt, 'model')
      const explore = getValueFromMessage(messages, MessageType.Prompt, 'explore')
      const query = getValueFromMessage(messages, MessageType.Text)

      const aiAddTileRequestBody: AiAddTileRequestBody = { model, explore, query }

      performAiTileGeneration(aiAddTileRequestBody)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generateAiTile, messages, onError, updateAiTileDetails])

  return (
    <Text
      font={{ variation: FontVariation.SMALL_SEMI }}
      color={Color.PURPLE_500}
      className={css.assistantMsg}
      rightIcon="loading"
      rightIconProps={{ style: { verticalAlign: 'middle' } }}
    >
      {getString('dashboards.aida.generating')}
    </Text>
  )
}

export default AidaGenerating
