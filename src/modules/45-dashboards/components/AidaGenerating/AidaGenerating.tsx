/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useDashboardsContext } from '@dashboards/pages/DashboardsContext'
import { Message, MessageType, VisualizationType } from '@dashboards/types/AidaTypes.types'
import { useStrings } from 'framework/strings'
import { AiAddTileRequestBody, useAiGenerateTile } from 'services/custom-dashboards'
import css from './AidaGenerating.module.scss'

interface AidaGeneratingProps {
  messages: Message[]
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

const AidaGenerating: React.FC<AidaGeneratingProps> = ({ messages }) => {
  const { updateAiTileDetails } = useDashboardsContext()
  const { accountId, viewId } = useParams<Record<string, string>>()
  const { getString } = useStrings()

  const { mutate: generateAiTile } = useAiGenerateTile({
    dashboard_id: viewId,
    queryParams: { accountId },
    pathParams: { dashboard_id: viewId }
  })

  React.useEffect(() => {
    const performAiTileGeneration = async (requestBody: AiAddTileRequestBody): Promise<void> => {
      const { resource } = await generateAiTile(requestBody)
      if (resource) {
        updateAiTileDetails(requestBody)
      }
    }

    if (messages.length) {
      const model = getValueFromMessage(messages, MessageType.Prompt, 'model')
      const explore = getValueFromMessage(messages, MessageType.Prompt, 'explore')
      const visualization_type = getValueFromMessage(messages, MessageType.Prompt, 'visualization') as VisualizationType
      const query = getValueFromMessage(messages, MessageType.Text)

      const aiAddTileRequestBody: AiAddTileRequestBody = { model, explore, visualization_type, query }

      performAiTileGeneration(aiAddTileRequestBody)
    }
  }, [messages, generateAiTile, updateAiTileDetails])

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
