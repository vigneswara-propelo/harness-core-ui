/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
// TODO
import { PipelineSchemaContextProvider } from '@pipeline/components/PipelineStudio/PipelineSchema/PipelineSchemaContext'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'
import { PipelineCanvasY1 } from '../PipelineCanvas/PipelineCanvasY1'
import { PipelineContextY1 } from '../PipelineContext/PipelineContextY1'
import css from './PipelineStudioInternalY1.module.scss'

export interface PipelineStudioProps {
  className?: string
}

export class PipelineStudioInternalY1 extends React.Component<PipelineStudioProps> {
  context!: React.ContextType<typeof PipelineContextY1>
  static contextType = PipelineContextY1

  render(): JSX.Element {
    const { className = '' } = this.props
    const {
      deletePipelineCache,
      state: { gitDetails }
    } = this.context

    return (
      <AppErrorBoundary
        onRefreshClick={() => {
          return deletePipelineCache(gitDetails).then(() => {
            window.location.reload()
          })
        }}
      >
        <PipelineSchemaContextProvider isYAMLV1>
          <GitSyncStoreProvider>
            <div className={cx(css.container, className)}>
              <PipelineCanvasY1 />
            </div>
          </GitSyncStoreProvider>
        </PipelineSchemaContextProvider>
      </AppErrorBoundary>
    )
  }
}
