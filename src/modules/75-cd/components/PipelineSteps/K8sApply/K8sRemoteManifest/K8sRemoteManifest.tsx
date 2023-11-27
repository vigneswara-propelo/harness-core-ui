import React, { useCallback, useState } from 'react'
import { get, noop, defaultTo } from 'lodash-es'
import { Dialog, IDialogProps, Classes, Intent, FormGroup } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { connect } from 'formik'
import { v4 as uuid } from 'uuid'

import { Layout, Text, StepWizard, StepProps, Button, Label, ButtonVariation, FormError } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import type { IconProps } from '@harness/icons'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig } from 'services/cd-ng'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { errorCheck } from '@common/utils/formikHelpers'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ConnectorDetailsStep from '@platform/connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import GitDetailsStep from '@platform/connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import ConnectorTestConnection from '@platform/connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import StepGitAuthentication from '@platform/connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'

import StepGithubAuthentication from '@platform/connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@platform/connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import StepGitlabAuthentication from '@platform/connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@platform/connectors/constants'
import { getManifestTypeToSelect } from '@pipeline/components/ManifestSelection/ManifestListView/ManifestListView'

import DelegateSelectorStep from '@platform/connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { useGetLastStepConnectorValue } from '@pipeline/hooks/useGetLastStepConnectorValue'
import { ManifestWizard } from '@pipeline/components/ManifestSelection/ManifestWizard/ManifestWizard'

import {
  ManifestDataType,
  ManifestToConnectorMap,
  manifestTypeIcons,
  manifestTypeLabels,
  getBuildPayload,
  getManifestStoresByDeploymentType
} from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ConnectorRefLabelType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type {
  ManifestStepInitData,
  ManifestTypes,
  ManifestLastStepProps,
  ManifestStores
} from '@pipeline/components/ManifestSelection/ManifestInterface'

import { getConnectorPath } from '@pipeline/components/ManifestSelection/ManifestWizardSteps/ManifestUtils'

import { K8sRemoteFile } from './K8sRemote'
import type { K8sApplyManifestProps } from '../K8sInterface'

import css from '@pipeline/components/ManifestSelection/ManifestSelection.module.scss'

export const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}

