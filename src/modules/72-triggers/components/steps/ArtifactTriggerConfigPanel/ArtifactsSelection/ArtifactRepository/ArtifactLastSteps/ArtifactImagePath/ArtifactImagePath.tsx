/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { FormInput, MultiTypeInputType, SelectOption, Text } from '@harness/uicore'
import { useParams } from 'react-router-dom'

import { defaultTo, memoize } from 'lodash-es'
import { IItemRendererProps } from '@blueprintjs/select'
import { useStrings } from 'framework/strings'

import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { ArtifactSource, GetImagesListForEcrQueryParams, useGetImagesListForEcr } from 'services/cd-ng'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'

import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import css from '../../ArtifactConnector.module.scss'

interface ArtifactImagePathProps {
  connectorRef?: string
  region?: string
  artifactType?: ArtifactSource['type']
  imagePath?: string
}

function ArtifactImagePath(props: ArtifactImagePathProps): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getRBACErrorMessage } = useRBACError()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { connectorRef, region, artifactType } = props

  const imagesListAPIQueryParams: GetImagesListForEcrQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    connectorRef,
    region,
    repoIdentifier,
    branch
  }
  const {
    data: imagesListData,
    loading: imagesListLoading,
    refetch: refetchImagesList,
    error: imagesListError
  } = useMutateAsGet(useGetImagesListForEcr, {
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: imagesListAPIQueryParams,
    lazy: true,
    debounce: 300
  })

  const allImageOptions = useMemo(() => {
    if (imagesListLoading) {
      return [{ label: getString('loading'), value: getString('loading') }]
    }
    return defaultTo(
      imagesListData?.data?.images?.map((image: string) => ({
        label: defaultTo(image, ''),
        value: defaultTo(image, '')
      })),
      []
    )
  }, [imagesListLoading, imagesListData])

  const itemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem
      item={item}
      itemProps={itemProps}
      disabled={imagesListLoading || !!imagesListError}
      style={imagesListError ? { lineClamp: 1, width: 400, padding: 'small' } : {}}
    />
  ))

  if (artifactType === ENABLED_ARTIFACT_TYPES.Ecr) {
    return (
      <div className={css.imagePathContainer}>
        <FormInput.MultiTypeInput
          label={getString('pipeline.imagePathLabel')}
          name="imagePath"
          useValue
          selectItems={allImageOptions}
          placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
          multiTypeInputProps={{
            allowableTypes: [MultiTypeInputType.FIXED],
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              if (
                e?.target?.type !== 'text' ||
                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
              ) {
                return
              }
              if (!imagesListLoading) {
                refetchImagesList()
              }
            },
            selectProps: {
              items: allImageOptions,
              allowCreatingNewItems: true,
              itemRenderer: itemRenderer,
              noResults: (
                <Text lineClamp={1} width={384} margin="small">
                  {getRBACErrorMessage(imagesListError as RBACError) || getString('pipeline.noImagesFound')}
                </Text>
              )
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className={css.imagePathContainer}>
      <FormInput.MultiTextInput
        label={getString('pipeline.imagePathLabel')}
        name="imagePath"
        placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
        multiTextInputProps={{ allowableTypes: [MultiTypeInputType.FIXED] }}
      />
    </div>
  )
}

export default ArtifactImagePath
