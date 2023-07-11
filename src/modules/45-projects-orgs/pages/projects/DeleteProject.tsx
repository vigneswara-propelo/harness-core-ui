/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Intent } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import {
  useToaster,
  useConfirmationDialog,
  Button,
  Layout,
  ButtonSize,
  ButtonVariation,
  TextInput,
  Text
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import React, { useState } from 'react'
import { String, useStrings } from 'framework/strings'
import { Project, useDeleteProject } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore, SavedProjectDetails } from 'framework/AppStore/AppStoreContext'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import css from './ProjectsPage.module.scss'

interface UseDeleteProjectDialogReturn {
  openDialog: () => void
}
interface DeleteProjectOrgButtonsProps {
  onDelete: () => void
  onCancel: () => void
  name: string
  disableDeleteBtn?: boolean
  inputPlaceholder: string
  inputLabel: string
}

export const DeleteProjectOrgButtons: React.FC<DeleteProjectOrgButtonsProps> = ({
  onDelete,
  onCancel,
  name,
  disableDeleteBtn,
  inputLabel,
  inputPlaceholder
}) => {
  const { getString } = useStrings()
  const [inputText, setInputText] = useState<string>('')
  const [doubleCheckDelete, setDoubleCheckDelete] = useState<boolean>(false)

  return (
    <Layout.Vertical spacing="none" width="100%">
      {!doubleCheckDelete ? (
        <Layout.Horizontal spacing="xsmall" flex={{ justifyContent: 'flex-start' }}>
          <Button
            text={getString('projectsOrgs.confirmDeleteProject')}
            intent={Intent.DANGER}
            size={ButtonSize.LARGE}
            onClick={() => {
              setDoubleCheckDelete(true)
            }}
          />
          <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={() => onCancel?.()} />
        </Layout.Horizontal>
      ) : (
        <Layout.Vertical>
          <Text margin={{ bottom: 'xsmall' }} font={{ variation: FontVariation.FORM_HELP }}>
            {inputLabel}:
          </Text>
          <TextInput
            placeholder={inputPlaceholder}
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
            autoFocus
          />
          <Layout.Horizontal spacing="xsmall" flex={{ justifyContent: 'flex-start' }}>
            <Button
              text={getString('delete')}
              intent={Intent.DANGER}
              disabled={inputText !== name || disableDeleteBtn}
              onClick={() => {
                onDelete?.()
              }}
            />
            <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={() => onCancel?.()} />
          </Layout.Horizontal>
        </Layout.Vertical>
      )}
    </Layout.Vertical>
  )
}
const useDeleteProjectDialog = (data: Project, onSuccess: () => void): UseDeleteProjectDialogReturn => {
  const { accountId } = useParams<AccountPathProps>()
  const { updateAppStore, selectedProject: selectedProjectFromAppStore } = useAppStore()
  const { getRBACErrorMessage } = useRBACError()
  const { preference: savedProjectFromPreferenceStore, clearPreference: clearSavedProject } =
    usePreferenceStore<SavedProjectDetails>(PreferenceScope.USER, 'savedProject')
  const { mutate: deleteProject, loading } = useDeleteProject({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ ''
    }
  })
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const onDeleteAction = async () => {
    try {
      const deleted = await deleteProject(data.identifier || /* istanbul ignore next */ '', {
        headers: { 'content-type': 'application/json' }
      })
      if (deleted.data) {
        showSuccess(
          getString('projectCard.successMessage', { projectName: data.name || /* istanbul ignore next */ '' })
        )
        if (savedProjectFromPreferenceStore?.projectIdentifier === data?.identifier) {
          clearSavedProject()
        }
        if (selectedProjectFromAppStore?.identifier === data?.identifier) {
          updateAppStore({ selectedProject: undefined, selectedOrg: undefined })
        }
        onSuccess()
      } else {
        showError(
          getString('projectsOrgs.projectDeleteErrorMessage', {
            projectName: data.name || /* istanbul ignore next */ ''
          })
        )
      }
    } catch (err) {
      /* istanbul ignore next */
      showError(getRBACErrorMessage(err))
    } finally {
      closeDialog()
    }
  }
  const { openDialog, closeDialog } = useConfirmationDialog({
    contentText: (
      <String
        stringID="projectsOrgs.deleteProjectText"
        vars={{
          name: data.name
        }}
        className={css.deleteProjectText}
        useRichText={true}
      />
    ),
    titleText: getString('projectCard.confirmDeleteTitle'),
    intent: Intent.DANGER,
    customButtons: (
      <DeleteProjectOrgButtons
        onCancel={() => {
          closeDialog()
        }}
        onDelete={onDeleteAction}
        name={data.name}
        disableDeleteBtn={loading}
        inputLabel={getString('projectsOrgs.toConfirmProject')}
        inputPlaceholder={getString('projectsOrgs.toDelete', { name: getString('projectLabel') })}
      />
    ),
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        onDeleteAction()
      }
    }
  })
  return {
    openDialog
  }
}

export default useDeleteProjectDialog
