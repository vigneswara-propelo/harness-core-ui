/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get } from 'lodash-es'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArtifactListConfig, ArtifactSource, useGetServiceV2 } from 'services/cd-ng'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { parse } from '@common/utils/YamlHelperMethods'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

// Effect to find TagType to evaluate kind of component to show for Digest
export const useIsTagRegex = ({
  serviceIdentifier,
  artifact,
  artifactPath,
  tagOrVersionRegexKey
}: {
  serviceIdentifier: string
  artifact: ArtifactSource
  artifactPath: string
  tagOrVersionRegexKey: string
}): { isTagRegex: boolean; isServiceLoading: boolean } => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [isTagRegex, setIsTagRegex] = useState(false)
  const { NG_SVC_ENV_REDESIGN } = useFeatureFlags()
  const { data: service, loading: isServiceLoading } = useGetServiceV2({
    serviceIdentifier: serviceIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      fetchResolvedYaml: true
    }
  })

  // Effect to find TagType to evaluate kind of component to show for Digest
  useEffect(() => {
    const parsedService = parse(defaultTo(service?.data?.service?.yaml, ''))
    /* istanbul ignore else */
    if (NG_SVC_ENV_REDESIGN && parsedService) {
      const artifactsList = get(parsedService, `service.serviceDefinition.spec.artifacts`) as ArtifactListConfig
      const artifactDetailsFromServiceYaml = artifactsList?.primary?.sources
        ? artifactsList.primary.sources.find(
            (artifactInfo: ArtifactSource) => artifactInfo?.identifier === artifact.identifier
          )
        : get(artifactsList, `${artifactPath}`)

      setIsTagRegex(!!get(artifactDetailsFromServiceYaml?.spec, tagOrVersionRegexKey))
    } else {
      setIsTagRegex(!!get(artifact?.spec, tagOrVersionRegexKey))
    }
  }, [service, artifact, artifactPath])

  return { isTagRegex, isServiceLoading: (NG_SVC_ENV_REDESIGN as boolean) && isServiceLoading }
}
