/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { get, isEmpty, noop, isArray } from 'lodash-es'
import { Dialog, Classes } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  Layout,
  Text,
  Icon,
  StepWizard,
  StepProps,
  Button,
  ButtonSize,
  ButtonVariation,
  Container
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { FontVariation, Color } from '@harness/design-system'
import type { IconProps } from '@harness/icons'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { ManifestActions } from '@common/constants/TrackingConstants'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import StepHelmAuth from '@connectors/components/CreateConnector/HelmRepoConnector/StepHelmRepoAuth'
import StepAWSAuthentication from '@connectors/components/CreateConnector/AWSConnector/StepAuth/StepAWSAuthentication'
import StepGithubAuthentication from '@connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import StepGitlabAuthentication from '@connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import {
  buildAWSPayload,
  buildGcpPayload,
  buildHelmPayload,
  buildOCIHelmPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import GcpAuthentication from '@connectors/components/CreateConnector/GcpConnector/StepAuth/GcpAuthentication'
import useFileStoreModal from '@filestore/components/FileStoreComponent/FileStoreComponent'
import { FileUsage } from '@filestore/interfaces/FileStore'
import { useGetLastStepConnectorValue } from '@pipeline/hooks/useGetLastStepConnectorValue'
import { ManifestWizard } from '../ManifestWizard/ManifestWizard'
import { getStatus, getConnectorNameFromValue } from '../../PipelineStudio/StageBuilder/StageBuilderUtil'
import { useVariablesExpression } from '../../PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  ManifestDataType,
  ManifestToConnectorMap,
  ManifestStoreMap,
  manifestTypeIcons,
  manifestTypeLabels,
  ManifestToPathKeyMap,
  getManifestLocation,
  showAddManifestBtn,
  getBuildPayload,
  isGitTypeManifestStore,
  ManifestToPathMap,
  isECSTypeManifest,
  TASManifestAllowedPaths,
  TASManifestTypes,
  getManifestStoresByDeploymentType,
  allowedMultiManifestTypes,
  MultiManifestsTypes,
  filterManifestByType,
  enableMultipleManifest
} from '../Manifesthelper'
import type { ConnectorRefLabelType } from '../../ArtifactsSelection/ArtifactInterface'
import type {
  ManifestStepInitData,
  ManifestTypes,
  ManifestListViewProps,
  ManifestLastStepProps,
  ManifestStores,
  PrimaryManifestType,
  ServerlessLambdaManifestLastStepPrevStepData,
  ServerlessLambdaWithS3ManifestLastStepPrevStepData,
  HelmWithGITManifestLastStepPrevStepData,
  HelmWithHTTPManifestLastStepPrevStepData,
  HelmWithOCIManifestLastStepPrevStepData,
  HelmWithS3ManifestLastStepPrevStepData,
  ECSWithS3ManifestLastStepPrevStepData,
  HelmWithGcsManifestLastStepPrevStepData,
  HelmWithHarnessStoreManifestLastStepPrevStepData,
  OpenShiftTemplateGITManifestLastStepPrevStepData,
  KustomizeWithGITManifestLastStepPrevStepData,
  KustomizeWithHarnessStoreManifestLastStepPrevStepData,
  OpenShiftParamManifestLastStepPrevStepData,
  KustomizePatchManifestLastStepPrevStepData,
  InheritFromManifestLastStepPrevStepData,
  TASWithHarnessStoreManifestLastStepPrevStepData,
  HarnessFileStoreManifestLastStepPrevStepData,
  CustomRemoteManifestManifestLastStepPrevStepData,
  CommonManifestLastStepPrevStepData,
  TASManifestLastStepPrevStepData,
  AwsSamDirectoryManifestLastStepPrevStepData
} from '../ManifestInterface'
import K8sValuesManifest from '../ManifestWizardSteps/K8sValuesManifest/K8sValuesManifest'
import HelmWithGIT from '../ManifestWizardSteps/HelmWithGIT/HelmWithGIT'
import HelmWithHttp from '../ManifestWizardSteps/HelmWithHttp/HelmWithHttp'
import OpenShiftTemplateWithGit from '../ManifestWizardSteps/OSTemplateWithGit/OSTemplateWithGit'
import HelmWithGcs from '../ManifestWizardSteps/HelmWithGcs/HelmWithGcs'
import HelmWithS3 from '../ManifestWizardSteps/HelmWithS3/HelmWithS3'
import KustomizeWithGIT from '../ManifestWizardSteps/KustomizeWithGIT/KustomizeWithGIT'
import OpenShiftParamWithGit from '../ManifestWizardSteps/OpenShiftParam/OSWithGit'
import KustomizePatchDetails from '../ManifestWizardSteps/KustomizePatchesDetails/KustomizePatchesDetails'
import ServerlessAwsLambdaManifest from '../ManifestWizardSteps/ServerlessAwsLambdaManifest/ServerlessAwsLambdaManifest'
import CustomRemoteManifest from '../ManifestWizardSteps/CustomRemoteManifest/CustomRemoteManifest'
import AttachPathYamlFlow from './AttachPathYamlFlow'
import InheritFromManifest from '../ManifestWizardSteps/InheritFromManifest/InheritFromManifest'
import ConnectorField from './ConnectorField'
import HelmWithOCI from '../ManifestWizardSteps/HelmWithOCI/HelmWithOCI'
import { getConnectorPath, getListOfDisabledManifestTypes } from '../ManifestWizardSteps/ManifestUtils'
import HarnessFileStore from '../ManifestWizardSteps/HarnessFileStore/HarnessFileStore'
import KustomizeWithHarnessStore from '../ManifestWizardSteps/KustomizeWithHarnessStore/KustomizeWithHarnessStore'
import { CommonManifestDetails } from '../ManifestWizardSteps/CommonManifestDetails/CommonManifestDetails'
import HelmWithHarnessStore from '../ManifestWizardSteps/HelmWithHarnessStore/HelmWithHarnessStore'
import { ECSWithS3 } from '../ManifestWizardSteps/ECSWithS3/ECSWithS3'
import { ServerlessLambdaWithS3 } from '../ManifestWizardSteps/ServerlessLambdaWithS3/ServerlessLambdaWithS3'
import TasManifest from '../ManifestWizardSteps/TasManifest/TasManifest'
import TASWithHarnessStore from '../ManifestWizardSteps/TASWithHarnessStore/TASWithHarnessStore'
import { AwsSamDirectoryManifest } from '../ManifestWizardSteps/AwsSamDirectoryManifest/AwsSamDirectoryManifest'
import { LocationValue } from '../../ConfigFilesSelection/ConfigFilesListView/LocationValue'
import ManifestMultiAttach from './ManifestMultiAttach'
import { DIALOG_PROPS, getManifestTypeToSelect } from './ManifestListView'
import css from '../ManifestSelection.module.scss'
import cssMulti from './ManifestListViewMultiple.module.scss'

