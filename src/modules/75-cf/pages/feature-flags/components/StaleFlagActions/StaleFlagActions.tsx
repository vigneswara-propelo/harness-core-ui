/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useState } from 'react'
import { Button, ButtonVariation, Heading, Layout, ModalDialog, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Drawer, Intent, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useGetSelectedStaleFlags } from '../../hooks/useGetSelectedStaleFlags'
import css from './StaleFlagActions.module.scss'

export const StaleFlagActions: FC = () => {
  const { getString } = useStrings()
  const selectedFlags = useGetSelectedStaleFlags()
  const [showInfo, setShowInfo] = useState<boolean>(false)
  const [showNotStaleDialog, setShowNotStaleDialog] = useState<boolean>(false)

  const hideShowInfo = useCallback(() => {
    setShowInfo(false)
  }, [])

  return (
    <>
      {!!selectedFlags.length && (
        <>
          <Layout.Horizontal padding="xlarge" border={{ top: true }} background={Color.WHITE} spacing="medium">
            <Text font={{ variation: FontVariation.CARD_TITLE }}>
              {getString('cf.staleFlagAction.flagsSelected', { count: selectedFlags.length })}
            </Text>
            <Button
              text={getString('cf.staleFlagAction.notStale')}
              variation={ButtonVariation.SECONDARY}
              onClick={() => {
                setShowNotStaleDialog(true)
              }}
            />
            <ModalDialog
              isOpen={showNotStaleDialog}
              enforceFocus={false}
              isCloseButtonShown
              onClose={() => {
                setShowNotStaleDialog(false)
              }}
              title={getString('cf.staleFlagAction.notStale')}
            >
              <Layout.Vertical>
                <Text padding={{ bottom: 'medium' }}>{getString('cf.staleFlagAction.notStaleDesc')}</Text>
                <Layout.Horizontal spacing="small" padding={{ top: 'large' }}>
                  <Button
                    text={getString('cf.staleFlagAction.notStale')}
                    variation={ButtonVariation.PRIMARY}
                    intent={Intent.PRIMARY}
                  />
                  <Button
                    text={getString('cancel')}
                    variation={ButtonVariation.TERTIARY}
                    onClick={() => {
                      setShowNotStaleDialog(false)
                    }}
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </ModalDialog>
            <Button text={getString('cf.staleFlagAction.readyForCleanup')} variation={ButtonVariation.SECONDARY} />
            <Button
              padding={{ left: 0 }}
              text={getString('cf.staleFlagAction.learnMore')}
              variation={ButtonVariation.LINK}
              onClick={() => {
                setShowInfo(true)
              }}
            />
          </Layout.Horizontal>
          {showInfo && (
            <Drawer
              onClose={hideShowInfo}
              usePortal
              autoFocus
              canEscapeKeyClose
              canOutsideClickClose
              enforceFocus={false}
              hasBackdrop
              isOpen
              position={Position.RIGHT}
              size={Drawer.SIZE_STANDARD}
            >
              <Button
                className={css.closeButton}
                icon="main-close"
                iconProps={{ size: 12 }}
                onClick={hideShowInfo}
                aria-label={getString('close')}
              />
              <Layout.Vertical className={css.infoDrawer} height={'100%'} padding="xxlarge">
                <Heading level={4} className={css.infoTitle} font={{ variation: FontVariation.H4 }}>
                  {getString('cf.staleFlagAction.flagLifecycleExplained')}
                </Heading>
                <Text
                  className={css.infoText}
                  font={{ variation: FontVariation.BODY }}
                  color={Color.GREY_500}
                  padding="medium"
                >
                  {getString('cf.staleFlagAction.flagLifecycleDesc')}
                </Text>
                <Layout.Horizontal padding="medium">
                  <Button className={css.gotItButton} variation={ButtonVariation.PRIMARY} onClick={hideShowInfo}>
                    {getString('common.gotIt')}
                  </Button>
                </Layout.Horizontal>
              </Layout.Vertical>
            </Drawer>
          )}
        </>
      )}
    </>
  )
}
