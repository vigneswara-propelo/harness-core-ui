import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { StepWizard, SelectOption, ModalErrorHandlerBinding } from '@wings-software/uicore'
import { useCreateFeatureFlag, FeatureFlagRequestRequestBody } from 'services/cf'
import AppStorage from 'framework/utils/AppStorage'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/exports'
import { getErrorMessage } from '@cf/utils/CFUtils'
import FlagElemAbout from './FlagElemAbout'
import FlagElemBoolean from './FlagElemBoolean'
import FlagElemMultivariate from './FlagElemMultivariate'
import FlagElemTest from './FlagElemTest'
import { FlagTypeVariations, FlagTypeVariationsSelect } from '../CreateFlagDialog/FlagDialogUtils'
import css from './FlagWizard.module.scss'

interface FlagWizardProps {
  flagTypeView: string
  environmentIdentifier: string
  toggleFlagType: (newFlag: string) => void
  hideModal: () => void
  goBackToTypeSelections: () => void
}

const FlagWizard: React.FC<FlagWizardProps> = props => {
  const { getString } = useStrings()
  const flagTypeOptions: SelectOption[] = [
    { label: getString('cf.boolean'), value: FlagTypeVariations.booleanFlag },
    { label: getString('cf.multivariate'), value: FlagTypeVariationsSelect.string }
  ]
  const { flagTypeView, environmentIdentifier, toggleFlagType, hideModal, goBackToTypeSelections } = props
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { showError } = useToaster()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const history = useHistory()
  const { mutate: createFeatureFlag, loading: isLoadingCreateFeatureFlag } = useCreateFeatureFlag({
    queryParams: { account: accountId, org: orgIdentifier }
  })
  const onWizardStepSubmit = (formData: FeatureFlagRequestRequestBody | undefined): void => {
    modalErrorHandler?.hide()

    if (formData) {
      const valTags: any = formData?.tags?.map(elem => {
        return { name: elem, value: elem }
      })
      formData.tags = valTags
      // Note: Currently there's no official way to get current user. Rely on old token from
      // current gen login
      formData.owner = AppStorage.decode64(localStorage.email || 'unknown')
    }

    if (formData) {
      createFeatureFlag(formData)
        .then(() => {
          hideModal()
          history.push(
            routes.toCFFeatureFlagsDetail({
              orgIdentifier: orgIdentifier as string,
              projectIdentifier: projectIdentifier as string,
              featureFlagIdentifier: formData.identifier,
              environmentIdentifier,
              accountId
            })
          )
        })
        .catch(error => {
          showError(getErrorMessage(error), 0)
        })
    } else {
      hideModal()
    }
  }

  return (
    <StepWizard className={css.flagWizardContainer} onCompleteWizard={onWizardStepSubmit}>
      <FlagElemAbout
        name={getString('cf.creationModal.aboutFlag.aboutFlagHeading')}
        goBackToTypeSelections={goBackToTypeSelections}
      />
      {flagTypeView === FlagTypeVariations.booleanFlag ? (
        <FlagElemBoolean
          name={getString('cf.creationModal.variationSettingsHeading')}
          toggleFlagType={toggleFlagType}
          flagTypeOptions={flagTypeOptions}
          onWizardStepSubmit={onWizardStepSubmit}
          projectIdentifier={projectIdentifier}
          setModalErrorHandler={setModalErrorHandler}
          isLoadingCreateFeatureFlag={isLoadingCreateFeatureFlag}
        />
      ) : (
        <FlagElemMultivariate
          name={getString('cf.creationModal.variationSettingsHeading')}
          toggleFlagType={toggleFlagType}
          flagTypeOptions={flagTypeOptions}
          onWizardStepSubmit={onWizardStepSubmit}
          projectIdentifier={projectIdentifier}
          setModalErrorHandler={setModalErrorHandler}
          isLoadingCreateFeatureFlag={isLoadingCreateFeatureFlag}
        />
      )}
      <FlagElemTest name={getString('cf.testTheFlag.testFlagHeading')} fromWizard={true} hideModal={hideModal} />
    </StepWizard>
  )
}

export default FlagWizard
