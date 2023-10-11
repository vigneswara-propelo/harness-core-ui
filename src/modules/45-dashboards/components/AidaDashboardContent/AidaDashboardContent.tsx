/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { v4 as uuid } from 'uuid'
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
import AidaChatInput from '../AidaChatInput/AidaChatInput'
import AidaChatRenderer from '../AidaChatRenderer/AidaChatRenderer'
import AidaGenerating from '../AidaGenerating/AidaGenerating'
import AidaPromptSelection from '../AidaPromptSelection/AidaPromptSelection'
import css from './AidaDashboardContent.module.scss'

type Action = { type: 'submit'; newMessage: Message } | { type: 'response'; aidaResponse: Message } | { type: 'reset' }
type State = {
  historicMessages: Message[]
  messages: Message[]
  stage: DashboardPromptStage
}

const initialState: State = {
  historicMessages: [],
  messages: [],
  stage: DashboardPromptStage.Explore
}

const messageReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'submit':
      return { ...state, messages: [...state.messages, action.newMessage], stage: state.stage + 1 }
    case 'response':
      return {
        historicMessages: [...state.historicMessages, ...state.messages, action.aidaResponse],
        messages: [],
        stage: DashboardPromptStage.Explore
      }
    case 'reset':
      return initialState
    default: {
      throw new Error(`Unhandled Message Action: ${action}`)
    }
  }
}
const AidaDashboardContent: React.FC = () => {
  const { getString } = useStrings()

  const [state, dispatch] = React.useReducer(messageReducer, initialState)

  const onPromptSelected = React.useCallback(
    (promptOption: PromptOption): void => {
      const baseContent =
        state.stage === DashboardPromptStage.Explore
          ? getString('dashboards.aida.createCustomWidgetFor')
          : getString('dashboards.aida.asA')
      const newMessage: Message = {
        id: uuid() as string,
        content: `${baseContent} ${promptOption.mappedContent ? promptOption.mappedContent : promptOption.content}`,
        promptMapping: promptOption.mapping,
        type: MessageType.Prompt,
        role: MessageRole.User
      }
      dispatch({ type: 'submit', newMessage })
    },
    [getString, state.stage]
  )

  const onUserInputEntered = React.useCallback((value: string) => {
    const newMessage: Message = {
      id: uuid() as string,
      content: value,
      type: MessageType.Text,
      role: MessageRole.User
    }
    dispatch({ type: 'submit', newMessage })
  }, [])

  const handleAidaError = React.useCallback((): void => {
    const aidaResponse: Message = {
      id: uuid() as string,
      content: getString('dashboards.aida.trouble'),
      type: MessageType.Text,
      role: MessageRole.Assistant
    }
    dispatch({ type: 'response', aidaResponse })
  }, [getString])

  const divRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    divRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  return (
    <Container className={css.contentContainer}>
      <Layout.Vertical spacing="large" className={css.layout}>
        <AidaChatRenderer messages={[...state.historicMessages, ...state.messages]} />
        {state.stage === DashboardPromptStage.Explore && (
          <AidaPromptSelection
            onPromptSelected={onPromptSelected}
            prompts={ExplorePrompts}
            title={getString('dashboards.aida.selectExplore')}
          />
        )}
        {state.stage === DashboardPromptStage.Visualization && (
          <AidaPromptSelection
            onPromptSelected={onPromptSelected}
            prompts={VisualizationPrompts}
            title={getString('dashboards.aida.selectVisualisation')}
          />
        )}
        {state.stage === DashboardPromptStage.Generating && (
          <AidaGenerating messages={state.messages} onError={handleAidaError} />
        )}
        {state.stage === DashboardPromptStage.UserInput && <AidaChatInput onEnter={onUserInputEntered} />}
        <div ref={divRef} />
      </Layout.Vertical>
    </Container>
  )
}

export default AidaDashboardContent
