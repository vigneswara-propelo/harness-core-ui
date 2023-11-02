/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { ReactNode } from 'react'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'

interface TextWithIndexProps {
  index: string
  children: ReactNode
  className?: string
}
export default function TextWithIndex({ index, children, className }: TextWithIndexProps): JSX.Element {
  return (
    <Layout.Horizontal className={className}>
      <Text color={Color.BLACK}>{index}&nbsp;</Text>
      {children}
    </Layout.Horizontal>
  )
}
