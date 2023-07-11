/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { NodeProps } from 'reactflow'
import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { ServiceNodeData } from '@discovery/components/NetworkGraph/types'

import css from './NamespaceGroupNode.module.scss'

export default function NamespaceGroupNode(props: NodeProps<ServiceNodeData>): React.ReactElement {
  return (
    <Container
      className={css.namespaceLabel}
      padding={{ top: 'xsmall', bottom: 'xsmall', left: 'small', right: 'small' }}
    >
      <Text font={{ size: 'small' }} color={Color.WHITE} icon="app-kubernetes" lineClamp={1}>
        {props.data.name}
      </Text>
    </Container>
  )
}
