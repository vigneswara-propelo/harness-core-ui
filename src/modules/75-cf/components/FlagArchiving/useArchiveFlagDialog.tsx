import React, { FormEvent, useEffect, useMemo, useState } from 'react'
import { Layout, PageError, Text, TextInput, useConfirmationDialog } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import type { MutateRequestOptions } from 'restful-react/dist/Mutate'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useToaster } from '@common/exports'
import { String, useStrings } from 'framework/strings'
import {
  DeleteFeatureFlagQueryParams,
  Feature,
  useGetDependentFeatures,
  Features,
  GetDependentFeaturesQueryParams
} from 'services/cf'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import useResponseError from '@cf/hooks/useResponseError'
import ArchiveFlagButtons from './ArchiveFlagButtons'
import CannotArchiveWarning from './CannotArchiveWarning'
import css from './useArchiveFlagDialog.module.scss'

export interface ArchiveDialogProps {
  flagData: Feature
  archiveFlag: (
    data: string,
    mutateRequestOptions?: MutateRequestOptions<DeleteFeatureFlagQueryParams, void> | undefined
  ) => void
  queryParams: DeleteFeatureFlagQueryParams
  onArchive: () => void
  openedArchivedDialog: boolean
}

interface UseArchiveFlagDialogReturn {
  openDialog: () => void
}

const useArchiveFlagDialog = ({
  flagData,
  archiveFlag,
  queryParams,
  onArchive,
  openedArchivedDialog
}: ArchiveDialogProps): UseArchiveFlagDialogReturn => {
  const [isAnIdentifierMatch, setIsAnIdentifierMatch] = useState<boolean>(false)
  const [validationFlagIdentifier, setValidationFlagIdentifier] = useState<string>('')
  const [pageNumber, setPageNumber] = useState<number>(0)

  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const { handleResponseError } = useResponseError()

  const {
    data: dependentFlagsResponse,
    loading: dependentFlagsLoading,
    error: dependentFlagsError,
    refetch: refetchDependentFlags
  } = useGetDependentFeatures({
    queryParams: { ...queryParams, pageNumber, pageSize: CF_DEFAULT_PAGE_SIZE },
    identifier: flagData.identifier,
    lazy: true
  })

  enum STATUS {
    'error',
    'hasDependentFlags',
    'hasNoDependentFlags',
    'loading',
    'ok'
  }

  // removes the flagFilter queryParam which is undefined
  const dependentFlagQueryParams = useMemo(
    () => Object.fromEntries(Object.entries(queryParams).filter(([_, v]) => v !== null)),
    [queryParams]
  )

  const state = useMemo<STATUS>(() => {
    if (dependentFlagsError) {
      return STATUS.error
    } else if (dependentFlagsLoading) {
      return STATUS.loading
    } else if (dependentFlagsResponse?.features?.length && !dependentFlagsLoading) {
      return STATUS.hasDependentFlags
    } else if (!dependentFlagsResponse?.features?.length && !dependentFlagsLoading) {
      return STATUS.hasNoDependentFlags
    }
    return STATUS.ok
  }, [
    dependentFlagsError,
    dependentFlagsLoading,
    dependentFlagsResponse?.features?.length,
    STATUS.error,
    STATUS.hasDependentFlags,
    STATUS.hasNoDependentFlags,
    STATUS.loading,
    STATUS.ok
  ])

  const handleArchive = async (): Promise<void> => {
    try {
      await archiveFlag(flagData.identifier, { queryParams: { ...queryParams, forceDelete: false } })
      showSuccess(getString('cf.featureFlags.archiving.archiveSuccess'))
      onArchive()
      setValidationFlagIdentifier('')
      closeDialog()
    } catch (e) {
      handleResponseError(e)
    }
  }

  const dialogContent = useMemo(
    () => {
      if (state === STATUS.error) {
        return <PageError message={dependentFlagsError} onClick={() => refetchDependentFlags()} />
      }

      if (state === STATUS.loading) {
        return <ContainerSpinner flex={{ align: 'center-center' }} />
      }

      if (state === STATUS.hasDependentFlags) {
        return (
          <CannotArchiveWarning
            flagIdentifier={flagData.identifier}
            flagName={flagData.name}
            dependentFlagsResponse={dependentFlagsResponse as Features}
            queryParams={dependentFlagQueryParams as GetDependentFeaturesQueryParams}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
          />
        )
      }

      if (state === STATUS.hasNoDependentFlags) {
        return (
          <Layout.Vertical spacing="small">
            <String
              stringID="cf.featureFlags.archiving.warningDescription"
              vars={{ flagIdentifier: flagData.identifier }}
              useRichText
            />
            <Text>{getString('cf.featureFlags.archiving.confirmFlag')}</Text>
            <TextInput
              onPaste={e => e.preventDefault()}
              errorText={
                !isAnIdentifierMatch && validationFlagIdentifier !== ''
                  ? getString('cf.featureFlags.archiving.mismatchIdentifierError')
                  : undefined
              }
              intent={!isAnIdentifierMatch && validationFlagIdentifier !== '' ? Intent.DANGER : Intent.PRIMARY}
              aria-label={getString('cf.featureFlags.archiving.confirmFlag')}
              placeholder={flagData?.identifier}
              value={validationFlagIdentifier}
              onChange={(e: FormEvent<HTMLInputElement>) => {
                setValidationFlagIdentifier(e.currentTarget.value)
                setIsAnIdentifierMatch(e.currentTarget.value === flagData?.identifier)
              }}
            />
          </Layout.Vertical>
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dependentFlagsError,
      dependentFlagsLoading,
      dependentFlagsResponse?.features?.length,
      STATUS.error,
      STATUS.hasDependentFlags,
      STATUS.hasNoDependentFlags,
      STATUS.loading,
      STATUS.ok,
      dependentFlagQueryParams,
      dependentFlagsResponse,
      flagData.identifier,
      flagData.name,
      isAnIdentifierMatch,
      state,
      refetchDependentFlags,
      showError,
      validationFlagIdentifier,
      pageNumber
    ]
  )

  useEffect(() => {
    if (openedArchivedDialog) {
      refetchDependentFlags()
    }
  }, [refetchDependentFlags, openedArchivedDialog])

  const { openDialog, closeDialog } = useConfirmationDialog({
    className: css.dialog,
    intent: Intent.DANGER,
    titleText: getString('cf.featureFlags.archiving.archiveFlag'),
    contentText: dialogContent,
    customButtons: state === STATUS.hasNoDependentFlags && (
      <ArchiveFlagButtons
        identifierMatch={isAnIdentifierMatch}
        onClose={() => {
          closeDialog()
        }}
        onArchive={handleArchive}
      />
    )
  })

  return { openDialog }
}

export default useArchiveFlagDialog
