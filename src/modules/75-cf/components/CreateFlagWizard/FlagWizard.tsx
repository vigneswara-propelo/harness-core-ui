/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { StepWizard, SelectOption, ModalErrorHandlerBinding } from '@harness/uicore'
import {
  useCreateFeatureFlag,
  FeatureFlagRequestRequestBody,
  CreateFeatureFlagQueryParams,
  GitSyncErrorResponse,
  usePatchFeature,
  Tag
} from 'services/cf'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import { getIdentifierFromName } from '@common/utils/StringUtils'
import { getErrorMessage, showToaster, FeatureFlagMutivariateKind } from '@cf/utils/CFUtils'
import { PageSpinner } from '@common/components'
import { GIT_SYNC_ERROR_CODE, useGitSync } from '@cf/hooks/useGitSync'
import { useGovernance } from '@cf/hooks/useGovernance'
import { GIT_COMMIT_MESSAGES } from '@cf/constants/GitSyncConstants'
import FlagElemAbout from './FlagElemAbout'
import FlagElemBoolean from './FlagElemBoolean'
import FlagElemMultivariate from './FlagElemMultivariate'
import { FlagTypeVariations } from '../CreateFlagDialog/FlagDialogUtils'
import SaveFlagRepoStep from './SaveFlagRepoStep'
import patch from '../../utils/instructions'
import css from './FlagWizard.module.scss'

export interface FlagWizardProps {
  flagTypeView: string
  tags?: Tag[]
  tagsError?: unknown
  environmentIdentifier: string
  jiraIssueKey?: string
  toggleFlagType: (newFlag: string) => void
  hideModal: () => void
  goBackToTypeSelections: () => void
}

export interface FlagWizardFormValues extends FeatureFlagRequestRequestBody {
  autoCommit: boolean
}

interface TagDropdownFormValues {
  label: string
  value: string
}

const FlagWizard: FC<FlagWizardProps> = props => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { currentUserInfo } = useAppStore()

  const flagTypeOptions: SelectOption[] = [
    { label: getString('cf.boolean'), value: FlagTypeVariations.booleanFlag },
    { label: getString('cf.multivariate'), value: FeatureFlagMutivariateKind.string }
  ]

  const {
    flagTypeView,
    environmentIdentifier,
    tags = [],
    tagsError = null,
    toggleFlagType,
    hideModal,
    goBackToTypeSelections
  } = props

  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()

  const history = useHistory()
  const { handleError: handleGovernanceError, isGovernanceError } = useGovernance()

  const { isAutoCommitEnabled, isGitSyncEnabled, gitSyncLoading, handleAutoCommit, getGitSyncFormMeta, handleError } =
    useGitSync()
  const { gitSyncInitialValues } = getGitSyncFormMeta(GIT_COMMIT_MESSAGES.CREATED_FLAG)

  const { mutate: createFeatureFlag, loading: isLoadingCreateFeatureFlag } = useCreateFeatureFlag({
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      environmentIdentifier
    } as CreateFeatureFlagQueryParams
  })

  const { mutate } = usePatchFeature({
    identifier: '',
    queryParams: {
      projectIdentifier,
      environmentIdentifier,
      accountIdentifier,
      orgIdentifier
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function sanitizeTagArray(tagVals: any): Tag[] {
    // if object has label and value, rename to name and identifier
    return tagVals.map((tag: TagDropdownFormValues) => ({
      name: tag.label,
      identifier: getIdentifierFromName(tag.value)
    }))
  }

  const onWizardSubmit = async (formData: FlagWizardFormValues | undefined): Promise<void> => {
    modalErrorHandler?.hide()
    if (formData) {
      const valTags = sanitizeTagArray(formData.tags)
      formData.tags = valTags

      // Note: Currently there's no official way to get current user. Rely on old token from
      // current gen login
      formData.owner = currentUserInfo.email || 'unknown'
      formData.project = projectIdentifier

      if (isAutoCommitEnabled) {
        formData.gitDetails = gitSyncInitialValues.gitDetails
      }
    }

    const checkJiraIssue = (jiraIssueKey: string): Promise<void> => {
      return new Promise(resolve => {
        patch.feature.addInstruction({
          kind: 'addJiraIssueToFlag',
          parameters: {
            issueKey: jiraIssueKey
          }
        })
        patch.feature.onPatchAvailable(async instructions => {
          try {
            await mutate(instructions, {
              pathParams: {
                identifier: formData?.identifier as string
              },
              queryParams: {
                projectIdentifier,
                environmentIdentifier,
                accountIdentifier,
                orgIdentifier
              }
            })
            // We don't want to stop the flow if the Jira Issue wasn't created so show error and resolve regardless
          } catch (error) {
            showError(getErrorMessage(error), 0, 'cf.featureFlags.jira.errorMessage')
          } finally {
            resolve()
          }
        })
      })
    }

    if (formData) {
      try {
        const response = await createFeatureFlag(formData)

        if (!isAutoCommitEnabled && formData.autoCommit) {
          await handleAutoCommit(formData.autoCommit)
        }

        // if we have received a Jira Issue key in URL, we assume the user came from Jira
        if (props.jiraIssueKey) {
          await checkJiraIssue(props.jiraIssueKey)
        }

        hideModal()
        history.push({
          pathname: routes.toCFFeatureFlagsDetail({
            orgIdentifier: orgIdentifier as string,
            projectIdentifier: projectIdentifier as string,
            featureFlagIdentifier: formData.identifier,
            accountId: accountIdentifier
          }),
          search: `?activeEnvironment=${environmentIdentifier}`,
          state: {
            governanceMetadata: response?.details?.governanceMetadata
          }
        })
        showToaster(getString('cf.messages.flagCreated'))
      } catch (error: any) {
        if (error.status === GIT_SYNC_ERROR_CODE) {
          handleError(error.data as GitSyncErrorResponse)
        } else {
          if (isGovernanceError(error.data)) {
            handleGovernanceError(error.data)
          } else {
            showError(getErrorMessage(error), 0, 'cf.savegw.error')
          }
        }
      }
    } else {
      hideModal()
    }
  }

  return (
    <StepWizard className={css.flagWizardContainer} onCompleteWizard={onWizardSubmit}>
      {gitSyncLoading ? <PageSpinner /> : null}

      <FlagElemAbout
        name={getString('cf.creationModal.aboutFlag.aboutFlagHeading')}
        goBackToTypeSelections={goBackToTypeSelections}
        tags={tags}
        tagsError={tagsError}
      />
      {flagTypeView === FlagTypeVariations.booleanFlag ? (
        <FlagElemBoolean
          name={getString('cf.creationModal.variationSettingsHeading')}
          toggleFlagType={toggleFlagType}
          flagTypeOptions={flagTypeOptions}
          setModalErrorHandler={setModalErrorHandler}
          isLoadingCreateFeatureFlag={isLoadingCreateFeatureFlag}
        />
      ) : (
        <FlagElemMultivariate
          name={getString('cf.creationModal.variationSettingsHeading')}
          toggleFlagType={toggleFlagType}
          flagTypeOptions={flagTypeOptions}
          setModalErrorHandler={setModalErrorHandler}
          isLoadingCreateFeatureFlag={isLoadingCreateFeatureFlag}
        />
      )}

      {isGitSyncEnabled && !isAutoCommitEnabled ? (
        <SaveFlagRepoStep
          name={getString('common.gitSync.gitRepositoryDetails')}
          isLoadingCreateFeatureFlag={isLoadingCreateFeatureFlag}
        />
      ) : null}
    </StepWizard>
  )
}

export default FlagWizard
