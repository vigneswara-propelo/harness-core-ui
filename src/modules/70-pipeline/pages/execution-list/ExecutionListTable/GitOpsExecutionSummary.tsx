/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { Classes, PopoverInteractionKind } from '@blueprintjs/core'
import { Icon, Layout, Popover } from '@harness/uicore'
import type { Application } from 'services/cd-ng'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { linkNode } from './gitopsRenderer'
import css from './ExecutionListTable.module.scss'

function GitOpsExecutionSummary({ stageInfo }: { stageInfo: Record<string, any> }) {
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  const gitOpsApplications = stageInfo.gitOpsAppSummary?.applications || []

  return gitOpsApplications.length ? (
    <Layout.Horizontal>
      <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }} margin={{ left: 'small' }}>
        <Icon name="gitops-application" size={14} />
        {linkNode(gitOpsApplications[0], {
          index: 0,
          color: Color.PRIMARY_6,
          orgIdentifier,
          projectIdentifier,
          accountId,
          module
        })}
        {gitOpsApplications.length > 1 ? (
          <>
            <Popover
              interactionKind={PopoverInteractionKind.HOVER}
              className={Classes.DARK}
              content={
                <Layout.Vertical spacing="small" padding="medium" style={{ maxWidth: 500 }}>
                  {gitOpsApplications.slice(1).map((app: Application, index: number) =>
                    linkNode(app, {
                      index,
                      color: Color.WHITE,
                      lineClamp: 3,
                      orgIdentifier,
                      projectIdentifier,
                      accountId,
                      module
                    })
                  )}
                </Layout.Vertical>
              }
            >
              <span className={css.primary6}>+{Math.abs(gitOpsApplications.length - 1)}</span>
            </Popover>
          </>
        ) : null}
      </Layout.Horizontal>
    </Layout.Horizontal>
  ) : null
}

export default GitOpsExecutionSummary
