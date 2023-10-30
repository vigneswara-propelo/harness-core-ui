/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Container, Text, useToggleOpen } from '@harness/uicore'
import { Drawer, Position as DrawerPosition } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import ServiceDetails from '@discovery/components/ServiceDetails/ServiceDetails'
import type { ServiceNodeData } from '@discovery/components/NetworkGraph/types'
import { DiscoveryPathProps } from '@common/interfaces/RouteInterfaces'
import css from './HexagonNode.module.scss'

export default function HexagonNode(props: NodeProps<ServiceNodeData>): React.ReactElement {
  const { dAgentId } = useParams<DiscoveryPathProps>()
  const { isOpen, open, close } = useToggleOpen()

  return (
    <>
      <Drawer position={DrawerPosition.RIGHT} isOpen={isOpen} isCloseButtonShown={true} size={'86%'}>
        <ServiceDetails serviceName={props.data.name} serviceId={props.id} infraId={dAgentId} closeModal={close} />
      </Drawer>
      <div
        className={css.nodeContainer}
        onClick={() => {
          open()
        }}
      >
        <div className={css.hexagon}>
          <Container height="inherit" flex={{ align: 'center-center' }}>
            <Text font={{ size: 'xsmall' }} lineClamp={3}>
              {props.data.name}
            </Text>
          </Container>
        </div>

        <Handle
          isConnectable={props.isConnectable}
          className={css.targetHandle}
          type="target"
          position={Position.Top}
        />
        <Handle
          isConnectable={props.isConnectable}
          className={css.sourceHandle}
          type="source"
          position={Position.Bottom}
        />
      </div>
    </>
  )
}
