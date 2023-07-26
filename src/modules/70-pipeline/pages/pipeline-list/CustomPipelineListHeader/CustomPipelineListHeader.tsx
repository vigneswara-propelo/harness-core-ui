/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, HarnessDocTooltip, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Link, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './CustomPipelineListHeader.module.scss'

function CustomPipelineListHeader(): React.ReactElement {
  const { getString } = useStrings()
  const { selectedProject } = useAppStore()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  return (
    <div className="ng-tooltip-native">
      <h2 data-tooltip-id="idpPipelinesPageHeading">{getString('pipelines')}</h2>
      <HarnessDocTooltip tooltipId="idpPipelinesPageHeading" useStandAlone={true} />
      <Layout.Horizontal className={css.idpPipelinesHeader}>
        {getString('projectLabel')}:
        <Link to={routes.toProjectDetails({ projectIdentifier, orgIdentifier, accountId })}>
          <Text margin={{ left: 'small' }} font={{ weight: 'semi-bold' }} color={Color.PRIMARY_7}>
            {/* istanbul ignore next */ selectedProject?.name}
          </Text>
        </Link>
      </Layout.Horizontal>
    </div>
  )
}

export default CustomPipelineListHeader
