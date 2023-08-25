/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { IDialogProps } from '@blueprintjs/core'
import { Dialog, getErrorInfoFromErrorObject, useToaster } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { UseGetProps } from 'restful-react'
import {
  Failure,
  GetNotesForExecutionQueryParams,
  PipelineExecutionSummary,
  ResponsePipelineExecutionNotes,
  useGetNotesForExecution,
  useUpdateNotesForExecution
} from 'services/pipeline-ng'
import { AccountPathProps, ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import NotesModalForm from './NotesModalForm'

const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false
}

interface UseNotesModalProps {
  planExecutionId: string
  pipelineExecutionSummary: PipelineExecutionSummary
}
interface UseNotesModalReturnProps {
  notes: string
  onClick: (fetchNotes?: boolean) => void
  updateNotes: (updatedNotes: string) => void
  refetchNotes: (
    options?:
      | Partial<
          Omit<
            UseGetProps<ResponsePipelineExecutionNotes, Failure | Error, GetNotesForExecutionQueryParams, unknown>,
            'lazy'
          >
        >
      | undefined
  ) => Promise<void>
  loading: boolean
}

export function useNotesModal({
  planExecutionId,
  pipelineExecutionSummary
}: UseNotesModalProps): UseNotesModalReturnProps {
  const [notes, setNotes] = React.useState('')
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    ProjectPathProps & AccountPathProps & ModulePathParams
  >()
  const { showError, showSuccess } = useToaster()
  const { getString } = useStrings()
  const {
    data: notesContent,
    refetch: refetchNotes,
    loading
  } = useGetNotesForExecution({
    queryParams: {
      accountIdentifier: accountId
    },
    planExecutionId: planExecutionId,
    debounce: 300,
    lazy: true
  })
  const { mutate: saveNotes, error: errorOnSave } = useUpdateNotesForExecution({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier, notesForPipelineExecution: '' },
    planExecutionId
  })

  const executionNotes = notesContent?.data?.notes

  React.useEffect(() => {
    executionNotes && setNotes(executionNotes)
  }, [executionNotes])

  React.useEffect(() => {
    /* istanbul ignore next */ if (errorOnSave) {
      showError(getErrorInfoFromErrorObject(errorOnSave))
    }
  }, [errorOnSave, showError])

  const onSave = (newNotes: string): void => {
    setNotes(newNotes)
    hideModal()
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog onClose={hideModal} {...DIALOG_PROPS}>
        <NotesModalForm
          notes={notes}
          pipelineExecutionSummary={pipelineExecutionSummary}
          updateNotes={updateNotes}
          loading={loading}
          onClose={hideModal}
        />
      </Dialog>
    ),
    [notes, pipelineExecutionSummary, loading]
  )

  const handleClick = (fetchNotes?: boolean): void => {
    fetchNotes && refetchNotes()
    showModal()
  }

  const updateNotes = (updatedNote: string): void => {
    saveNotes(undefined, {
      queryParams: {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier,
        notesForPipelineExecution: updatedNote
      },
      pathParams: {
        planExecutionId: planExecutionId
      },
      headers: {
        'content-type': 'application/json'
      }
    })?.then(({ data, status }) => {
      if (status === 'SUCCESS') {
        showSuccess(getString('pipeline.executionNotes.noteSaved'))
        onSave(data?.notes as string)
      }
    })
  }

  return {
    onClick: handleClick,
    notes,
    updateNotes,
    refetchNotes,
    loading
  }
}
