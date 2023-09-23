/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import routes from '@common/RouteDefinitions'
import { InputSetGitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { InputSetOnCreateUpdate } from './inputSetUtils'

type ComponentWithInputSetsOnCreateUpdateSuccessProps<T> = Omit<
  T,
  keyof Pick<InputSetOnCreateUpdate, 'onCreateUpdateSuccess'>
>

export function withInputSetsOnCreateUpdateSuccess<T extends InputSetOnCreateUpdate = InputSetOnCreateUpdate>(
  WrappedComponent: React.ComponentType<T>
): React.FC<ComponentWithInputSetsOnCreateUpdateSuccessProps<T>> {
  const displayName = defaultTo(WrappedComponent.displayName, defaultTo(WrappedComponent.name, 'Component'))

  function ComponentWithInputSetsOnCreateUpdateSuccess(
    props: ComponentWithInputSetsOnCreateUpdateSuccessProps<T>
  ): JSX.Element {
    const history = useHistory()
    const { module, accountId, orgIdentifier, projectIdentifier, pipelineIdentifier } =
      useParams<PipelineType<PipelinePathProps>>()

    const {
      branch,
      repoIdentifier,
      repoName,
      connectorRef,
      storeType,
      inputSetBranch,
      inputSetRepoIdentifier,
      inputSetRepoName,
      inputSetConnectorRef
    } = useQueryParams<InputSetGitQueryParams>()

    const onInputSetCreateUpdateSuccess = (): void => {
      history.push(
        routes.toInputSetList({
          module,
          accountId,
          orgIdentifier,
          projectIdentifier,
          pipelineIdentifier,
          branch: defaultTo(branch, inputSetBranch),
          repoIdentifier: defaultTo(repoIdentifier, inputSetRepoIdentifier),
          repoName: defaultTo(repoName, inputSetRepoName),
          connectorRef: defaultTo(connectorRef, inputSetConnectorRef),
          storeType
        })
      )
    }

    const propsWithOnCreateUpdateSuccess = { ...props, onCreateUpdateSuccess: onInputSetCreateUpdateSuccess } as T

    return <WrappedComponent {...propsWithOnCreateUpdateSuccess} />
  }

  ComponentWithInputSetsOnCreateUpdateSuccess.displayName = `withInputSetsOnCreateUpdateSuccess(${displayName})`

  return ComponentWithInputSetsOnCreateUpdateSuccess
}