function SelectRemoteManifest({
  connectors,
  isReadonly,
  allowableTypes,
  preSelectedManifestType = ManifestDataType.K8sManifest,
  availableManifestTypes = [],
  formik,
  onSubmit,
  name,
  expressions
}: K8sApplyManifestProps): JSX.Element {
  const [selectedManifest, setSelectedManifest] = useState<ManifestTypes | null>(ManifestDataType.K8sManifest)
  const [connectorView, setConnectorView] = useState(false)
  const [manifestStore, setManifestStore] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const initValues = get(formik.values, 'spec', null)
  const manifestSource = initValues?.manifestSource
  const manifestSourceSpec = manifestSource?.spec
  const manifestSourceSpecStore = manifestSourceSpec?.store
  const manifestSourceStoreSpec = manifestSourceSpecStore?.spec
  const manifestSourceStoreType = manifestSourceSpecStore?.type

  const { CDS_SERVERLESS_V2 } = useFeatureFlags()

  const addNewManifest = (): void => {
    setSelectedManifest(getManifestTypeToSelect(availableManifestTypes, preSelectedManifestType))
    showConnectorModal()
  }

  const getLastStepInitialData = (): ManifestConfig => {
    if (
      (initValues?.type && initValues?.type !== selectedManifest) ||
      get(initValues, 'spec.store.type') !== manifestStore
    ) {
      return null as unknown as ManifestConfig
    }
    return initValues as ManifestConfig
  }

  const getInitialValues = (): ManifestStepInitData => {
    if (initValues) {
      const values = {
        ...initValues,
        store: manifestSourceStoreType,
        connectorRef: manifestSourceStoreSpec?.connectorRef,
        selectedManifest: ManifestDataType.K8sManifest,
        manifestSource: {
          type: get(formik.values, 'spec.manifestSource.type', null),
          spec: {
            valuesPaths: defaultTo(get(manifestSourceSpec, 'valuesPaths'), []),
            store: {
              type: manifestStore || manifestSourceStoreType,
              spec: {
                connectorRef: getConnectorPath(manifestSourceStoreType, manifestSource),
                ...manifestSourceStoreSpec
              }
            }
          }
        }
      }
      return values
    }
    /* istanbul ignore next */
    return {
      store: manifestStore,
      connectorRef: undefined,
      selectedManifest: ManifestDataType.K8sManifest,
      selectedType: '',
      manifestSource: {
        type: get(formik.values, 'manifestSource.type', null),
        spec: {
          valuesPaths: [],
          store: {
            type: manifestStore,
            spec: {
              connectorRef: '',
              gitFetchType: '',
              paths: [{ value: '', id: uuid() }]
            }
          }
        }
      }
    }
  }

  const handleSubmit = (): void => {
    hideConnectorModal()
    setConnectorView(false)
    setSelectedManifest(null)
    setManifestStore('')
  }

  const changeManifestType = (selectedManifestType: ManifestTypes | null): void => {
    setSelectedManifest(selectedManifestType)
  }
  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }
  const handleStoreChange = (store?: ManifestStores): void => {
    setManifestStore(store || '')
  }

  const initialValues = getLastStepInitialData()
  const initialConnectorRef = getConnectorPath(initialValues?.spec?.store?.type, initialValues)

  const { selectedConnector } = useGetLastStepConnectorValue({
    initialConnectorRef,
    isEditMode: false,
    connectorList: connectors?.content
  })

  const lastStepProps = useCallback((): ManifestLastStepProps => {
    const manifestDetailsProps: ManifestLastStepProps = {
      key: getString('pipeline.manifestType.manifestDetails'),
      name: getString('pipeline.manifestType.manifestDetails'),
      expressions,
      allowableTypes,
      stepName: getString('pipeline.manifestType.manifestDetails'),
      initialValues,
      handleSubmit: handleSubmit,
      selectedManifest,
      manifestIdsList: [''],
      isReadonly: isReadonly
    }

    return manifestDetailsProps
  }, [selectedManifest, manifestStore, getLastStepInitialData, formik])

  const prevStepProps = useCallback((): { editManifestModePrevStepData: ConnectorConfigDTO } => {
    return {
      /* istanbul ignore next */
      editManifestModePrevStepData: {
        ...initialValues?.spec.store.spec,
        selectedManifest: initialValues?.type,
        store: initialValues?.spec.store.type,
        connectorRef: selectedConnector,
        manifestSource: {}
      }
    }
  }, [initialValues, selectedConnector])

  const getLabels = (): ConnectorRefLabelType => {
    return {
      firstStepName: getString('pipeline.manifestType.specifyManifestRepoType'),
      secondStepName: `${getString('common.specify')} ${
        selectedManifest && getString(manifestTypeLabels[selectedManifest])
      } ${getString('store')}`
    }
  }

  const getIconProps = (): IconProps => {
    const iconProps: IconProps = {
      name: manifestTypeIcons[selectedManifest as ManifestTypes]
    }
    return iconProps
  }

  const lastSteps = (): Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> => {
    const arr: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> = []
    const manifestDetailStep = (
      <K8sRemoteFile
        {...lastStepProps()}
        {...prevStepProps()}
        allowableTypes={allowableTypes}
        onSubmitCallBack={data => {
          onSubmit(data as ManifestStepInitData)
          onClose()
        }}
        fieldPath="manifestSource.spec"
        isReadonly={!!isReadonly}
      />
    )

    arr.push(manifestDetailStep)
    return arr
  }

  const connectorDetailStepProps = {
    type: ManifestToConnectorMap[manifestStore],
    name: getString('overview'),
    isEditMode,
    gitDetails: { repoIdentifier, branch, getDefaultFromOtherRepo: true }
  }
  const delegateSelectorStepProps = {
    name: getString('delegate.DelegateselectionLabel'),
    isEditMode,
    setIsEditMode,
    connectorInfo: undefined
  }
  const ConnectorTestConnectionProps = {
    name: getString('platform.connectors.stepThreeName'),
    connectorInfo: undefined,
    isStep: true,
    isLastStep: false,
    type: ManifestToConnectorMap[manifestStore]
  }
  const gitTypeStoreAuthenticationProps = {
    name: getString('credentials'),
    isEditMode,
    setIsEditMode,
    accountId,
    orgIdentifier,
    projectIdentifier,
    connectorInfo: undefined,
    onConnectorCreated: noop
  }
  const authenticationStepProps = {
    ...gitTypeStoreAuthenticationProps,
    identifier: CONNECTOR_CREDENTIALS_STEP_IDENTIFIER
  }

  const getNewConnectorSteps = useCallback((): JSX.Element => {
    const buildPayload = getBuildPayload(ManifestToConnectorMap[manifestStore])
    return (
      <StepWizard title={getString('platform.connectors.createNewConnector')}>
        <ConnectorDetailsStep {...connectorDetailStepProps} />
        <GitDetailsStep
          type={ManifestToConnectorMap[manifestStore]}
          name={getString('details')}
          isEditMode={isEditMode}
          connectorInfo={undefined}
        />
        {ManifestToConnectorMap[manifestStore] === Connectors.GIT ? (
          <StepGitAuthentication {...gitTypeStoreAuthenticationProps} />
        ) : null}
        {ManifestToConnectorMap[manifestStore] === Connectors.GITHUB ? (
          <StepGithubAuthentication {...gitTypeStoreAuthenticationProps} />
        ) : null}
        {ManifestToConnectorMap[manifestStore] === Connectors.BITBUCKET ? (
          <StepBitbucketAuthentication {...gitTypeStoreAuthenticationProps} />
        ) : null}
        {ManifestToConnectorMap[manifestStore] === Connectors.GITLAB ? (
          <StepGitlabAuthentication {...authenticationStepProps} />
        ) : null}
        <DelegateSelectorStep {...delegateSelectorStepProps} buildPayload={buildPayload} />
        <ConnectorTestConnection {...ConnectorTestConnectionProps} />
      </StepWizard>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorView, manifestStore, isEditMode])

  const [showConnectorModal, hideConnectorModal] = useModalHook(() => {
    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS} className={cx(css.modal, Classes.DIALOG)}>
        <div className={css.createConnectorWizard}>
          <ManifestWizard
            types={[ManifestDataType.K8sManifest]}
            manifestStoreTypes={getManifestStoresByDeploymentType('Kubernetes', 'K8sManifest', {
              CDS_SERVERLESS_V2
            }).filter((store: ManifestStores) => store !== 'CustomRemote')}
            labels={getLabels()}
            selectedManifest={selectedManifest}
            newConnectorView={connectorView}
            expressions={expressions}
            allowableTypes={allowableTypes}
            changeManifestType={changeManifestType}
            handleConnectorViewChange={handleConnectorViewChange}
            handleStoreChange={handleStoreChange}
            initialValues={getInitialValues()}
            newConnectorSteps={getNewConnectorSteps()}
            lastSteps={lastSteps()}
            iconsProps={getIconProps()}
            isReadonly={!!isReadonly}
          />
        </div>
        <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [
    selectedManifest,
    connectorView,
    manifestStore,
    expressions,
    allowableTypes,
    lastSteps,
    CDS_SERVERLESS_V2,
    formik
  ])
  /* istanbul ignore next */
  const onClose = (): void => {
    setConnectorView(false)
    hideConnectorModal()
    setManifestStore('')
    setIsEditMode(false)
    setSelectedManifest(null)
  }

  const ManifestType = defaultTo(get(getInitialValues(), 'manifestSource.type'), null)

  const error = get(formik?.errors, name)
  const hasError = errorCheck(name, formik) && typeof error === 'string'
  const showError = hasError
  const intent = showError ? Intent.DANGER : Intent.NONE
  const helperText = showError ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null

  return (
    <FormGroup intent={intent} helperText={helperText}>
      <Layout.Vertical width={430} margin={{ bottom: 'medium' }}>
        <Label style={{ color: Color.GREY_900 }} className={css.configLabel} data-tooltip-id="k8s-apply-remote">
          {getString('cd.configurationFile')}
        </Label>
        <div className={cx(css.configFile)}>
          <div className={css.configField}>
            {!ManifestType ? (
              <a
                data-testid="editConfigButton"
                className={css.configPlaceHolder}
                data-name="config-edit"
                onClick={addNewManifest}
              >
                {getString('cd.manifestSelectPlaceHolder')}
              </a>
            ) : (
              <Text font="normal" lineClamp={1} width={200}>
                /{ManifestType}
              </Text>
            )}

            <Button
              minimal
              icon="Edit"
              withoutBoxShadow
              iconProps={{ size: 16 }}
              onClick={addNewManifest}
              data-name="config-edit"
              withoutCurrentColor={true}
              className={css.editBtn}
              variation={ButtonVariation.LINK}
            />
          </div>
        </div>
      </Layout.Vertical>
    </FormGroup>
  )
}
export default connect(SelectRemoteManifest)
