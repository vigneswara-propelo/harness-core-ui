/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Button, ButtonVariation, Container, FormError, FormInput, Layout, ModalDialog } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Divider } from '@blueprintjs/core'
import { Form, Formik } from 'formik'
import { differenceBy } from 'lodash-es'
import * as yup from 'yup'
import type { MutateMethod } from 'restful-react/dist/Mutate'
import { getIdentifierFromName } from '@modules/10-common/utils/StringUtils'
import {
  Feature,
  FeatureResponseMetadata,
  GitSyncPatchOperation,
  PatchFeaturePathParams,
  PatchFeatureQueryParams
} from 'services/cf'
import { showToaster } from '@cf/utils/CFUtils'
import useResponseError from '@cf/hooks/useResponseError'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { UseGitSync } from '@cf/hooks/useGitSync'
import { useStrings } from 'framework/strings'
import { GIT_COMMIT_MESSAGES } from '@cf/constants/GitSyncConstants'
import { MAX_TAG_NAME_LENGTH } from '@cf/constants'
import patch from '../../../utils/instructions'
import SaveFlagToGitSubForm from '../../SaveFlagToGitSubForm/SaveFlagToGitSubForm'
import css from './useEditFlagDetailsModal.module.scss'

export interface tagsDropdownData {
  value: string
  label: string
}

export interface UseEditFlagDetailsModalProps {
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
  tagsDisabled: boolean
  tagsData: tagsDropdownData[]
}

interface UseEditFlagDetailsModalReturn {
  openEditDetailsModal: () => void
  hideEditDetailsModal: () => void
}

const useEditFlagDetailsModal = (props: UseEditFlagDetailsModalProps): UseEditFlagDetailsModalReturn => {
  const { featureFlag, gitSync, refetchFlag, submitPatch, setGovernanceMetadata, tagsData, tagsDisabled } = props
  const { getString } = useStrings()
  const { FFM_8184_FEATURE_FLAG_TAGGING } = useFeatureFlags()
  const { handleResponseError } = useResponseError()

  const existingTags = useMemo(() => {
    return featureFlag?.tags?.map(t => ({ value: t.identifier, label: t.name })) || []
  }, [featureFlag.tags])

  const [openEditDetailsModal, hideEditDetailsModal] = useModalHook(() => {
    const gitSyncFormMeta = gitSync?.getGitSyncFormMeta(GIT_COMMIT_MESSAGES.UPDATED_FLAG_DETAILS)

    const initialValues = {
      name: featureFlag.name.trim(),
      description: featureFlag.description,
      permanent: featureFlag.permanent,
      tags: existingTags,
      gitDetails: gitSyncFormMeta?.gitSyncInitialValues.gitDetails,
      autoCommit: gitSyncFormMeta?.gitSyncInitialValues.autoCommit
    }

    const handleSubmit = (values: typeof initialValues): void => {
      const { name, description, permanent, tags } = values
      if (name !== initialValues.name) {
        patch.feature.addInstruction(patch.creators.updateName(name as string))
      }

      if (description !== initialValues.description) {
        patch.feature.addInstruction(patch.creators.updateDescription(description as string))
      }

      if (permanent !== initialValues.permanent) {
        patch.feature.addInstruction(patch.creators.updatePermanent(!!permanent))
      }

      if (JSON.stringify(tags) !== JSON.stringify(initialValues.tags)) {
        const newOrAssignedTags = differenceBy(tags, initialValues.tags, 'value')

        const sanitizedNewOrAssignedTags = newOrAssignedTags.map(tag => ({
          name: tag.label,
          identifier: getIdentifierFromName(tag.value)
        }))

        const removedTags = differenceBy(initialValues.tags, tags, 'value')

        const sanitizedRemovedTags = removedTags.map(tag => ({
          name: tag.label,
          identifier: getIdentifierFromName(tag.value)
        }))

        sanitizedNewOrAssignedTags.forEach(tag =>
          patch.feature.addInstruction(patch.creators.addTag(tag.name, tag.identifier))
        )

        sanitizedRemovedTags.forEach(tag =>
          patch.feature.addInstruction(patch.creators.removeTag(tag.name, tag.identifier))
        )
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
              handleResponseError(error)
              patch.feature.reset()
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
          gitDetails: gitSyncFormMeta.gitSyncValidationSchema,
          tags: yup
            .array()
            .of(
              yup.object().shape({
                label: yup
                  .string()
                  .trim()
                  .max(MAX_TAG_NAME_LENGTH, getString('cf.featureFlags.tagging.inputErrorMessage'))
                  .matches(/^[A-Za-z0-9.@_ -]*$/, getString('cf.featureFlags.tagging.inputErrorMessage'))
              })
            )
            .max(10, getString('cf.featureFlags.tagging.inputErrorMessage'))
        })}
        onSubmit={handleSubmit}
      >
        {({ submitForm, isValid, errors }) => (
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
                {FFM_8184_FEATURE_FLAG_TAGGING && (
                  <>
                    <FormInput.MultiSelect
                      className={css.dropdown}
                      label={getString('tagsLabel')}
                      disabled={tagsDisabled}
                      name="tags"
                      multiSelectProps={{
                        allowCreatingNewItems: true,
                        placeholder: getString('tagsLabel')
                      }}
                      items={tagsData}
                    />
                    {errors.tags && (
                      <FormError name="tags" errorMessage={getString('cf.featureFlags.tagging.inputErrorMessage')} />
                    )}
                  </>
                )}
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
  }, [featureFlag, gitSync?.isAutoCommitEnabled, gitSync?.isGitSyncEnabled, tagsData, tagsDisabled])

  return { openEditDetailsModal, hideEditDetailsModal }
}

export default useEditFlagDetailsModal
