/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import { ReactFlowProvider } from 'reactflow'
import { Color, FontVariation } from '@harness/design-system'
import { StudioTabs } from '@discovery/interface/networkMapStudio'
import { ApiCreateNetworkMapRequest, DatabaseNetworkMapEntity } from 'services/servicediscovery'
import { useStrings } from 'framework/strings'
import {
  getGraphEdgesFromNetworkMap,
  getGraphNodesFromNetworkMap
} from '@discovery/components/NetworkGraph/utils/graphDataTransformation'
import NetworkGraph from '@discovery/components/NetworkGraph/NetworkGraph'
import noServiceIllustration from '../../images/noServiceIllustration.png'
import NoSelectionSideBar from './NoSelectionSideBar'
import NodeConnectionsSideBar from './NodeConnectionsSideBar'
import { ServiceRelationFormType } from './RelationPopover'
import css from './ConfigureNetworkMap.module.scss'

export interface ConfigureNetworkMapProps {
  networkMap: ApiCreateNetworkMapRequest
  updateNetworkMap: (networkMap: ApiCreateNetworkMapRequest) => Promise<void>
  handleTabChange: (tabID: StudioTabs) => void
}

export default function ConfigureNetworkMap({
  networkMap,
  updateNetworkMap,
  handleTabChange
}: ConfigureNetworkMapProps): React.ReactElement {
  const { getString } = useStrings()
  const [relation, setRelation] = React.useState<ServiceRelationFormType>()
  const [sourceService, setSourceService] = React.useState<DatabaseNetworkMapEntity>()

  const nodes = React.useMemo(() => getGraphNodesFromNetworkMap(networkMap), [networkMap])
  const edges = React.useMemo(() => getGraphEdgesFromNetworkMap(networkMap), [networkMap])

  function onNodeConnection(sourceId: string, destinationId: string): void {
    const source = networkMap.resources.find(service => service.id === sourceId)
    setSourceService(source)

    setRelation({ source: sourceId, target: destinationId, properties: { type: 'TCP', port: '' } })
  }

  return (
    <Layout.Horizontal width="100%" height="100%">
      <Container width="75%" height="100%">
        <>
          {nodes.length === 0 ? (
            <Layout.Vertical height="100%" flex={{ align: 'center-center' }} background={Color.WHITE} spacing="medium">
              <img src={noServiceIllustration} width={250} height={111} />
              <Text font={{ variation: FontVariation.H5 }}>{getString('discovery.noServiceSelected')}</Text>
              <Text width="40%">{getString('discovery.noServiceSelectedDescription')}</Text>
            </Layout.Vertical>
          ) : (
            <ReactFlowProvider>
              <NetworkGraph
                nodes={nodes}
                edges={edges}
                isNodeConnectable
                onNodeConnection={onNodeConnection}
                onNodeClick={node => setSourceService(node.data)}
              />
            </ReactFlowProvider>
          )}
          <Button
            className={css.backButton}
            variation={ButtonVariation.TERTIARY}
            text={getString('back')}
            onClick={() => handleTabChange(StudioTabs.SELECT_SERVICES)}
          />
        </>
      </Container>
      <Container width="35%" height="100%">
        {sourceService && (
          <NodeConnectionsSideBar
            sourceService={sourceService}
            networkMap={networkMap}
            updateNetworkMap={updateNetworkMap}
            newRelation={relation}
            closeSideBar={() => setSourceService(undefined)}
          />
        )}
        {!sourceService && <NoSelectionSideBar networkMap={networkMap} updateNetworkMap={updateNetworkMap} />}
      </Container>
    </Layout.Horizontal>
  )
}
