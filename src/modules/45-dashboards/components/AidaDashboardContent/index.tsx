/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { ExplorePrompts, VisualizationPrompts } from '@dashboards/constants/AidaDashboardPrompts'
import {
  DashboardPromptStage,
  Message,
  MessageRole,
  MessageType,
  PromptOption
} from '@dashboards/types/AidaTypes.types'
import AidaChatInput from '../AidaChatInput'
import AidaChatRenderer from '../AidaChatRenderer'
import AidaGenerating from '../AidaGenerating'
import AidaPromptSelection from '../AidaPromptSelection'
import css from './AidaDashboardContent.module.scss'

const AidaDashboardContent: React.FC = () => {
  const { getString } = useStrings()

  const [stage, setStage] = useState<DashboardPromptStage>(DashboardPromptStage.Explore)
  const [messages, setMessages] = useState<Message[]>([])

  const onPromptSelected = React.useCallback(
    (promptOption: PromptOption): void => {
      const baseContent = stage === DashboardPromptStage.Explore ? 'Create a custom widget for' : 'As a'
      const newMessages: Message[] = [
        ...messages,
        {
          content: `${baseContent} ${promptOption.mappedContent ? promptOption.mappedContent : promptOption.content}`,
          promptMapping: promptOption.mapping,
          type: MessageType.Prompt,
          role: MessageRole.User
        }
      ]
      setMessages(newMessages)
      setStage(stage + 1)
    },
    [messages, stage]
  )

  const onUserInputEntered = React.useCallback(
    (value: string) => {
      const newMessages: Message[] = [
        ...messages,
        {
          content: value,
          type: MessageType.Text,
          role: MessageRole.User
        }
      ]
      setMessages(newMessages)
      setStage(DashboardPromptStage.Generating)
    },
    [messages]
  )

  return (
    <Container className={css.contentContainer}>
      <Layout.Vertical spacing="large" className={css.layout}>
        <AidaChatRenderer messages={messages} />
        {stage === DashboardPromptStage.Explore && (
          <AidaPromptSelection
            onPromptSelected={onPromptSelected}
            prompts={ExplorePrompts}
            title={getString('dashboards.aida.selectExplore')}
          />
        )}
        {stage === DashboardPromptStage.Visualization && (
          <AidaPromptSelection
            onPromptSelected={onPromptSelected}
            prompts={VisualizationPrompts}
            title={getString('dashboards.aida.selectVisualisation')}
          />
        )}
        {stage === DashboardPromptStage.Generating && <AidaGenerating messages={messages} />}
        {stage === DashboardPromptStage.UserInput && <AidaChatInput onEnter={onUserInputEntered} />}
      </Layout.Vertical>
    </Container>
  )
}

export default AidaDashboardContent
