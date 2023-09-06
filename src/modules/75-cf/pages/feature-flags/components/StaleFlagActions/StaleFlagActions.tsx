/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useMemo, useState } from 'react'
import { Button, ButtonVariation, Heading, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Drawer, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { Feature } from 'services/cf'
import { useGetSelectedStaleFlags } from '../../hooks/useGetSelectedStaleFlags'
import { StaleFlagStatusReason } from '../../FlagStatus'
import { StaleFlagActionDialog } from './StaleFlagActionDialog'
import css from './StaleFlagActions.module.scss'

export interface StaleFlagActionsProps {
  flags?: Feature[] | null
  onAction: () => void
}

export const StaleFlagActions: FC<StaleFlagActionsProps> = ({ flags, onAction }) => {
  const { getString } = useStrings()
  const selectedFlags = useGetSelectedStaleFlags()
  const [showInfo, setShowInfo] = useState<boolean>(false)
  const [showNotStaleDialog, setShowNotStaleDialog] = useState<boolean>(false)
  const [showReadyForCleanupDialog, setShowReadyForCleanupDialog] = useState<boolean>(false)

  const onReadyForCleanupAction = useCallback((): void => {
    setShowReadyForCleanupDialog(false)
    onAction()
  }, [onAction])

  const onNotStaleAction = useCallback((): void => {
    setShowNotStaleDialog(false)
    onAction()
  }, [onAction])

  const showReadyForCleanupBtn = useMemo<boolean | undefined>(
    () =>
      flags?.some(
        ({ identifier, staleReason }) =>
          selectedFlags.includes(identifier) && staleReason !== StaleFlagStatusReason.WAITING_FOR_CLEANUP
      ),
    [flags, selectedFlags]
  )

  const hideShowInfo = useCallback(() => {
    setShowInfo(false)
  }, [])

  return (
    <>
      {!!selectedFlags.length && (
        <>
          <Layout.Horizontal padding="xlarge" border={{ top: true }} background={Color.WHITE} spacing="medium">
            <Text font={{ variation: FontVariation.CARD_TITLE }} className={css.flagsSelected}>
              {getString('cf.staleFlagAction.flagsSelected', { count: selectedFlags.length })}
            </Text>
            <Button
              text={getString('cf.staleFlagAction.notStale')}
              variation={ButtonVariation.SECONDARY}
              onClick={() => {
                setShowNotStaleDialog(true)
              }}
            />
            {showNotStaleDialog && (
              <StaleFlagActionDialog
                markAsNotStale
                selectedFlags={selectedFlags}
                onAction={() => onNotStaleAction()}
                onClose={() => setShowNotStaleDialog(false)}
              />
            )}

            {showReadyForCleanupBtn && (
              <>
                <Button
                  text={getString('cf.staleFlagAction.readyForCleanup')}
                  variation={ButtonVariation.SECONDARY}
                  onClick={() => {
                    setShowReadyForCleanupDialog(true)
                  }}
                />
                {showReadyForCleanupDialog && (
                  <StaleFlagActionDialog
                    selectedFlags={selectedFlags}
                    onAction={() => onReadyForCleanupAction()}
                    onClose={() => setShowReadyForCleanupDialog(false)}
                  />
                )}
              </>
            )}
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
