/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Button, ButtonVariation, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useGetSelectedStaleFlags } from '../../hooks/useGetSelectedStaleFlags'

export const StaleFlagActions: FC = () => {
  const { getString } = useStrings()
  const selectedFlags = useGetSelectedStaleFlags()

  return (
    <>
      {!!selectedFlags.length && (
        <Layout.Horizontal padding="xlarge" border={{ top: true }} background={Color.WHITE} spacing="medium">
          <Text font={{ variation: FontVariation.CARD_TITLE }}>
            {getString('cf.staleFlagAction.flagsSelected', { count: selectedFlags.length })}
          </Text>
          <Button text={getString('cf.staleFlagAction.notStale')} variation={ButtonVariation.SECONDARY} />
          <Button text={getString('cf.staleFlagAction.readyForCleanup')} variation={ButtonVariation.SECONDARY} />
          {/* TODO: Add info popup for button below */}
          <Button
            padding={{ left: 0 }}
            text={getString('cf.staleFlagAction.learnMore')}
            variation={ButtonVariation.LINK}
          />
        </Layout.Horizontal>
      )}
    </>
  )
}
