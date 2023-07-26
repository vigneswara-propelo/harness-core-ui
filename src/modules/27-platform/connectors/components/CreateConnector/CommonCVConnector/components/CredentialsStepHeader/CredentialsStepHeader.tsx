/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './CredentialsStepHeader.module.scss'

export interface StepDetailsHeader {
  connectorTypeLabel: string
  subheading?: string
}

export function StepDetailsHeader(props: StepDetailsHeader): JSX.Element {
  const { connectorTypeLabel, subheading } = props
  const { getString } = useStrings()
  const stringsTitleObject = { type: connectorTypeLabel }
  return (
    <Container className={css.titleContent}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'small' }}>
        {getString('platform.connectors.connectorDetailsHeader', stringsTitleObject)}
      </Text>
      <Text className={css.heading}>{getString('platform.connectors.addConnectorDetails', stringsTitleObject)}</Text>
      {subheading && <Text className={css.subHeading}>{subheading}</Text>}
    </Container>
  )
}
