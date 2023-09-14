/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Container, Layout, Text, CardSelect, Page, PageSpinner, Tabs } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import moment from 'moment'
import { DatabaseInstallationCollection, useListInstallation } from 'services/servicediscovery'
import type { DiscoveryPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SimpleLogViewer } from '@common/components/LogViewer/SimpleLogViewer'
import { DiscoveryAgentStatus } from '@discovery/components/DelegateAgentStatus/DelegateAgentStatus'
import { useStrings } from 'framework/strings'
import css from './DiscoveryHistory.module.scss'

const DiscoveryHistory: React.FC = () => {
  const { getString } = useStrings()
  const { dAgentId, accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & DiscoveryPathProps>()

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
            <Container background={Color.BLACK} width={'100%'} height={'100%'} style={{ overflowY: 'scroll' }}>
              <Tabs
                id={'DiscoveredHistoryTab'}
                defaultSelectedTabId={'cluster'}
                tabList={[
                  {
                    id: 'cluster',
                    title: getString('common.cluster'),
                    panel: (
                      <SimpleLogViewer
                        className={css.logContainer}
                        data={JSON.stringify(selected?.agentDetails?.cluster, null, '\t')}
                      />
                    )
                  },
                  {
                    id: 'node',
                    // eslint-disable-next-line strings-restrict-modules
                    title: getString('ce.perspectives.workloadDetails.fieldNames.node'),
                    panel: (
                      <SimpleLogViewer
                        className={css.logContainer}
                        data={JSON.stringify(selected?.agentDetails?.node, null, '\t')}
                      />
                    )
                  }
                ]}
              />
            </Container>
          </Layout.Vertical>
        </Container>
      )}
    </Page.Body>
  )
}

export default DiscoveryHistory
