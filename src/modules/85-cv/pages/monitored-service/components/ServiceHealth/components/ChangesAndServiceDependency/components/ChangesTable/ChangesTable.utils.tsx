/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { Text, Container } from '@harness/uicore'
import type { Renderer, CellProps } from 'react-table'
import { ChangeEventDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import { getChangeCategory } from '@cv/utils/CommonUtils'
import { ChangeSourceTypes } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import { timeFormat, dateFormat } from './ChangesTable.constants'
import css from './ChangeTable.module.scss'

export const RenderTime: Renderer<CellProps<ChangeEventDTO>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  const date = moment(rowdata.eventTime).format(dateFormat)
  const time = moment(rowdata.eventTime).format(timeFormat)
  return (
    <>
      <Text font={{ size: 'small' }}>{date}</Text>
      <Text font={{ size: 'xsmall' }}>{time}</Text>
    </>
  )
}

export const RenderName: Renderer<CellProps<ChangeEventDTO>> = ({ row }): JSX.Element => {
  const { getString } = useStrings()
  const rowdata = row?.original
  let name = rowdata?.name
  let executionId = null
  if (rowdata?.type === ChangeSourceTypes.HarnessCDNextGen) {
    const { pipelineId = '', runSequence } = rowdata.metadata
    name = pipelineId
    executionId = runSequence
  }
  return (
    <Container className={css.changeSoureName}>
      <Text tooltip={name} font={{ size: 'small' }}>
        {name}
      </Text>
      {executionId && (
        <Text font={{ size: 'xsmall' }}>
          {getString('cd.serviceDashboard.executionId')} {executionId}
        </Text>
      )}
    </Container>
  )
}

export const RenderImpact: Renderer<CellProps<ChangeEventDTO>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  return (
    <>
      <Text font={{ size: 'small' }}>{rowdata.serviceName}</Text>
      <Text font={{ size: 'xsmall' }}>{rowdata.environmentName}</Text>
    </>
  )
}

export const RenderType: Renderer<CellProps<ChangeEventDTO>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  return (
    <Container className={css.changeSoureName}>
      <Text className={css.sourceName} font={{ size: 'small' }}>
        {rowdata.type}
      </Text>
    </Container>
  )
}

export const RenderChangeType: Renderer<CellProps<ChangeEventDTO>> = ({ row }): JSX.Element => {
  const { getString } = useStrings()
  const rowdata = row?.original
  return <Text font={{ size: 'small' }}>{getChangeCategory(rowdata.category, getString)}</Text>
}
