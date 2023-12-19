import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { QueryObserverResult } from '@tanstack/react-query'
import { shouldShowError, useToaster } from '@harness/uicore'
import {
  ResponseValidateTemplateInputsResponseDto,
  ValidateTemplateInputsErrorResponse,
  useValidateTemplateInputsQuery
} from 'services/pipeline-rq'
import { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/utils'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { useStrings } from 'framework/strings'
import { StoreMetadata } from '@common/constants/GitSyncTypes'

export type RefetchReturnType = Promise<
  QueryObserverResult<ResponseValidateTemplateInputsResponseDto, ValidateTemplateInputsErrorResponse>
>

export interface UseReconcileReturnType {
  outOfSync: boolean
  setOutOfSync: React.Dispatch<React.SetStateAction<boolean>>
  reconcileData: ResponseValidateTemplateInputsResponseDto | undefined
  reconcileError: ValidateTemplateInputsErrorResponse | null
  isFetchingReconcileData: boolean
  reconcilePipeline: (showToast?: boolean) => RefetchReturnType
}

export interface UseReconcileProps {
  storeMetadata?: StoreMetadata | undefined
}

export function useReconcile({ storeMetadata }: UseReconcileProps): UseReconcileReturnType {
  const { getString } = useStrings()
  const params = useParams<PipelineType<PipelinePathProps> & GitQueryParams>()
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier } = params
  const { showError, showSuccess, clear } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const [outOfSync, setOutOfSync] = React.useState(false)

  const showToastRef = React.useRef(false)

  const {
    data: reconcileData,
    refetch,
    error: reconcileError,
    isFetching: isFetchingReconcileData
  } = useValidateTemplateInputsQuery(
    {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        identifier: pipelineIdentifier,
        ...getGitQueryParamsWithParentScope({ storeMetadata, params })
      }
    },
    {
      enabled: false,
      cacheTime: 0
    }
  )

  useEffect(() => {
    if (!isFetchingReconcileData && reconcileData?.data) {
      clear()
      if (reconcileData.data.validYaml === false && reconcileData.data.errorNodeSummary) {
        setOutOfSync(true)
      } else {
        if (showToastRef?.current) {
          showSuccess(getString('pipeline.outOfSyncErrorStrip.noErrorText', { entity: TemplateErrorEntity.PIPELINE }))
        }
        setOutOfSync(false)
      }
      // this prevents toast to appear when we are using useValidateTemplateInputsQuery in PipelineOutOfSync
      // toast will appear when we call explicitly reconcilePipeline
      showToastRef.current = false
    }
  }, [reconcileData?.data, isFetchingReconcileData])

  const reconcilePipeline = (showToast = true): RefetchReturnType => {
    showToastRef.current = showToast
    return refetch()
  }

  useEffect(() => {
    if (reconcileError && shouldShowError(reconcileError)) {
      showError(getRBACErrorMessage(reconcileError as RBACError))
    }
  }, [reconcileError])

  return {
    outOfSync,
    setOutOfSync,
    reconcileData,
    reconcileError,
    isFetchingReconcileData,
    reconcilePipeline
  }
}
