/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useLayoutEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { Avatar, Button, ButtonVariation, Icon, Layout, Text } from '@harness/uicore'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { AIChatActions } from '@common/constants/TrackingConstants'
import { useHarnessSupportBot } from 'services/notifications'
import { String, useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from './DocsChat.module.scss'

interface Message {
  author: 'harness' | 'user'
  text: string
  timestamp?: number
  useful?: boolean
}

const sampleMessages: Array<Message> = [
  {
    author: 'harness',
    text: 'Hi, I can search the Harness Docs for you. How can I help you?',
    timestamp: Date.now()
  }
]

interface UsefulOrNotProps {
  query: string
  answer: string
}

function UsefulOrNot({ query, answer }: UsefulOrNotProps): JSX.Element {
  const { trackEvent } = useTelemetry()
  return (
    <Layout.Horizontal spacing={'small'} flex={{ align: 'center-center' }}>
      <Text>
        <String stringID="common.csBot.feedback" />
      </Text>
      <Button
        icon="main-thumbsup"
        variation={ButtonVariation.ICON}
        intent="success"
        onClick={() => {
          trackEvent(AIChatActions.BotHelpful, { query, answer })
        }}
      />
      <Button
        icon="main-thumbsdown"
        variation={ButtonVariation.ICON}
        intent="danger"
        onClick={() => {
          trackEvent(AIChatActions.BotNotHelpful, { query, answer })
        }}
      />
    </Layout.Horizontal>
  )
}

function DocsChat(): JSX.Element {
  const [messages, setMessages] = useState<Array<Message>>(sampleMessages)
  const [userInput, setUserInput] = useState('')
  const { currentUserInfo } = useAppStore()
  const { getString } = useStrings()
  const messageList = useRef<HTMLDivElement>(null)
  const { mutate: askQuestion, loading } = useHarnessSupportBot({})
  useTrackEvent(AIChatActions.ChatStarted, {})

  const getAnswer = async (oldMessages: Array<Message>, query: string): Promise<void> => {
    try {
      const answer = await askQuestion({ question: query, model: 'chat-bison' })
      setMessages([
        ...oldMessages,
        {
          author: 'harness',
          text: answer?.data?.response || 'Something went wrong'
        } as Message
      ])
    } catch (e) {
      setMessages([
        ...oldMessages,
        {
          author: 'harness',
          text: e?.message || 'Something went wrong'
        } as Message
      ])
    }
  }

  const handleUserInput: React.ChangeEventHandler<HTMLInputElement> = e => {
    setUserInput(e.target.value)
    e.preventDefault()
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmitClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    handleSubmit()
  }

  const handleSubmit = () => {
    const userMessage = userInput.trim()

    if (!userMessage) return

    const newMessageList: Message[] = [
      ...messages,
      {
        author: 'user',
        text: userMessage,
        timestamp: Date.now()
      }
    ]

    setMessages(newMessageList)
    getAnswer(newMessageList, userMessage)
    setUserInput('')
  }

  useLayoutEffect(() => {
    messageList.current?.scrollTo(0, messageList.current?.scrollHeight)
  }, [messages])

  const loadingMessage = (
    <div className={cx(css.messageContainer, css.left)}>
      <div className={cx(css.message, css.harness, css.loader)}>
        <div className={css.dotflashing}></div>
      </div>
    </div>
  )

  return (
    <div className={css.container}>
      <div className={css.header}>{getString('common.csBot.title')}</div>
      <div className={css.messagesContainer} ref={messageList}>
        {messages.map((message, index) => {
          return (
            <div key={message.text + index}>
              <div
                className={cx(css.messageContainer, {
                  [css.left]: message.author === 'harness',
                  [css.right]: message.author === 'user'
                })}
              >
                {message.author === 'harness' ? (
                  <Icon name="harness-copilot" size={30} className={css.aidaIcon} />
                ) : null}
                <div
                  className={cx(css.message, {
                    [css.harness]: message.author === 'harness',
                    [css.user]: message.author === 'user'
                  })}
                >
                  {message.text.replace(/\\n/g, '\n')}
                </div>
                {message.author === 'user' ? (
                  <Avatar size={'small'} name={currentUserInfo.name} email={currentUserInfo.email} />
                ) : null}
              </div>
              {message.author === 'harness' && index > 1 ? (
                <UsefulOrNot answer={message.text} query={messages[index - 1].text} />
              ) : null}
            </div>
          )
        })}
        {loading ? loadingMessage : null}
      </div>
      <div className={css.inputContainer}>
        <Layout.Horizontal spacing="small">
          <input
            type="text"
            name="user-input"
            className={css.input}
            value={userInput}
            onChange={handleUserInput}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <button onClick={handleSubmitClick} className={css.submitButton}>
            <Icon name="key-enter" />
          </button>
        </Layout.Horizontal>
      </div>
    </div>
  )
}

export default DocsChat
