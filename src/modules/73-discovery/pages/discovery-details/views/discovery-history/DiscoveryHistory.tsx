/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Container, Layout, Text, CardSelect, Page, PageSpinner } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import moment from 'moment'
import { DatabaseInstallationCollection, useListInstallation } from 'services/servicediscovery'
import type { DiscoveryPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { SimpleLogViewer } from '@common/components/LogViewer/SimpleLogViewer'
import { DiscoveryAgentStatus } from '@discovery/components/DelegateAgentStatus/DelegateAgentStatus'
import { useStrings } from 'framework/strings'
import css from './DiscoveryHistory.module.scss'

const DiscoveryHistory: React.FC = () => {
  const { getString } = useStrings()
  const { dAgentId, accountId, orgIdentifier, projectIdentifier } = useParams<DiscoveryPathProps & ModulePathParams>()

  const { data: infraInstalls, loading: infraInstallLoading } = useListInstallation({
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      page: 0,
      limit: 25,
      all: false
    },
    agentIdentity: dAgentId
  })

  const [selected, setSelected] = React.useState<DatabaseInstallationCollection>()

  useEffect(() => {
    if (infraInstalls?.items && !infraInstallLoading) {
      if (infraInstalls.items?.length > 0) {
        setSelected(infraInstalls.items[0])
      }
    }
  }, [infraInstalls, infraInstallLoading])

  const convertTime = (time: string): string => {
    return moment(time).format('MMM DD, hh:mm A')
  }

  return (
    <Page.Body>
      {infraInstallLoading ? (
        <PageSpinner />
      ) : (
        <Container height={'100vh'} style={{ display: 'flex' }}>
          {}
          <Layout.Vertical width={'30%'}>
            <Layout.Horizontal style={{ padding: '10px 30px' }} flex={{ justifyContent: 'space-between' }}>
              <Text font={{ variation: FontVariation.CARD_TITLE }}>
                {getString('discovery.discoveryDetails.tabTitles.history')}
              </Text>
              <div>
                <Button icon="repeat" minimal />
                <Button icon="main-sort" minimal />
              </div>
            </Layout.Horizontal>
            <CardSelect
              data={infraInstalls?.items ?? []}
              className={css.selectableCard}
              renderItem={item => {
                return (
                  <Layout.Vertical padding={{ left: 'small' }}>
                    <Text font={{ variation: FontVariation.BODY2 }} style={{ fontWeight: 500 }}>
                      {convertTime(item?.createdAt ?? '')}
                    </Text>
                    <DiscoveryAgentStatus status={item.delegateTaskStatus} />
                  </Layout.Vertical>
                )
              }}
              onChange={value => setSelected(value)}
              selected={selected}
            />
          </Layout.Vertical>
          <Layout.Vertical width={'70%'}>
            <SimpleLogViewer className={css.logContainer} data={JSON.stringify(selected, null, '\t')} />
          </Layout.Vertical>
        </Container>
      )}
    </Page.Body>
  )
}

export default DiscoveryHistory
