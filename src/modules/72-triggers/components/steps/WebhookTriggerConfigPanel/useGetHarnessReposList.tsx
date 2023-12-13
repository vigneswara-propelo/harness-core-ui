/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { SelectOption } from '@harness/uicore'
import { ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { TypesRepository, useListRepos } from 'services/code'
import { WebhookTriggerConfigV2 } from 'services/pipeline-ng'
import { GitSourceProviders } from '../../Triggers/utils'

export const useGetHarnessReposList = (sourceRepo: Required<WebhookTriggerConfigV2>['type']): SelectOption[] => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { data: repositoriesListResult } = useListRepos({
    space_ref: `${accountId}/${orgIdentifier}/${projectIdentifier}/+`,
    // Call useListRepos only for the Harness Source Repo
    lazy: sourceRepo !== GitSourceProviders.Harness.value
  })
  const repoOptions: SelectOption[] = useMemo(
    () =>
      repositoriesListResult?.map((repo: TypesRepository) => ({
        value: repo.uid as string,
        label: repo.uid as string
      })) || [],
    [repositoriesListResult]
  )

  return repoOptions
}
