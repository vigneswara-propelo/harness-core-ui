/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { defaultTo, get, memoize } from 'lodash-es'

import { FormInput, Layout, Text } from '@harness/uicore'
import { Menu } from '@blueprintjs/core'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { TriggerDefaultFieldList } from '@triggers/components/Triggers/utils'
import {
  ArtifactSource,
  BuildDetails,
  GithubPackageDTO,
  SidecarArtifact,
  useGetPackagesFromGithub,
  useGetPackagesFromGithubWithServiceV2,
  useGetVersionsFromPackages,
  useGetVersionsFromPackagesWithServiceV2
} from 'services/cd-ng'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { useMutateAsGet } from '@common/hooks'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { isArtifactInMultiService } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { useIsTagRegex } from '@pipeline/hooks/useIsTagRegex'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import {
  getDefaultQueryParam,
  getFinalQueryParamValue,
  getFqnPath,
  getValidInitialValuePath,
  getYamlData,
  isFieldfromTriggerTabDisabled,
  isNewServiceEnvEntity
} from '../artifactSourceUtils'
import DigestField from '../ArtifactSourceRuntimeFields/DigestField'
import { useGetDigestDetailsForGithubPackageRegistryArtifact } from './useGetDigestDetailsForGithubPackageRegistryArtifact'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

