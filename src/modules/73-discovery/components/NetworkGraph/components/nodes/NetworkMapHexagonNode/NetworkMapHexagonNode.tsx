/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Container, Text } from '@harness/uicore'
import type { NetworkMapNodeData } from '@discovery/components/NetworkGraph/types'
import css from './NetworkMapHexagonNode.module.scss'

export default function NetworkMapHexagonNode(props: NodeProps<NetworkMapNodeData>): React.ReactElement {
  return (
    <div className={css.nodeContainer}>
      <div className={css.hexagon}>
        <Container height="inherit" flex={{ align: 'center-center' }}>
          <Text font={{ size: 'xsmall' }} lineClamp={3}>
            {props.data.name}
          </Text>
        </Container>
      </div>

      <Handle isConnectable={props.isConnectable} className={css.targetHandle} type="target" position={Position.Top} />
      <Handle
        isConnectable={props.isConnectable}
        className={css.sourceHandle}
        type="source"
        position={Position.Bottom}
      />
    </div>
  )
}
