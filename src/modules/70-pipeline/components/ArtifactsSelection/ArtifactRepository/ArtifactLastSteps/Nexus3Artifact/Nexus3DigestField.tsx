/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import { useParams } from 'react-router-dom'
import type { AllowedTypes } from '@harness/uicore'
import { defaultTo, get } from 'lodash-es'
import type { FormikValues } from 'formik'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import {
  ArtifactDigestWrapperDetails,
  canFetchArtifactDigest,
  checkIfQueryParamsisNotEmpty,
  helperTextDataForDigest,
  resetFieldValue
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { useMutateAsGet } from '@common/hooks'
import { useGetLastSuccessfulBuildForNexusArtifact } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { getHelperTextForDigest } from '@pipeline/utils/stageHelpers'
import { RepositoryPortOrServer, TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { isValueFixed } from '@common/utils/utils'
import BaseArtifactDigestField from '../ArtifactImagePathTagView/BaseArtifactDigestField'

interface Nexus3DigestFieldWrapperProps {
  formik: FormikValues
  isTagDetailsLoading: boolean
  expressions: string[]
  allowableTypes: AllowedTypes
  isReadonly: boolean
  connectorRefValue: string
}
export function Nexus3ArtifactDigestField({
  formik,
  expressions,
  allowableTypes,
  isReadonly,
  connectorRefValue,
  isTagDetailsLoading
}: Nexus3DigestFieldWrapperProps): React.ReactElement {
  const artifactType = ENABLED_ARTIFACT_TYPES.Nexus3Registry
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const digestDetails: ArtifactDigestWrapperDetails = {
    errorText: getString('pipeline.artifactsSelection.garNoDigestErrortest'),
    digestPath: 'digest',
    formikDigestValueField: formik?.values?.digest
  }

  const tagValue = defaultTo(formik?.values?.tag?.value, formik?.values?.tag)
  const canFetchDigest = canFetchArtifactDigest(
    connectorRefValue,
    get(formik?.values, 'repository'),
    get(formik?.values, 'repositoryFormat'),
    get(formik?.values, 'spec.artifactPath'),
    get(formik?.values, 'spec.repositoryPortorRepositoryURL') === RepositoryPortOrServer.RepositoryPort &&
      get(formik?.values, 'spec.repositoryPort'),
    get(formik?.values, 'spec.repositoryPortorRepositoryURL') === RepositoryPortOrServer.RepositoryUrl &&
      get(formik?.values, 'spec.repositoryUrl'),
    tagValue
  )

  const digestValue = defaultTo(formik?.values?.digest?.value, formik?.values?.digest)

  const isDigestDisabled = React.useMemo(() => {
    if (formik?.values?.tagType === TagTypes.Value && tagValue) {
      if ((isValueFixed(tagValue) && checkIfQueryParamsisNotEmpty([tagValue])) || !isValueFixed(tagValue)) return false
    } else if (formik?.values?.tagType === TagTypes.Regex && formik?.values?.tagRegex) {
      if (
        (isValueFixed(formik?.values?.tagRegex) && checkIfQueryParamsisNotEmpty([formik?.values?.tagRegex])) ||
        !isValueFixed(formik?.values?.tagRegex)
      )
        return false
    }
    // return true will disable the digest fields
    else {
      resetFieldValue(formik, 'digest')
      return true
    }
  }, [tagValue, formik?.values?.tagRegex, formik])

  const isTagRegexType = formik?.values?.tagType === TagTypes.Regex

  const helperText =
    isValueFixed(digestValue) &&
    getHelperTextForDigest(helperTextDataForDigest(artifactType, formik, connectorRefValue), getString, false)

  const {
    data: dataNexus3,
    loading: loadingNexus3,
    refetch: refetchNexus3,
    error: errorNexus3
  } = useMutateAsGet(useGetLastSuccessfulBuildForNexusArtifact, {
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      connectorRef: connectorRefValue,
      repository: formik?.values?.repository,
      repositoryFormat: formik?.values?.repositoryFormat,
      artifactPath: formik?.values?.spec?.artifactPath,
      repositoryPort: formik?.values?.spec?.repositoryPort,
      repositoryUrl: formik?.values?.spec?.repositoryUrl
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    lazy: true,
    body: {
      tag: tagValue
    }
  })

  return (
    <BaseArtifactDigestField
      data={dataNexus3}
      loading={loadingNexus3}
      refetch={refetchNexus3}
      error={errorNexus3}
      canFetchDigest={canFetchDigest}
      digestDetails={digestDetails}
      selectedArtifact={artifactType}
      formik={formik}
      expressions={expressions}
      allowableTypes={allowableTypes}
      isReadonly={isReadonly}
      isBuildDetailsLoading={isTagDetailsLoading}
      isDigestDisabled={isDigestDisabled}
      isLastBuildRegexType={isTagRegexType}
      helperText={helperText}
    />
  )
}
