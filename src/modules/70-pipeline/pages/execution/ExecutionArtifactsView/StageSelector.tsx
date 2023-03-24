/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Select } from '@harness/uicore'
import qs from 'qs'
import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import css from './ExecutionArtifactsView.module.scss'

export function StageSelector(props: {
  layoutNodeMap?: PipelineExecutionSummary['layoutNodeMap']
}): React.ReactElement {
  const history = useHistory()
  const params = useParams<any>()
  const query = useQueryParams<any>()
  const setupIds = Object.keys(props?.layoutNodeMap ?? {})
  const options = setupIds.map(value => ({
    value,
    label: props.layoutNodeMap![value].name!
  }))
  const selectedOption = options.find(option => option.value === query.stage)

  // Need to have a selected change by default when we are opening a page
  if (!selectedOption && options.length > 0) {
    history.push(routes.toExecutionArtifactsView(params) + '?' + qs.stringify({ ...query, stage: options[0].value }))
  }

  return (
    <Select
      className={css.stageSelector}
      value={selectedOption}
      items={options}
      onChange={val => {
        history.push(routes.toExecutionArtifactsView(params) + '?' + qs.stringify({ ...query, stage: val.value }))
      }}
    />
  )
}
