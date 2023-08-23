/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Classes } from '@blueprintjs/core'
import { Layout, Text, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { ReportStatusCard } from '../../../ReportsTable.utils'

export const ReportHeader = ({
  name,
  status,
  service,
  isLoading,
  environment
}: {
  name: string
  status: string
  service: string
  environment: string
  isLoading?: boolean
}): JSX.Element => {
  const loadingClassName = isLoading ? Classes.SKELETON : ''
  return (
    <Layout.Vertical spacing="small">
      <Text
        font={{ size: 'medium', weight: 'semi-bold' }}
        width="max-content"
        margin={{ right: 'medium' }}
        color={Color.BLACK_100}
        className={loadingClassName}
      >
        {name}
      </Text>
      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center', justifyContent: 'start' }}>
        <Icon name="cv-main" size={16} />
        <Text inline icon="main-setup" iconProps={{ size: 12 }} font={{ size: 'small' }} className={loadingClassName}>
          {service}
        </Text>
        <Text inline icon="environments" iconProps={{ size: 12 }} font={{ size: 'small' }} className={loadingClassName}>
          {environment}
        </Text>
        <ReportStatusCard status={status} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
