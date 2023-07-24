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
import { useGetLastSuccessfulBuildForArtifactoryArtifact } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { getHelperTextForDigest } from '@pipeline/utils/stageHelpers'
import { TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { isValueFixed } from '@common/utils/utils'
import BaseArtifactDigestField from '../ArtifactImagePathTagView/BaseArtifactDigestField'

interface ArtifactoryDigestFieldWrapperProps {
  formik: FormikValues
  isTagDetailsLoading: boolean
  expressions: string[]
  allowableTypes: AllowedTypes
  isReadonly: boolean
  connectorRefValue: string
  repositoryFormat: string
}
export function ArtifactoryArtifactDigestField({
  formik,
  expressions,
  allowableTypes,
  isReadonly,
  connectorRefValue,
  isTagDetailsLoading,
  repositoryFormat
}: ArtifactoryDigestFieldWrapperProps): React.ReactElement {
  const artifactType = ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const digestDetails: ArtifactDigestWrapperDetails = {
    errorText: getString('pipeline.artifactsSelection.errors.nodigest'),
    digestPath: 'digest',
    formikDigestValueField: formik?.values?.digest
  }
  const canFetchDigest = canFetchArtifactDigest(
    connectorRefValue,
    get(formik?.values, 'repository'),
    get(formik?.values, 'artifactPath'),
    get(formik?.values, 'repositoryUrl'),
    repositoryFormat
  )

  const tagValue = defaultTo(formik?.values?.tag?.value, formik?.values?.tag)
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
    data: dataArtifactory,
    loading: loadingArtifactory,
    refetch: refetchArtifactory,
    error: errorArtifactory
  } = useMutateAsGet(useGetLastSuccessfulBuildForArtifactoryArtifact, {
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      connectorRef: connectorRefValue,
      repository: defaultTo(formik?.values?.repository?.value, formik?.values?.repository),
      artifactPath: defaultTo(formik?.values?.artifactPath?.value, formik?.values?.artifactPath),
      repositoryFormat: repositoryFormat,
      repositoryUrl: defaultTo(formik?.values?.repositoryUrl?.value, formik?.values?.repositoryUrl)
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    lazy: true,
    body: {
      tag: defaultTo(formik?.values?.tag?.value, formik?.values?.tag)
    }
  })

  return (
    <BaseArtifactDigestField
      data={dataArtifactory}
      loading={loadingArtifactory}
      refetch={refetchArtifactory}
      error={errorArtifactory}
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