interface JenkinsRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}
const Content = (props: JenkinsRenderContent): React.ReactElement => {
  const {
    isPrimaryArtifactsRuntime,
    isSidecarRuntime,
    template,
    path,
    readonly,
    allowableTypes,
    isSidecar,
    artifactPath,
    accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch,
    artifact,
    initialValues,
    formik,
    fromTrigger,
    serviceIdentifier,
    gitMetadata,
    stageIdentifier,
    pipelineIdentifier,
    serviceBranch,
    stepViewType,
    useArtifactV1Data = false,
    artifacts
  } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const serviceId = isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined

  const connectorRefValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.connectorRef`, ''), artifact?.spec?.connectorRef),
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`)
  )
  const orgValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.org`, ''), artifact?.spec?.org),
    get(initialValues?.artifacts, `${artifactPath}.spec.org`)
  )
  const packageNameValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.packageName`, ''), artifact?.spec?.packageName),
    get(initialValues?.artifacts, `${artifactPath}.spec.packageName`)
  )
  const packageTypeValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.packageType`, ''), artifact?.spec?.packageType),
    get(initialValues?.artifacts, `${artifactPath}.spec.packageType`)
  )

  const versionValue = getDefaultQueryParam(
    get(initialValues?.artifacts, `${artifactPath}.spec.version`),
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.version`, ''), artifact?.spec?.version)
  )

  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')

  const { isTagRegex: isVersionRegex, isServiceLoading } = useIsTagRegex({
    serviceIdentifier: serviceIdentifier!,
    gitMetadata,
    serviceBranch,
    artifact: artifact as ArtifactSource,
    artifactPath: artifactPath!,
    tagOrVersionRegexKey: 'versionRegex'
  })
  // v1 tags api is required to fetch tags for artifact source template usage while linking to service
  // Here v2 api cannot be used to get the builds because of unavailability of complete yaml during creation.
  const {
    data: packageV1Details,
    refetch: refetchPackageV1Details,
    loading: fetchingV1Packages,
    error: errorFetchingV1Packages
  } = useGetPackagesFromGithub({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: getFinalQueryParamValue(connectorRefValue),
      packageType: getFinalQueryParamValue(packageTypeValue) as string,
      org: getFinalQueryParamValue(orgValue)
    }
  })

  const isMultiService = isArtifactInMultiService(formik?.values?.services, path)

  const {
    data: packageV2Details,
    refetch: refetchPackageV2Details,
    loading: fetchingV2Packages,
    error: errorFetchingV2Packages
  } = useMutateAsGet(useGetPackagesFromGithubWithServiceV2, {
    lazy: true,
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...commonParams,
      connectorRef: getFinalQueryParamValue(connectorRefValue),
      packageType: getFinalQueryParamValue(packageTypeValue),
      org: getFinalQueryParamValue(orgValue),
      pipelineIdentifier: defaultTo(pipelineIdentifier, formik?.values?.identifier),
      serviceId: isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined,
      fqnPath: getFqnPath(
        path as string,
        !!isPropagatedStage,
        stageIdentifier,
        defaultTo(
          isSidecar
            ? artifactPath?.split('[')[0].concat(`.${get(initialValues?.artifacts, `${artifactPath}.identifier`)}`)
            : artifactPath,
          ''
        ),
        'packageName',
        serviceIdentifier as string,
        isMultiService
      )
    }
  })

  const { refetchPackageDetails, fetchingPackages, error, packageDetails } = useArtifactV1Data
    ? {
        refetchPackageDetails: refetchPackageV1Details,
        fetchingPackages: fetchingV1Packages,
        error: errorFetchingV1Packages,
        packageDetails: packageV1Details
      }
    : {
        refetchPackageDetails: refetchPackageV2Details,
        fetchingPackages: fetchingV2Packages,
        error: errorFetchingV2Packages,
        packageDetails: packageV2Details
      }

  const {
    data: versionV1Details,
    refetch: refetchVersionV1Details,
    loading: fetchingV1Version,
    error: errorFetchingV1Version
  } = useGetVersionsFromPackages({
    lazy: true,
    queryParams: {
      ...commonParams,
      packageType: getFinalQueryParamValue(packageTypeValue) as string,
      packageName: getFinalQueryParamValue(packageNameValue) as string,
      connectorRef: getFinalQueryParamValue(connectorRefValue) as string,
      versionRegex: '*',
      org: getFinalQueryParamValue(orgValue)
    }
  })

  const {
    data: versionV2Details,
    refetch: refetchVersionV2Details,
    loading: fetchingV2Version,
    error: errorFetchingV2Version
  } = useMutateAsGet(useGetVersionsFromPackagesWithServiceV2, {
    lazy: true,
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...commonParams,
      packageType: getFinalQueryParamValue(packageTypeValue),
      packageName: getFinalQueryParamValue(packageNameValue),
      connectorRef: getFinalQueryParamValue(connectorRefValue),
      versionRegex: '*',
      org: getFinalQueryParamValue(orgValue),
      pipelineIdentifier: defaultTo(pipelineIdentifier, formik?.values?.identifier),
      serviceId: isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined,
      fqnPath: getFqnPath(
        path as string,
        !!isPropagatedStage,
        stageIdentifier,
        defaultTo(
          isSidecar
            ? artifactPath?.split('[')[0].concat(`.${get(initialValues?.artifacts, `${artifactPath}.identifier`)}`)
            : artifactPath,
          ''
        ),
        'version',
        serviceIdentifier as string,
        isMultiService
      )
    }
  })

  const { refetchVersionDetails, fetchingVersion, errorFetchingVersion, versionDetails } = useArtifactV1Data
    ? {
        refetchVersionDetails: refetchVersionV1Details,
        fetchingVersion: fetchingV1Version,
        errorFetchingVersion: errorFetchingV1Version,
        versionDetails: versionV1Details
      }
    : {
        refetchVersionDetails: refetchVersionV2Details,
        fetchingVersion: fetchingV2Version,
        errorFetchingVersion: errorFetchingV2Version,
        versionDetails: versionV2Details
      }

  const {
    fetchDigest,
    fetchingDigest,
    fetchDigestError: digestError,
    gprDigestData: digestData
  } = useGetDigestDetailsForGithubPackageRegistryArtifact({
    connectorRef: getFinalQueryParamValue(connectorRefValue),
    org: getFinalQueryParamValue(orgValue),
    packageName: getFinalQueryParamValue(packageNameValue),
    packageType: getFinalQueryParamValue(packageTypeValue),
    version: getFinalQueryParamValue(versionValue),
    accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch,
    useArtifactV1Data,
    formik,
    path,
    initialValues,
    isPropagatedStage,
    serviceId,
    isSidecar,
    artifactPath,
    stageIdentifier,
    pipelineIdentifier,
    stepViewType
  })

  const selectPackageItems = useMemo(() => {
    return packageDetails?.data?.githubPackageResponse?.map((packageInfo: GithubPackageDTO) => ({
      value: defaultTo(packageInfo.packageName, ''),
      label: defaultTo(packageInfo.packageName, '')
    }))
  }, [packageDetails?.data])

  const selectVersionItems = useMemo(() => {
    return versionDetails?.data?.map((packageInfo: BuildDetails) => ({
      value: defaultTo(packageInfo.number, ''),
      label: defaultTo(packageInfo.number, '')
    }))
  }, [versionDetails?.data])

  const getPackages = (): { label: string; value: string }[] => {
    if (fetchingPackages) {
      return [{ label: 'Loading Packages...', value: 'Loading Packages...' }]
    }
    return defaultTo(selectPackageItems, [])
  }

  const getVersions = (): { label: string; value: string }[] => {
    if (fetchingVersion) {
      return [{ label: 'Loading Versions...', value: 'Loading Versions...' }]
    }
    return defaultTo(selectVersionItems, [])
  }

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingPackages}
        onClick={handleClick}
      />
    </div>
  ))

  const versionItemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingVersion}
        onClick={handleClick}
      />
    </div>
  ))

  const isFieldDisabled = (fieldName: string): boolean => {
    /* instanbul ignore else */
    if (
      readonly ||
      isServiceLoading ||
      isFieldfromTriggerTabDisabled(
        fieldName,
        formik,
        stageIdentifier,
        fromTrigger,
        isSidecar ? (artifact as SidecarArtifact)?.identifier : undefined
      )
    ) {
      return true
    }
    return false
  }

  const isRuntime = isPrimaryArtifactsRuntime || isSidecarRuntime

  return (
    <>
      {isRuntime && (
        <Layout.Vertical key={artifactPath} className={css.inputWidth}>
          {isFieldRuntime(`artifacts.${artifactPath}.spec.connectorRef`, template) && (
            <FormMultiTypeConnectorField
              name={`${path}.artifacts.${artifactPath}.spec.connectorRef`}
              label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
              selected={get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '')}
              placeholder={''}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              setRefValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.connectorRef`)}
              multiTypeProps={{
                allowableTypes,
                expressions,
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
              }}
              type={ArtifactToConnectorMap[defaultTo(artifact?.type, '')]}
              gitScope={{
                repo: defaultTo(repoIdentifier, ''),
                branch: defaultTo(branch, ''),
                getDefaultFromOtherRepo: true
              }}
              templateProps={{
                isTemplatizedView: true,
                templateValue: get(template, `artifacts.${artifactPath}.spec.connectorRef`)
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.org`, template) && (
            <TextFieldInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.org`}
              template={template}
              name={`${path}.artifacts.${artifactPath}.spec.org`}
              label={getString('projectsOrgs.orgName')}
              onChange={() => {
                if (isFieldRuntime(`artifacts.${artifactPath}.spec.packageName`, template))
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.packageName`, '')
              }}
              placeholder={getString('pipeline.artifactsSelection.orgNamePlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.org`)}
              multiTextInputProps={{
                expressions,
                allowableTypes,
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.user`, template) && (
            <TextFieldInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.user`}
              template={template}
              name={`${path}.artifacts.${artifactPath}.spec.user`}
              label={getString('common.userLabel')}
              onChange={() => {
                if (isFieldRuntime(`artifacts.${artifactPath}.spec.packageName`, template))
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.packageName`, '')
              }}
              placeholder={getString('pipeline.artifactsSelection.userPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.user`)}
              multiTextInputProps={{
                expressions,
                allowableTypes,
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.groupId`, template) && (
            <TextFieldInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.groupId`}
              template={template}
              name={`${path}.artifacts.${artifactPath}.spec.groupId`}
              label={getString('pipeline.artifactsSelection.groupId')}
              placeholder={getString('pipeline.artifactsSelection.groupIdPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.groupId`)}
              multiTextInputProps={{
                expressions,
                allowableTypes,
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.artifactId`, template) && (
            <TextFieldInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.artifactId`}
              template={template}
              name={`${path}.artifacts.${artifactPath}.spec.artifactId`}
              label={getString('pipeline.artifactsSelection.artifactId')}
              placeholder={getString('pipeline.artifactsSelection.artifactIdPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.artifactId`)}
              multiTextInputProps={{
                expressions,
                allowableTypes,
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.extension`, template) && (
            <TextFieldInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.extension`}
              template={template}
              name={`${path}.artifacts.${artifactPath}.spec.extension`}
              label={getString('pipeline.artifactsSelection.extension')}
              placeholder={getString('pipeline.artifactsSelection.extensionPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.extension`)}
              multiTextInputProps={{
                expressions,
                allowableTypes,
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.packageName`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.packageName`}
              template={template}
              selectItems={getPackages()}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.packageName`)}
              name={`${path}.artifacts.${artifactPath}.spec.packageName`}
              label={getString('pipeline.artifactsSelection.packageName')}
              placeholder={getString('pipeline.manifestType.packagePlaceholder')}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
                selectProps: {
                  noResults: (
                    <NoTagResults
                      tagError={error}
                      isServerlessDeploymentTypeSelected={false}
                      defaultErrorText={getString('pipeline.artifactsSelection.validation.noBuild')}
                    />
                  ),
                  itemRenderer: itemRenderer,
                  items: getPackages(),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  refetchPackageDetails()
                }
              }}
            />
          )}
          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.version`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.version`}
              template={template}
              name={`${path}.artifacts.${artifactPath}.spec.version`}
              label={getString('version')}
              placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.version`)}
              selectItems={getVersions()}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
                selectProps: {
                  noResults: (
                    <NoTagResults
                      tagError={errorFetchingVersion}
                      isServerlessDeploymentTypeSelected={false}
                      defaultErrorText={getString('pipeline.artifactsSelection.validation.noVersion')}
                    />
                  ),
                  itemRenderer: versionItemRenderer,
                  items: getVersions(),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  refetchVersionDetails()
                }
              }}
            />
          )}
          {!!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.version`, template) && (
            <FormInput.MultiTextInput
              label={getString('version')}
              multiTextInputProps={{
                expressions,
                value: TriggerDefaultFieldList.build,
                allowableTypes,
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
              }}
              disabled={true}
              name={`${path}.artifacts.${artifactPath}.spec.version`}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.versionRegex`, template) && (
            <TextFieldInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.versionRegex`}
              template={template}
              name={`${path}.artifacts.${artifactPath}.spec.versionRegex`}
              label={getString('pipeline.artifactsSelection.versionRegex')}
              placeholder={getString('pipeline.artifactsSelection.versionRegexPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.versionRegex`)}
              multiTextInputProps={{
                expressions,
                allowableTypes,
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
              }}
            />
          )}
          {!fromTrigger && !isVersionRegex && isFieldRuntime(`artifacts.${artifactPath}.spec.digest`, template) && (
            <div className={css.inputFieldLayout}>
              <DigestField
                {...props}
                fetchingDigest={fetchingDigest}
                fetchDigestError={digestError}
                fetchDigest={fetchDigest}
                expressions={expressions}
                stageIdentifier={stageIdentifier}
                digestData={digestData}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.digest`)}
              />
            </div>
          )}
          {!fromTrigger && isVersionRegex && isFieldRuntime(`artifacts.${artifactPath}.spec.digest`, template) && (
            <TextFieldInputSetView
              tooltipProps={{
                dataTooltipId: 'artifactDigestTooltip'
              }}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.digest`)}
              placeholder={getString('pipeline.artifactsSelection.digestPlaceholder')}
              multiTextInputProps={{
                expressions,
                allowableTypes,
                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
              }}
              label={getString('pipeline.digest')}
              name={`${path}.artifacts.${artifactPath}.spec.digest`}
              fieldPath={`artifacts.${artifactPath}.spec.digest`}
              template={template}
            />
          )}
        </Layout.Vertical>
      )}
    </>
  )
}

export class GithubPackageRegistrySource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.GithubPackageRegistry
  protected isSidecar = false

  isTagsSelectionDisabled(_props: ArtifactSourceRenderProps): boolean {
    return false
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} isTagsSelectionDisabled={this.isTagsSelectionDisabled.bind(this)} />
  }
}
