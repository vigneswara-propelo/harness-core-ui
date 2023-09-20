/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Drawer, PopoverInteractionKind, PopoverPosition, Position } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { Container, Icon, Layout, Popover, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from './AidaDrawer.module.scss'

export interface AidaDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const AidaDrawer: React.FC<AidaDrawerProps> = ({ children, isOpen, onClose }) => {
  const { getString } = useStrings()

  return (
    <Drawer position={Position.RIGHT} isOpen={isOpen} onClose={onClose} className={css.drawer} isCloseButtonShown>
      <Layout.Vertical className={css.panel}>
        <Layout.Vertical padding={{ bottom: 'xlarge' }} spacing="medium">
          <Container>
            <Container flex={{ justifyContent: 'flex-end' }}>
              <Icon
                name="cross"
                size={25}
                onClick={onClose}
                data-testid="close-drawer-button"
                className={css.closeBtn}
              />
            </Container>
            <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start' }}>
              <Container padding="medium" flex={{ justifyContent: 'flex-start' }}>
                <Text icon="harness-copilot" iconProps={{ size: 35 }} font={{ variation: FontVariation.H2 }}>
                  {getString('common.csBot.name')}
                </Text>
              </Container>
              <Popover
                content={
                  <Container padding="large">
                    <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_100}>
                      {getString('common.csBot.aidaFullText')}
                    </Text>
                  </Container>
                }
                usePortal
                position={PopoverPosition.RIGHT}
                interactionKind={PopoverInteractionKind.HOVER}
                popoverClassName={css.popover}
              >
                <Icon name="info" size={15} />
              </Popover>
            </Layout.Horizontal>
          </Container>
          <Text>{getString('dashboards.aida.assist')}</Text>
          <div className={css.separator} />
        </Layout.Vertical>
        <div className={css.content}>{children}</div>
      </Layout.Vertical>
    </Drawer>
  )
}

export default AidaDrawer
