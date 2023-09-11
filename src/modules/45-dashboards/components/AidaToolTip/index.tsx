/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Layout, Text } from '@harness/uicore'
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
        <Icon
          name="cross"
          size={20}
          onClick={hideToolTip}
          data-testid="dismiss-tooltip-button"
          className={css.closeBtn}
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
