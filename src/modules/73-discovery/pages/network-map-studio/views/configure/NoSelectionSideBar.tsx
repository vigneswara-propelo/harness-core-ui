/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Layout, Text, useToggleOpen } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import React from 'react'
import { useStrings } from 'framework/strings'
import { ApiCreateNetworkMapRequest } from 'services/servicediscovery'
import RelationPopover from './RelationPopover'
import css from './ConfigureNetworkMap.module.scss'

interface NoSelectionSideBarProps {
  networkMap: ApiCreateNetworkMapRequest
  updateNetworkMap: (networkMap: ApiCreateNetworkMapRequest) => Promise<void>
}

export default function NoSelectionSideBar({
  networkMap,
  updateNetworkMap
}: NoSelectionSideBarProps): React.ReactElement {
  const { getString } = useStrings()
  const { isOpen, open, close } = useToggleOpen()

  return (
    <Layout.Vertical spacing="small" padding="large" className={css.sidebar}>
      <Text font={{ variation: FontVariation.CARD_TITLE }}>{getString('discovery.addCustomizedConfigurations')}</Text>
      <Text>{getString('discovery.addCustomizedConfigurationsDesc')}</Text>
      <Layout.Vertical spacing="medium" flex={{ alignItems: 'flex-start' }} padding={{ top: 'medium' }}>
        {/* TODO: Enable external entity after API support */}
        {/* <Button variation={ButtonVariation.LINK} icon="plus" text={getString('discovery.externalEntity')} />
        <Divider style={{ width: '100%' }} /> */}
        <RelationPopover
          networkMap={networkMap}
          updateNetworkMap={updateNetworkMap}
          isOpen={isOpen}
          open={open}
          close={close}
        >
          <Button variation={ButtonVariation.LINK} icon="plus" text={getString('discovery.newRelation')} />
        </RelationPopover>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