function ManifestListViewMultiple({
  connectors,
  listOfManifests,
  deploymentType,
  isReadonly,
  allowableTypes,
  updateManifestList,
  removeManifestConfig,
  attachPathYaml,
  removeValuesYaml,
  allowOnlyOneManifest = false,
  addManifestBtnText,
  preSelectedManifestType,
  availableManifestTypes
}: ManifestListViewProps): JSX.Element {
  const [selectedManifest, setSelectedManifest] = useState<ManifestTypes | null>(null)
  const [connectorView, setConnectorView] = useState(false)
  const [manifestStore, setManifestStore] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [manifestIndex, setEditIndex] = useState(0)
  const [isManifestEditMode, setIsManifestEditMode] = useState(manifestIndex < listOfManifests.length)
  const { trackEvent } = useTelemetry()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [multiManifestType, setMultiManifestType] = useState<MultiManifestsTypes>(MultiManifestsTypes.MANIFESTS)

  useEffect(() => {
    setIsManifestEditMode(manifestIndex < listOfManifests.length)
  }, [listOfManifests, listOfManifests.length, manifestIndex])

  const addNewManifest = (typeManifestMulti: MultiManifestsTypes): void => {
    setMultiManifestType(typeManifestMulti)
    setEditIndex(listOfManifests.length)
    setSelectedManifest(getManifestTypeToSelect(availableManifestTypes, preSelectedManifestType))
    showConnectorModal()
  }

  const FileStoreModal = useFileStoreModal({
    isReadonly: true,
    fileUsage: FileUsage.MANIFEST_FILE
  })

  const editManifest = (manifestType: ManifestTypes, store: ManifestStores, index: number): void => {
    setSelectedManifest(manifestType)
    setManifestStore(store)
    setConnectorView(false)
    setEditIndex(index)
    showConnectorModal()
  }

  const getLastStepInitialData = (): ManifestConfig => {
    const initValues = get(listOfManifests[manifestIndex], 'manifest', null)
    if (
      (initValues?.type && initValues?.type !== selectedManifest) ||
      get(initValues, 'spec.store.type') !== manifestStore
    ) {
      return null as unknown as ManifestConfig
    }
    return initValues as ManifestConfig
  }

  const getInitialValues = (): ManifestStepInitData => {
    const initValues = get(listOfManifests[manifestIndex], 'manifest.spec.store.spec', null)

    if (initValues) {
      const values = {
        ...initValues,
        store: listOfManifests[manifestIndex]?.manifest?.spec?.store?.type,
        connectorRef: getConnectorPath(
          listOfManifests[manifestIndex]?.manifest?.spec?.store?.type,
          listOfManifests[manifestIndex].manifest
        ),
        selectedManifest: get(listOfManifests[manifestIndex], 'manifest.type', null)
      }
      return values
    }
    return {
      store: manifestStore,
      connectorRef: undefined,
      selectedManifest: selectedManifest
    }
  }

  const handleSubmit = (manifestObj: ManifestConfigWrapper): void => {
    const isNewManifest = manifestIndex === listOfManifests.length
    updateManifestList(manifestObj, manifestIndex)
    trackEvent(
      isNewManifest ? ManifestActions.SaveManifestOnPipelinePage : ManifestActions.UpdateManifestOnPipelinePage,
      {
        manifest: manifestObj?.manifest?.type || selectedManifest || '',
        storeType: manifestObj?.manifest?.spec?.store?.type || ''
      }
    )
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
    isEditMode: isManifestEditMode,
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
      manifestIdsList: listOfManifests.map((item: ManifestConfigWrapper) => item.manifest?.identifier as string),
      isReadonly: isReadonly
    }
    if (selectedManifest === ManifestDataType.HelmChart) {
      manifestDetailsProps.deploymentType = deploymentType
    }
    return manifestDetailsProps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManifest, manifestStore, getLastStepInitialData])

  const prevStepProps = useCallback((): { editManifestModePrevStepData: ConnectorConfigDTO } => {
    return {
      editManifestModePrevStepData: {
        ...initialValues?.spec.store.spec,
        selectedManifest: initialValues?.type,
        store: initialValues?.spec.store.type,
        connectorRef: selectedConnector
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
    if (
      selectedManifest &&
      [
        ManifestDataType.HelmChart,
        ManifestDataType.TasManifest,
        ManifestDataType.TasVars,
        ManifestDataType.TasAutoScaler
      ].includes(selectedManifest)
    ) {
      iconProps.color = Color.WHITE
    }
    return iconProps
  }

  const shouldPassPrevStepData = (): boolean => {
    return isManifestEditMode && !!selectedConnector
  }

  const lastSteps = React.useMemo((): Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> => {
    const arr: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> = []
    let manifestDetailStep = null
    const isGitTypeStores = isGitTypeManifestStore(manifestStore as ManifestStores)

    switch (true) {
      case selectedManifest === ManifestDataType.HelmChart && isGitTypeStores:
        manifestDetailStep = (
          <HelmWithGIT
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as HelmWithGITManifestLastStepPrevStepData)}
          />
        )
        break
      case selectedManifest === ManifestDataType.HelmChart && manifestStore === ManifestStoreMap.Http:
        manifestDetailStep = (
          <HelmWithHttp
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as HelmWithHTTPManifestLastStepPrevStepData)}
          />
        )
        break
      case selectedManifest === ManifestDataType.HelmChart && manifestStore === ManifestStoreMap.OciHelmChart:
        manifestDetailStep = (
          <HelmWithOCI
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as HelmWithOCIManifestLastStepPrevStepData)}
          />
        )
        break
      case selectedManifest === ManifestDataType.HelmChart && manifestStore === ManifestStoreMap.S3:
        manifestDetailStep = (
          <HelmWithS3
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as HelmWithS3ManifestLastStepPrevStepData)}
          />
        )
        break
      case isECSTypeManifest(selectedManifest as ManifestTypes) && manifestStore === ManifestStoreMap.S3:
        manifestDetailStep = (
          <ECSWithS3
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as ECSWithS3ManifestLastStepPrevStepData)}
          />
        )
        break
      case selectedManifest === ManifestDataType.HelmChart && manifestStore === ManifestStoreMap.Gcs:
        manifestDetailStep = (
          <HelmWithGcs
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as HelmWithGcsManifestLastStepPrevStepData)}
          />
        )
        break
      case selectedManifest === ManifestDataType.HelmChart && manifestStore === ManifestStoreMap.Harness:
        manifestDetailStep = (
          <HelmWithHarnessStore
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as HelmWithHarnessStoreManifestLastStepPrevStepData)}
          />
        )
        break
      case selectedManifest === ManifestDataType.OpenshiftTemplate && isGitTypeStores:
        manifestDetailStep = (
          <OpenShiftTemplateWithGit
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as OpenShiftTemplateGITManifestLastStepPrevStepData)}
          />
        )
        break
      case selectedManifest === ManifestDataType.Kustomize && isGitTypeStores:
        manifestDetailStep = (
          <KustomizeWithGIT
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as KustomizeWithGITManifestLastStepPrevStepData)}
          />
        )
        break
      case selectedManifest === ManifestDataType.Kustomize && manifestStore === ManifestStoreMap.Harness:
        manifestDetailStep = (
          <KustomizeWithHarnessStore
            {...lastStepProps()}
            {...((shouldPassPrevStepData()
              ? prevStepProps()
              : {}) as KustomizeWithHarnessStoreManifestLastStepPrevStepData)}
          />
        )
        break
      case selectedManifest === ManifestDataType.OpenshiftParam && isGitTypeStores:
        manifestDetailStep = (
          <OpenShiftParamWithGit
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as OpenShiftParamManifestLastStepPrevStepData)}
          />
        )
        break
      case selectedManifest === ManifestDataType.KustomizePatches && isGitTypeStores:
        manifestDetailStep = (
          <KustomizePatchDetails
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as KustomizePatchManifestLastStepPrevStepData)}
          />
        )
        break
      case selectedManifest === ManifestDataType.ServerlessAwsLambda && isGitTypeStores:
        manifestDetailStep = (
          <ServerlessAwsLambdaManifest
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as ServerlessLambdaManifestLastStepPrevStepData)}
          />
        )
        break
      case selectedManifest === ManifestDataType.ServerlessAwsLambda && manifestStore === ManifestStoreMap.S3:
        manifestDetailStep = (
          <ServerlessLambdaWithS3
            {...lastStepProps()}
            {...((shouldPassPrevStepData()
              ? prevStepProps()
              : {}) as ServerlessLambdaWithS3ManifestLastStepPrevStepData)}
          />
        )
        break
      case [ManifestDataType.Values, ManifestDataType.OpenshiftParam, ManifestDataType.KustomizePatches].includes(
        selectedManifest as ManifestTypes
      ) && manifestStore === ManifestStoreMap.InheritFromManifest:
        manifestDetailStep = (
          <InheritFromManifest
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as InheritFromManifestLastStepPrevStepData)}
          />
        )
        break
      case selectedManifest === ManifestDataType.TasManifest && manifestStore === ManifestStoreMap.Harness:
        manifestDetailStep = (
          <TASWithHarnessStore
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as TASWithHarnessStoreManifestLastStepPrevStepData)}
          />
        )
        break
      case manifestStore === ManifestStoreMap.Harness:
        manifestDetailStep = (
          <HarnessFileStore
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as HarnessFileStoreManifestLastStepPrevStepData)}
          />
        )
        break
      case [
        ManifestDataType.K8sManifest,
        ManifestDataType.Values,
        ManifestDataType.HelmChart,
        ManifestDataType.OpenshiftTemplate,
        ManifestDataType.OpenshiftParam,
        ManifestDataType.TasManifest,
        ManifestDataType.TasVars,
        ManifestDataType.TasAutoScaler
      ].includes(selectedManifest as ManifestTypes) && manifestStore === ManifestStoreMap.CustomRemote:
        manifestDetailStep = (
          <CustomRemoteManifest
            {...lastStepProps()}
            {...((isManifestEditMode ? prevStepProps() : {}) as CustomRemoteManifestManifestLastStepPrevStepData)}
          />
        )
        break
      case [ManifestDataType.K8sManifest, ManifestDataType.Values].includes(selectedManifest as ManifestTypes) &&
        isGitTypeStores:
        manifestDetailStep = (
          <K8sValuesManifest
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as CommonManifestLastStepPrevStepData)}
            selectedDeploymentType={deploymentType}
          />
        )
        break
      case selectedManifest === ManifestDataType.TasManifest:
        manifestDetailStep = (
          <TasManifest
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as TASManifestLastStepPrevStepData)}
          />
        )
        break
      case selectedManifest === ManifestDataType.AwsSamDirectory && isGitTypeStores: {
        manifestDetailStep = (
          <AwsSamDirectoryManifest
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as AwsSamDirectoryManifestLastStepPrevStepData)}
          />
        )
        break
      }
      default:
        manifestDetailStep = (
          <CommonManifestDetails
            {...lastStepProps()}
            {...((shouldPassPrevStepData() ? prevStepProps() : {}) as CommonManifestLastStepPrevStepData)}
            selectedDeploymentType={deploymentType}
          />
        )
        break
    }

    arr.push(manifestDetailStep)
    return arr
  }, [manifestStore, selectedManifest, lastStepProps, prevStepProps, isManifestEditMode, deploymentType])

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
    switch (manifestStore) {
      case ManifestStoreMap.Http:
      case ManifestStoreMap.OciHelmChart:
        return (
          <StepWizard title={getString('platform.connectors.createNewConnector')}>
            <ConnectorDetailsStep {...connectorDetailStepProps} />
            <StepHelmAuth {...authenticationStepProps} isOCIHelm={manifestStore === ManifestStoreMap.OciHelmChart} />
            <DelegateSelectorStep
              {...delegateSelectorStepProps}
              buildPayload={manifestStore === ManifestStoreMap.Http ? buildHelmPayload : buildOCIHelmPayload}
            />
            <ConnectorTestConnection {...ConnectorTestConnectionProps} />
          </StepWizard>
        )
      case ManifestStoreMap.S3:
        return (
          <StepWizard iconProps={{ size: 37 }} title={getString('platform.connectors.createNewConnector')}>
            <ConnectorDetailsStep {...connectorDetailStepProps} />
            <StepAWSAuthentication {...authenticationStepProps} />
            <DelegateSelectorStep {...delegateSelectorStepProps} buildPayload={buildAWSPayload} />
            <ConnectorTestConnection {...ConnectorTestConnectionProps} />
          </StepWizard>
        )
      case ManifestStoreMap.Gcs:
        return (
          <StepWizard iconProps={{ size: 37 }} title={getString('platform.connectors.createNewConnector')}>
            <ConnectorDetailsStep {...connectorDetailStepProps} />
            <GcpAuthentication {...authenticationStepProps} />
            <DelegateSelectorStep {...delegateSelectorStepProps} buildPayload={buildGcpPayload} />
            <ConnectorTestConnection {...ConnectorTestConnectionProps} />
          </StepWizard>
        )
      default:
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorView, manifestStore, isEditMode])

  const [showConnectorModal, hideConnectorModal] = useModalHook(() => {
    const onClose = (): void => {
      setConnectorView(false)
      hideConnectorModal()
      setManifestStore('')
      setIsEditMode(false)
      setSelectedManifest(null)
    }
    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS} className={cx(css.modal, Classes.DIALOG)}>
        <div className={css.createConnectorWizard}>
          <ManifestWizard
            types={filterManifestByType(
              listOfManifests,
              allowedMultiManifestTypes[deploymentType]?.[multiManifestType],
              deploymentType,
              multiManifestType
            )}
            manifestStoreTypes={getManifestStoresByDeploymentType(deploymentType, selectedManifest, {})}
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
            lastSteps={lastSteps}
            iconsProps={getIconProps()}
            isReadonly={isReadonly}
            listOfDisabledManifestTypes={getListOfDisabledManifestTypes(listOfManifests)}
            isEditMode={isManifestEditMode}
          />
        </div>
        <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [
    selectedManifest,
    connectorView,
    manifestIndex,
    manifestStore,
    expressions.length,
    expressions,
    allowableTypes,
    isManifestEditMode,
    lastSteps,
    multiManifestType,
    deploymentType,
    listOfManifests
  ])

  const renderConnectorField = useCallback(
    (
      manifestStoreType: ManifestStores,
      connectorRef: string,
      connectorName: string | undefined,
      connectorColor: string
    ): JSX.Element => {
      return (
        <ConnectorField
          manifestStore={manifestStoreType}
          connectorRef={connectorRef}
          connectorName={connectorName}
          connectorColor={connectorColor}
        />
      )
    },
    []
  )

  return (
    <Layout.Vertical style={{ width: '100%' }}>
      <Layout.Vertical spacing="small" style={{ flexShrink: 'initial' }} margin={{ top: 'medium' }}>
        <Layout.Vertical style={{ flexShrink: 'initial' }}>
          <section>
            {listOfManifests
              ?.filter((data: ManifestConfigWrapper) =>
                allowedMultiManifestTypes[deploymentType]?.[MultiManifestsTypes.MANIFESTS].includes(
                  data?.manifest?.type as ManifestTypes
                )
              )
              ?.map((data: ManifestConfigWrapper, index: number) => {
                const manifest = data['manifest']
                const store = manifest?.spec?.store
                const id = manifest?.identifier
                const storeType = store?.type
                const manifestType = manifest?.type
                const { color } = getStatus(getConnectorPath(storeType, manifest), connectors, accountId)
                const connectorName = getConnectorNameFromValue(getConnectorPath(storeType, manifest), connectors)
                const manifestLocation = get(
                  manifest?.spec,
                  getManifestLocation(manifest?.type as ManifestTypes, storeType)
                )
                const values = manifest?.spec[ManifestToPathKeyMap[manifestType as PrimaryManifestType]]
                return (
                  <div className={cx(css.rowItem)} key={`${id}-${index}`}>
                    <section className={cssMulti.multiManifestList}>
                      <div className={cx(cssMulti.multiManifestContainer)}>
                        <div className={cx(cssMulti.columnId)}>
                          <Text margin={{ right: 'small' }} inline color={Color.GREY_400} lineClamp={1}>
                            {getString('common.ID').toUpperCase()}
                          </Text>
                          <Icon inline name={manifestTypeIcons[manifestType as ManifestTypes]} size={24} />
                          <Text
                            margin={{ left: 'small' }}
                            inline
                            className={css.type}
                            color={Color.GREY_900}
                            lineClamp={1}
                          >
                            {id}
                          </Text>
                        </div>

                        <div className={cx(cssMulti.storeType, cssMulti.manifestItem)}>
                          <Text
                            margin={{ right: 'medium' }}
                            inline
                            className={cssMulti.type}
                            color={Color.GREY_400}
                            lineClamp={1}
                          >
                            {getString('store')}
                          </Text>
                          {renderConnectorField(storeType, getConnectorPath(storeType, manifest), connectorName, color)}
                          <div className={cssMulti.repoItem}>
                            <Icon inline name={'repository'} size={14} margin={{ left: 'medium', right: 'small' }} />
                            <Text
                              margin={{ right: 'medium' }}
                              inline
                              className={cssMulti.type}
                              color={Color.GREY_400}
                              lineClamp={1}
                            >
                              {store?.spec?.repoName}
                            </Text>
                          </div>
                        </div>
                      </div>
                      {!isReadonly && (
                        <span>
                          <Layout.Horizontal>
                            <Button
                              icon="Edit"
                              iconProps={{ size: 18 }}
                              onClick={() => {
                                editManifest(
                                  manifestType as ManifestTypes,
                                  storeType as ManifestStores,
                                  listOfManifests.findIndex(
                                    (item: ManifestConfigWrapper) => item.manifest?.identifier === id
                                  )
                                )
                              }}
                              minimal
                            />
                            <Button
                              iconProps={{ size: 18 }}
                              icon="main-trash"
                              onClick={() =>
                                removeManifestConfig(
                                  listOfManifests.findIndex(
                                    (item: ManifestConfigWrapper) => item.manifest?.identifier === id
                                  )
                                )
                              }
                              minimal
                            />
                          </Layout.Horizontal>
                        </span>
                      )}
                    </section>
                    {ManifestToPathMap[manifestType as PrimaryManifestType] &&
                      !TASManifestTypes.includes(manifestType as PrimaryManifestType) && (
                        <ManifestMultiAttach
                          manifestType={manifestType as PrimaryManifestType}
                          manifestStore={storeType}
                          valuesPaths={isArray(values) ? values : [values]}
                          paths={isArray(manifestLocation) ? manifestLocation : [manifestLocation]}
                        />
                      )}
                    {manifestType === ManifestDataType.TasManifest &&
                      TASManifestAllowedPaths.map(type => {
                        return (
                          <Container key={type} margin={{ bottom: 'medium' }}>
                            <AttachPathYamlFlow
                              renderConnectorField={renderConnectorField(
                                store.type,
                                store.spec.connectorRef,
                                connectorName,
                                color
                              )}
                              manifestType={type as PrimaryManifestType}
                              manifestStore={storeType}
                              valuesIcon={manifestTypeIcons[type]}
                              valuesPaths={manifest?.spec[ManifestToPathKeyMap[type as PrimaryManifestType]]}
                              expressions={expressions}
                              allowableTypes={allowableTypes}
                              isReadonly={isReadonly}
                              attachPathYaml={formData =>
                                attachPathYaml(formData, id as string, type as PrimaryManifestType)
                              }
                              removeValuesYaml={valuesYamlIndex =>
                                removeValuesYaml(valuesYamlIndex, id as string, type as PrimaryManifestType)
                              }
                            />
                          </Container>
                        )
                      })}
                  </div>
                )
              })}
          </section>
        </Layout.Vertical>
      </Layout.Vertical>
      <Layout.Vertical spacing={'medium'} flex={{ alignItems: 'flex-start' }}>
        {showAddManifestBtn(isReadonly, allowOnlyOneManifest, listOfManifests, deploymentType) && (
          <Button
            className={css.addManifest}
            disabled={enableMultipleManifest(listOfManifests, deploymentType, MultiManifestsTypes.MANIFESTS)}
            id="add-manifest"
            icon="plus"
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            data-test-id="addManifest"
            onClick={() => addNewManifest(MultiManifestsTypes.MANIFESTS)}
            text={addManifestBtnText ?? getString('pipeline.manifestType.addManifestLabel')}
          />
        )}
      </Layout.Vertical>
      <Layout.Vertical spacing="small" style={{ flexShrink: 'initial' }} margin={{ top: 'medium' }}>
        {!!listOfManifests?.filter((data: ManifestConfigWrapper) =>
          allowedMultiManifestTypes[deploymentType]?.[MultiManifestsTypes.PARAMS].includes(
            data?.manifest?.type as ManifestTypes
          )
        ).length && (
          <Container flex className={cssMulti.overrideHeader} padding={{ bottom: 'medium' }}>
            <Text
              margin={{ left: 'medium' }}
              className={cssMulti.columnIdOverride}
              font={{ variation: FontVariation.TABLE_HEADERS }}
            >
              {getString('common.ID')}
            </Text>
            <Text className={cssMulti.overrideFilePath} font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('common.git.filePath')}
            </Text>
            <Text className={cssMulti.overrideStoreType} font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('pipelineSteps.serviceTab.manifestList.manifestStore')}
            </Text>

            <span></span>
          </Container>
        )}
        <Layout.Vertical style={{ flexShrink: 'initial' }} className={cssMulti.manifestOverridesContainer}>
          <section>
            {listOfManifests
              ?.filter((data: ManifestConfigWrapper) =>
                allowedMultiManifestTypes[deploymentType]?.[MultiManifestsTypes.PARAMS].includes(
                  data?.manifest?.type as ManifestTypes
                )
              )
              .map((data: ManifestConfigWrapper, index: number) => {
                const manifest = data['manifest']
                const store = manifest?.spec?.store
                const id = manifest?.identifier
                const storeType = store?.type
                const manifestType = manifest?.type
                const { color } = getStatus(getConnectorPath(storeType, manifest), connectors, accountId)
                const connectorName = getConnectorNameFromValue(getConnectorPath(storeType, manifest), connectors)
                const manifestLocation = get(
                  manifest?.spec,
                  getManifestLocation(manifestType as ManifestTypes, storeType)
                )
                const isManifestLocationString = typeof manifestLocation === 'string'
                const isHarnessStore = storeType === ManifestStoreMap.Harness
                const valuesPaths = manifest?.spec[ManifestToPathKeyMap[manifestType as PrimaryManifestType]]
                return (
                  <Container className={cx(css.rowItem, cssMulti.wrapper)} key={`${id}-${index}`}>
                    <section className={cssMulti.multiOverrideWrapper}>
                      <div className={cx(cssMulti.manifestOverrideItem)}>
                        <Container
                          flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                          className={cx(cssMulti.columnIdOverride, cssMulti.manifestOverrideWrapperItem)}
                        >
                          <Icon inline name={manifestTypeIcons[manifestType as ManifestTypes]} size={24} />
                          <Text
                            margin={{ left: 'small' }}
                            inline
                            className={css.type}
                            color={Color.GREY_900}
                            lineClamp={1}
                          >
                            {id}
                          </Text>
                        </Container>
                        <Container className={cx(cssMulti.overrideFilePath, cssMulti.manifestOverrideWrapperItem)}>
                          {!isEmpty(manifestLocation) && (
                            <span>
                              <Text
                                flex
                                tooltip={
                                  <LocationValue
                                    isTooltip
                                    locations={isManifestLocationString ? [manifestLocation] : manifestLocation}
                                    isHarnessStore={isHarnessStore}
                                    onClick={(path: string, scope: string) =>
                                      FileStoreModal.openFileStoreModal(path, scope)
                                    }
                                  />
                                }
                              >
                                <LocationValue
                                  locations={isManifestLocationString ? [manifestLocation] : manifestLocation}
                                  isHarnessStore={isHarnessStore}
                                  onClick={(path: string, scope: string) =>
                                    FileStoreModal.openFileStoreModal(path, scope)
                                  }
                                />
                              </Text>
                            </span>
                          )}
                        </Container>
                        <div className={cx(cssMulti.overrideStoreType, cssMulti.manifestOverrideWrapperItem)}>
                          {renderConnectorField(storeType, getConnectorPath(storeType, manifest), connectorName, color)}
                        </div>
                      </div>
                      {!isReadonly && (
                        <div className={cssMulti.overrideBtns}>
                          <Layout.Horizontal>
                            <Button
                              icon="Edit"
                              iconProps={{ size: 18 }}
                              onClick={() => {
                                editManifest(
                                  manifestType as ManifestTypes,
                                  storeType as ManifestStores,
                                  listOfManifests.findIndex(
                                    (item: ManifestConfigWrapper) => item.manifest?.identifier === id
                                  )
                                )
                              }}
                              minimal
                            />
                            <Button
                              iconProps={{ size: 18 }}
                              icon="main-trash"
                              onClick={() =>
                                removeManifestConfig(
                                  listOfManifests.findIndex(
                                    (item: ManifestConfigWrapper) => item.manifest?.identifier === id
                                  )
                                )
                              }
                              minimal
                            />
                          </Layout.Horizontal>
                        </div>
                      )}
                    </section>

                    {ManifestToPathMap[manifestType as PrimaryManifestType] &&
                      !TASManifestTypes.includes(manifestType as PrimaryManifestType) && (
                        <ManifestMultiAttach
                          manifestType={manifestType as PrimaryManifestType}
                          manifestStore={storeType}
                          valuesPaths={isArray(valuesPaths) ? valuesPaths : [valuesPaths]}
                          paths={manifestLocation}
                        />
                      )}
                    {manifestType === ManifestDataType.TasManifest &&
                      TASManifestAllowedPaths.map(type => (
                        <Container key={type} margin={{ bottom: 'medium' }}>
                          <AttachPathYamlFlow
                            renderConnectorField={renderConnectorField(
                              storeType,
                              manifest?.spec?.store?.spec.connectorRef,
                              connectorName,
                              color
                            )}
                            manifestType={type as PrimaryManifestType}
                            manifestStore={storeType}
                            valuesIcon={manifestTypeIcons[type]}
                            valuesPaths={manifest?.spec[ManifestToPathKeyMap[type as PrimaryManifestType]]}
                            expressions={expressions}
                            allowableTypes={allowableTypes}
                            isReadonly={isReadonly}
                            attachPathYaml={formData =>
                              attachPathYaml(formData, id as string, type as PrimaryManifestType)
                            }
                            removeValuesYaml={valuesYamlIndex =>
                              removeValuesYaml(valuesYamlIndex, id as string, type as PrimaryManifestType)
                            }
                          />
                        </Container>
                      ))}
                  </Container>
                )
              })}
          </section>
        </Layout.Vertical>
      </Layout.Vertical>
      <Layout.Vertical spacing={'medium'} flex={{ alignItems: 'flex-start' }}>
        {showAddManifestBtn(isReadonly, allowOnlyOneManifest, listOfManifests, deploymentType) && (
          <Button
            className={css.addManifest}
            id="add-manifest-override"
            icon="plus"
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            data-test-id="addManifestOverride"
            onClick={() => addNewManifest(MultiManifestsTypes.PARAMS)}
            text={getString('pipeline.manifestType.addAdditionalOverride')}
          />
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
export default ManifestListViewMultiple
