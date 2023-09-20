/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Container, Icon, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './AidaToolTip.module.scss'

interface AidaToolTipProps {
  hideToolTip?: () => void
}

const AidaToolTip: React.FC<AidaToolTipProps> = ({ hideToolTip }) => {
  const { getString } = useStrings()

  return (
    <Container className={css.tooltipPadding}>
      <Container flex={{ justifyContent: 'flex-end' }}>
        <Button
          minimal
          className={css.closeBtn}
          variation={ButtonVariation.ICON}
          icon="cross"
          data-testid="dismiss-tooltip-button"
          size={ButtonSize.SMALL}
          onClick={hideToolTip}
        />
      </Container>
      <Layout.Vertical spacing="small" className={css.tooltipContent}>
        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start' }}>
          <Icon name="harness-copilot" size={25} />
          <Text className={css.label} font={{ variation: FontVariation.H5 }}>
            {getString('common.csBot.introduction')}
          </Text>
        </Layout.Horizontal>
        <Text className={css.label} font={{ variation: FontVariation.SMALL }}>
          {getString('dashboards.aida.helpText')}
        </Text>
      </Layout.Vertical>
    </Container>
  )
}

export default AidaToolTip
