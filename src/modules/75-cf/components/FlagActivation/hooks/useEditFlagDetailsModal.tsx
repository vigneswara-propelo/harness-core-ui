/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Container, FormInput, Layout, ModalDialog } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Divider } from '@blueprintjs/core'
import { Form, Formik } from 'formik'
import * as yup from 'yup'
import type { MutateMethod } from 'restful-react/dist/Mutate'
import type {
  Feature,
  FeatureResponseMetadata,
  GitSyncErrorResponse,
  GitSyncPatchOperation,
  PatchFeaturePathParams,
  PatchFeatureQueryParams
} from 'services/cf'
import { showToaster } from '@cf/utils/CFUtils'

import { GIT_SYNC_ERROR_CODE, UseGitSync } from '@cf/hooks/useGitSync'
import { useGovernance } from '@cf/hooks/useGovernance'
import { useStrings } from 'framework/strings'
import { GIT_COMMIT_MESSAGES } from '@cf/constants/GitSyncConstants'
import patch from '../../../utils/instructions'
import SaveFlagToGitSubForm from '../../SaveFlagToGitSubForm/SaveFlagToGitSubForm'

interface UseEditFlagDetailsModalProps {
  featureFlag: Feature
  gitSync: UseGitSync
  submitPatch: MutateMethod<
    FeatureResponseMetadata,
    GitSyncPatchOperation,
    PatchFeatureQueryParams,
    PatchFeaturePathParams
  >
  refetchFlag: () => void
  setGovernanceMetadata: (governanceMetadata: unknown) => void
}

interface UseEditFlagDetailsModalReturn {
  openEditDetailsModal: () => void
  hideEditDetailsModal: () => void
}

const useEditFlagDetailsModal = (props: UseEditFlagDetailsModalProps): UseEditFlagDetailsModalReturn => {
  const { featureFlag, gitSync, refetchFlag, submitPatch, setGovernanceMetadata } = props
  const { getString } = useStrings()
  const { handleError: handleGovernanceError, isGovernanceError } = useGovernance()

  const [openEditDetailsModal, hideEditDetailsModal] = useModalHook(() => {
    const gitSyncFormMeta = gitSync?.getGitSyncFormMeta(GIT_COMMIT_MESSAGES.UPDATED_FLAG_DETAILS)

    const initialValues = {
      name: featureFlag.name.trim(),
      description: featureFlag.description,
      permanent: featureFlag.permanent,
      gitDetails: gitSyncFormMeta?.gitSyncInitialValues.gitDetails,
      autoCommit: gitSyncFormMeta?.gitSyncInitialValues.autoCommit
    }

    const handleSubmit = (values: typeof initialValues): void => {
      const { name, description, permanent } = values
      if (name !== initialValues.name) {
        patch.feature.addInstruction(patch.creators.updateName(name as string))
      }

      if (description !== initialValues.description) {
        patch.feature.addInstruction(patch.creators.updateDescription(description as string))
      }

      if (permanent !== initialValues.permanent) {
        patch.feature.addInstruction(patch.creators.updatePermanent(!!permanent))
      }

      patch.feature
        .onPatchAvailable(data => {
          submitPatch(
            gitSync?.isGitSyncEnabled
              ? {
                  ...data,
                  gitDetails: values.gitDetails
                }
              : data
          )
            .then(async response => {
              if (values.autoCommit) {
                await gitSync?.handleAutoCommit(values.autoCommit)
              }

              patch.feature.reset()
              hideEditDetailsModal()
              refetchFlag()
              setGovernanceMetadata(response?.details?.governanceMetadata)
              showToaster(getString('cf.messages.flagUpdated'))
            })
            .catch(error => {
              if (error.status === GIT_SYNC_ERROR_CODE) {
                gitSync?.handleError(error.data as GitSyncErrorResponse)
              } else {
                if (isGovernanceError(error?.data)) {
                  handleGovernanceError(error?.data)
                } else {
                  patch.feature.reset()
                }
              }
            })
        })
        .onEmptyPatch(hideEditDetailsModal)
    }

    return (
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={yup.object().shape({
          name: yup.string().required(getString('cf.creationModal.aboutFlag.nameRequired')),
          gitDetails: gitSyncFormMeta.gitSyncValidationSchema
        })}
        onSubmit={handleSubmit}
      >
        {({ submitForm, isValid }) => (
          <ModalDialog
            enforceFocus={false}
            onClose={hideEditDetailsModal}
            isOpen
            title={getString('cf.editDetails.editDetailsHeading')}
            footer={
              <Layout.Horizontal spacing="small">
                <Button
                  intent="primary"
                  text={getString('save')}
                  onClick={submitForm}
                  variation={ButtonVariation.PRIMARY}
                  disabled={!isValid}
                />
                <Button
                  text={getString('cancel')}
                  variation={ButtonVariation.TERTIARY}
                  onClick={hideEditDetailsModal}
                />
              </Layout.Horizontal>
            }
          >
            <Form data-testid="edit-flag-form">
              <Layout.Vertical spacing="medium">
                <FormInput.Text name="name" label={getString('name')} />

                <FormInput.TextArea
                  name="description"
                  label={getString('description')}
                  textArea={{ style: { minHeight: '5rem' } }}
                />

                <FormInput.CheckBox name="permanent" label={getString('cf.editDetails.permaFlag')} />
                {gitSync?.isGitSyncEnabled && !gitSync?.isAutoCommitEnabled && (
                  <>
                    <Container>
                      <Divider />
                    </Container>
                    <SaveFlagToGitSubForm subtitle={getString('cf.gitSync.commitChanges')} hideNameField />
                  </>
                )}
              </Layout.Vertical>
            </Form>
          </ModalDialog>
        )}
      </Formik>
    )
  }, [featureFlag, gitSync?.isAutoCommitEnabled, gitSync?.isGitSyncEnabled])

  return { openEditDetailsModal, hideEditDetailsModal }
}

export default useEditFlagDetailsModal
