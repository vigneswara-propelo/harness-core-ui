/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import type {
  PipelinePathProps,
  ProjectPathProps,
  PathFn,
  PipelineType,
  PipelineStudioQueryParams
} from '@common/interfaces/RouteInterfaces'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'
import { PipelineCanvas } from '../PipelineCanvas/PipelineCanvas'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { PipelineSchemaContextProvider } from '../PipelineSchema/PipelineSchemaContext'
import css from './PipelineStudioInternal.module.scss'

export interface PipelineStudioProps {
  className?: string
  title?: string
  onClose?: () => void
  routePipelineStudio: PathFn<PipelineType<PipelinePathProps> & PipelineStudioQueryParams>
  routePipelineDetail: PathFn<PipelineType<PipelinePathProps>>
  routePipelineList: PathFn<PipelineType<ProjectPathProps>>
  routePipelineProject: PathFn<PipelineType<ProjectPathProps>>
  // diagram?: DiagramFactory
  getOtherModal?: (
    onSubmit: (values: PipelineInfoConfig) => void,
    onClose: () => void
  ) => React.ReactElement<OtherModalProps>
}

interface OtherModalProps {
  onSubmit?: (values: PipelineInfoConfig) => void
  initialValues?: PipelineInfoConfig
  onClose?: () => void
}

export class PipelineStudioInternal extends React.Component<PipelineStudioProps> {
  context!: React.ContextType<typeof PipelineContext>
  static contextType = PipelineContext

  render(): JSX.Element {
    const {
      deletePipelineCache,
      state: { gitDetails }
    } = this.context
    const {
      className = '',
      routePipelineStudio,
      routePipelineDetail,
      routePipelineList,
      routePipelineProject,
      getOtherModal
    } = this.props
    return (
      <AppErrorBoundary
        onRefreshClick={() => {
          return deletePipelineCache(gitDetails).then(() => {
            window.location.reload()
          })
        }}
      >
        <PipelineSchemaContextProvider>
          <GitSyncStoreProvider>
            <div className={cx(css.container, className)}>
              <PipelineCanvas
                // diagram={diagram}
                toPipelineStudio={routePipelineStudio}
                toPipelineDetail={routePipelineDetail}
                toPipelineList={routePipelineList}
                toPipelineProject={routePipelineProject}
                getOtherModal={getOtherModal}
              />
            </div>
          </GitSyncStoreProvider>
        </PipelineSchemaContextProvider>
      </AppErrorBoundary>
    )
  }
}
