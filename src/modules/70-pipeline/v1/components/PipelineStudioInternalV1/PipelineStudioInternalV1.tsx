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
import { UnhandledErrorMessage } from '@pipeline/common/components/UnhandledErrorMessage/UnhandledErrorMessage'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { PipelineCanvasV1 } from '../PipelineCanvasV1/PipelineCanvasV1'
import { PipelineContext } from '../../../components/PipelineStudio/PipelineContext/PipelineContext'
import { PipelineSchemaContextProviderV1 } from '../PipelineStudioV1/PipelineSchemaContextV1/PipelineSchemaContextV1'
import css from '../../../components/PipelineStudio/PipelineStudioInternal/PipelineStudioInternal.module.scss'

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

interface PipelineStudioState {
  error?: Error
}

interface OtherModalProps {
  onSubmit?: (values: PipelineInfoConfig) => void
  initialValues?: PipelineInfoConfig
  onClose?: () => void
}

export class PipelineStudioInternalV1 extends React.Component<PipelineStudioProps, PipelineStudioState> {
  state: PipelineStudioState = { error: undefined }
  context!: React.ContextType<typeof PipelineContext>
  static contextType = PipelineContext

  componentDidCatch(error: Error): boolean {
    this.setState({ error })
    if (window?.bugsnagClient?.notify) {
      window?.bugsnagClient?.notify(error)
    }
    return false
  }

  render(): JSX.Element {
    const { error } = this.state
    const {
      deletePipelineCache,
      state: { gitDetails }
    } = this.context
    if (error) {
      return (
        <UnhandledErrorMessage
          error={error}
          onClick={() => {
            return deletePipelineCache(gitDetails).then(() => {
              window.location.reload()
            })
          }}
        />
      )
    }
    const {
      className = '',
      routePipelineStudio,
      routePipelineDetail,
      routePipelineList,
      routePipelineProject,
      getOtherModal
    } = this.props
    return (
      <PipelineSchemaContextProviderV1>
        <GitSyncStoreProvider>
          <div className={cx(css.container, className)}>
            <PipelineCanvasV1
              // diagram={diagram}
              toPipelineStudio={routePipelineStudio}
              toPipelineDetail={routePipelineDetail}
              toPipelineList={routePipelineList}
              toPipelineProject={routePipelineProject}
              getOtherModal={getOtherModal}
            />
          </div>
        </GitSyncStoreProvider>
      </PipelineSchemaContextProviderV1>
    )
  }
}
