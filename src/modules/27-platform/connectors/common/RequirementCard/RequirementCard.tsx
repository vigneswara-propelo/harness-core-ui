/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Icon, IconName, Layout, Text } from '@harness/uicore'
import { Features } from '../../components/CreateConnector/CENGAwsConnector/steps/CrossAccountRoleStep1'
import css from './RequirementCard.module.scss'

export interface CardData {
  icon: IconName
  text: string
  value: Features
  heading: string
  desc: React.ReactNode
  prefix: string
  features: string[]
  footer: React.ReactNode
}

interface UseSelectCardsProps {
  featureCards: CardData[]
  featuresEnabled: Features[]
}

export const useSelectCards = ({ featureCards, featuresEnabled }: UseSelectCardsProps) => {
  const [selectedCards, setSelectedCards] = useState<CardData[]>(() => {
    const initialSelectedCards = featureCards.filter(c => c.value === Features.BILLING)
    for (const fe of featuresEnabled) {
      const card = featureCards.find(c => c.value === fe && !(c.value === Features.BILLING))
      if (card) {
        initialSelectedCards.push(card)
      }
    }
    return initialSelectedCards
  })

  return { selectedCards, setSelectedCards }
}

export const RequirementCard = (props: CardData) => {
  const { prefix, icon, heading, features, footer } = props
  return (
    <Container className={css.featureCard}>
      <Layout.Vertical spacing="medium" padding={{ left: 'large', right: 'large' }}>
        <Layout.Horizontal spacing="small">
          <Icon name={icon} size={32} />
          <Container>
            <Text color="grey900" style={{ fontSize: 9, fontWeight: 500 }}>
              {prefix.toUpperCase()}
            </Text>
            <Text color="grey900" style={{ fontSize: 16, fontWeight: 500 }}>
              {heading}
            </Text>
          </Container>
        </Layout.Horizontal>
        <ul className={css.features}>
          {features.map((feat, idx) => {
            return (
              <li key={idx}>
                <Text
                  icon="main-tick"
                  iconProps={{ color: 'green600', size: 12, padding: { right: 'small' } }}
                  font="small"
                  style={{ lineHeight: '20px' }}
                >
                  {feat}
                </Text>
              </li>
            )
          })}
        </ul>
      </Layout.Vertical>
      <Container className={css.footer}>
        <Text font={{ size: 'small', italic: true }} color="grey400">
          {footer}
        </Text>
      </Container>
    </Container>
  )
}
