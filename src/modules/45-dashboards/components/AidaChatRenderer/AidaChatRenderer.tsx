import React, { FC, useEffect, useRef } from 'react'
import cx from 'classnames'
import { Container, FlexExpander, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { Message, MessageRole } from '@dashboards/types/AidaTypes.types'

import css from './AidaChatRenderer.module.scss'

interface AidaChatRendererProps {
  messages: Message[]
}

const AidaChatRenderer: FC<AidaChatRendererProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest'
      })
    }
  }, [messages.length])

  return (
    <Layout.Vertical spacing="large" className={css.chatRenderer}>
      {messages.map((message, i) => {
        const isUser = message.role === MessageRole.User
        return (
          <Container
            key={`aida-message-${message.id}`}
            className={cx(css.msgWrapper, isUser ? css.userMsgWrapper : css.responseMsgWrapper)}
          >
            <Text
              data-testid={`aida-message-${i}`}
              font={{ variation: FontVariation.SMALL_SEMI }}
              className={isUser ? css.userMsg : css.responseMsg}
            >
              {message.content}
            </Text>
          </Container>
        )
      })}
      <div ref={scrollRef} className={css.scrollViewCtn} />
      <FlexExpander />
    </Layout.Vertical>
  )
}

export default AidaChatRenderer
