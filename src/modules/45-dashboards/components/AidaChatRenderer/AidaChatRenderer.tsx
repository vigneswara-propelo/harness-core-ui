import React, { FC, useEffect, useRef } from 'react'
import { Container, FlexExpander, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { Message } from '@dashboards/types/AidaTypes.types'

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
        return (
          <Container key={`aida-message-${i}`} className={css.userMsgWrapper}>
            <Text
              data-testid={`aida-message-${i}`}
              font={{ variation: FontVariation.SMALL_SEMI }}
              className={css.userMsg}
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
