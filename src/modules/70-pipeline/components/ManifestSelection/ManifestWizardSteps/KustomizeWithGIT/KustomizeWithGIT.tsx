/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Layout,
  Button,
  FormInput,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  StepProps,
  Accordion,
  ButtonVariation,
  AllowedTypes,
  FormikForm
} from '@harness/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { defaultTo, get, isEmpty, set } from 'lodash-es'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import type { KustomizeWithGITDataType, KustomizeWithGITManifestLastStepPrevStepData } from '../../ManifestInterface'
import {
  getSkipResourceVersioningBasedOnDeclarativeRollback,
  gitFetchTypeList,
  GitFetchTypes,
  GitRepoName,
  ManifestDataType,
  ManifestIdentifierValidation,
  ManifestStoreMap
} from '../../Manifesthelper'
import GitRepositoryName from '../GitRepositoryName/GitRepositoryName'
import {
  filePathWidth,
  getRepositoryName,
  handleCommandFlagsSubmitData,
  removeEmptyFieldsFromStringArray
} from '../ManifestUtils'
import DragnDropPaths from '../../DragnDropPaths'
import KustomizeAdvancedStepSelection from '../KustomizeAdvancedStepSelection'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from '../HelmWithGIT/HelmWithGIT.module.scss'

interface KustomizeWithGITPropType {
  stepName: string
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
  editManifestModePrevStepData?: KustomizeWithGITManifestLastStepPrevStepData
}

function KustomizeWithGIT({
  stepName,
  initialValues,
  handleSubmit,
  expressions,
  allowableTypes,
  prevStepData,
  previousStep,
  manifestIdsList,
  isReadonly = false,
  editManifestModePrevStepData
}: StepProps<ConnectorConfigDTO> & KustomizeWithGITPropType): React.ReactElement {
  const { getString } = useStrings()

  const kustomizeYamlFolderPath = get(initialValues, 'spec.overlayConfiguration.kustomizeYamlFolderPath', '')
  const isActiveAdvancedStep: boolean =
    initialValues?.spec?.skipResourceVersioning || initialValues?.spec?.commandFlags || !!kustomizeYamlFolderPath

  const modifiedPrevStepData = defaultTo(prevStepData, editManifestModePrevStepData)
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const gitConnectionType: string = modifiedPrevStepData?.store === ManifestStoreMap.Git ? 'connectionType' : 'type'
  const connectionType =
    modifiedPrevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    modifiedPrevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account

  const accountUrl =
    connectionType === GitRepoName.Account
      ? modifiedPrevStepData?.connectorRef
        ? modifiedPrevStepData?.connectorRef?.connector?.spec?.url
        : modifiedPrevStepData?.url
      : null

  const getInitialValues = (): KustomizeWithGITDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)
    const defaultCommandFlags = [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }]

    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        folderPath: specValues.folderPath,
        repoName: getRepositoryName(modifiedPrevStepData, initialValues),
        pluginPath: initialValues.spec?.pluginPath,
        patchesPaths:
          typeof initialValues?.spec?.patchesPaths === 'string'
            ? initialValues?.spec?.patchesPaths
            : removeEmptyFieldsFromStringArray(initialValues?.spec?.patchesPaths)?.map((path: string) => ({
                path,
                uuid: uuid(path, nameSpace())
              })),
        skipResourceVersioning: initialValues?.spec?.skipResourceVersioning,
        enableDeclarativeRollback: initialValues?.spec?.enableDeclarativeRollback,
        optimizedKustomizeManifestCollection: !!kustomizeYamlFolderPath,
        commandFlags:
          initialValues.spec?.commandFlags?.map((commandFlag: { commandType: string; flag: string }) => ({
            commandType: commandFlag.commandType,
            flag: commandFlag.flag
          })) || defaultCommandFlags,
        kustomizeYamlFolderPath
      }
    }
    return {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      folderPath: '',
      skipResourceVersioning: false,
      enableDeclarativeRollback: false,
      repoName: getRepositoryName(modifiedPrevStepData, initialValues),
      pluginPath: '',
      optimizedKustomizeManifestCollection: false,
      kustomizeYamlFolderPath: '',
      commandFlags: defaultCommandFlags
    }
  }

  const submitFormData = (formData: KustomizeWithGITDataType & { store?: string; connectorRef?: string }): void => {
    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: formData.identifier,
        type: ManifestDataType.Kustomize,
        spec: {
          ...(formData.optimizedKustomizeManifestCollection
            ? {
                overlayConfiguration: {
                  kustomizeYamlFolderPath: formData.kustomizeYamlFolderPath
                }
              }
            : {}),
          store: {
            type: formData?.store,
            spec: {
              connectorRef: formData?.connectorRef,
              gitFetchType: formData?.gitFetchType,
              folderPath: formData?.folderPath
            }
          },
          patchesPaths:
            typeof formData?.patchesPaths === 'string'
              ? formData?.patchesPaths
              : formData?.patchesPaths?.map((path: { path: string }) => path.path),
          pluginPath: formData?.pluginPath,
          skipResourceVersioning: getSkipResourceVersioningBasedOnDeclarativeRollback(
            formData?.skipResourceVersioning,
            formData?.enableDeclarativeRollback
          ),
          enableDeclarativeRollback: formData?.enableDeclarativeRollback
        }
      }
    }

    if (connectionType === GitRepoName.Account) {
      set(manifestObj, 'manifest.spec.store.spec.repoName', formData?.repoName)
    }

    if (manifestObj?.manifest?.spec?.store) {
      if (formData?.gitFetchType === 'Branch') {
        set(manifestObj, 'manifest.spec.store.spec.branch', formData?.branch)
      } else if (formData?.gitFetchType === 'Commit') {
        set(manifestObj, 'manifest.spec.store.spec.commitId', formData?.commitId)
      }
    }
    handleCommandFlagsSubmitData(manifestObj, formData)
    handleSubmit(manifestObj)
  }

  return (
    <Layout.Vertical spacing="medium" className={css.manifestStore}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="kustomizeGit"
        validationSchema={Yup.object().shape({
          ...ManifestIdentifierValidation(
            getString,
            manifestIdsList,
            initialValues?.identifier,
            getString('pipeline.uniqueName')
          ),
          folderPath: Yup.string().trim().required(getString('pipeline.manifestType.kustomizeFolderPathRequired')),
          branch: Yup.string().when('gitFetchType', {
            is: 'Branch',
            then: Yup.string().trim().required(getString('validation.branchName'))
          }),
          commitId: Yup.string().when('gitFetchType', {
            is: 'Commit',
            then: Yup.string().trim().required(getString('validation.commitId'))
          }),
          repoName: Yup.string().test('repoName', getString('common.validation.repositoryName'), value => {
            if (
              connectionType === GitRepoName.Repo ||
              getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) !== MultiTypeInputType.FIXED
            ) {
              return true
            }
            return !isEmpty(value) && value?.length > 0
          }),
          patchesPaths: Yup.lazy((value): Yup.Schema<unknown> => {
            if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
              return Yup.array().of(
                Yup.object().shape({
                  path: Yup.string().min(1).required(getString('pipeline.manifestType.pathRequired'))
                })
              )
            }
            return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
          }),
          optimizedKustomizeManifestCollection: Yup.boolean(),
          kustomizeYamlFolderPath: Yup.string().when('optimizedKustomizeManifestCollection', {
            is: true,
            then: Yup.string().trim().required(getString('pipeline.manifestType.kustomizeYamlFolderPathRequired'))
          }),
          commandFlags: Yup.array().of(
            Yup.object().shape({
              flag: Yup.string().when('commandType', {
                is: val => !isEmpty(val),
                then: Yup.string().required(getString('pipeline.manifestType.commandFlagRequired'))
              })
            })
          )
        })}
        onSubmit={formData => {
          submitFormData({
            ...modifiedPrevStepData,
            ...formData,
            connectorRef: modifiedPrevStepData?.connectorRef
              ? getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) !== MultiTypeInputType.FIXED
                ? modifiedPrevStepData?.connectorRef
                : modifiedPrevStepData?.connectorRef?.value
              : modifiedPrevStepData?.identifier
              ? modifiedPrevStepData?.identifier
              : ''
          })
        }}
      >
        {(formik: { setFieldValue: (a: string, b: string) => void; values: KustomizeWithGITDataType }) => {
          return (
            <FormikForm>
              <div className={helmcss.helmGitForm}>
                <FormInput.Text
                  name="identifier"
                  label={getString('pipeline.manifestType.manifestIdentifier')}
                  placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                  className={helmcss.halfWidth}
                  isIdentifier={true}
                />
                {!!(connectionType === GitRepoName.Account || accountUrl) && (
                  <GitRepositoryName
                    accountUrl={accountUrl}
                    expressions={expressions}
                    allowableTypes={allowableTypes}
                    fieldValue={formik.values?.repoName}
                    changeFieldValue={(value: string) => formik.setFieldValue('repoName', value)}
                    isReadonly={isReadonly}
                  />
                )}
                <Layout.Horizontal flex spacing="huge" margin={{ top: 'small', bottom: 'small' }}>
                  <div className={helmcss.halfWidth}>
                    <FormInput.Select
                      name="gitFetchType"
                      label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                      items={gitFetchTypeList}
                    />
                  </div>

                  {formik.values?.gitFetchType === GitFetchTypes.Branch && (
                    <div
                      className={cx(helmcss.halfWidth, {
                        [helmcss.runtimeInput]:
                          getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME
                      })}
                    >
                      <FormInput.MultiTextInput
                        label={getString('pipelineSteps.deploy.inputSet.branch')}
                        placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                        multiTextInputProps={{
                          expressions,
                          allowableTypes,
                          newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                        }}
                        name="branch"
                      />
                      {getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          style={{ alignSelf: 'center', marginBottom: 4 }}
                          value={formik.values?.branch as string}
                          type="String"
                          variableName="branch"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => formik.setFieldValue('branch', value)}
                          isReadonly={isReadonly}
                        />
                      )}
                    </div>
                  )}

                  {formik.values?.gitFetchType === GitFetchTypes.Commit && (
                    <div
                      className={cx(helmcss.halfWidth, {
                        [helmcss.runtimeInput]:
                          getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME
                      })}
                    >
                      <FormInput.MultiTextInput
                        label={getString('pipeline.manifestType.commitId')}
                        placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                        multiTextInputProps={{
                          expressions,
                          allowableTypes,
                          newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                        }}
                        name="commitId"
                      />
                      {getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          style={{ alignSelf: 'center', marginBottom: 4 }}
                          value={formik.values?.commitId as string}
                          type="String"
                          variableName="commitId"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => formik.setFieldValue('commitId', value)}
                          isReadonly={isReadonly}
                        />
                      )}
                    </div>
                  )}
                </Layout.Horizontal>

                <Layout.Horizontal flex spacing="huge" margin={{ bottom: 'small' }}>
                  <div
                    className={cx(helmcss.halfWidth, {
                      [helmcss.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.folderPath) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTextInput
                      label={
                        formik.values.optimizedKustomizeManifestCollection
                          ? getString('pipeline.manifestType.kustomizeBasePath')
                          : getString('pipeline.manifestType.kustomizeFolderPath')
                      }
                      placeholder={getString('pipeline.manifestType.kustomizeFolderPathPlaceholder')}
                      name="folderPath"
                      tooltipProps={{
                        dataTooltipId: formik.values.optimizedKustomizeManifestCollection
                          ? 'kustomizeBasePath'
                          : 'kustomizePathHelperText'
                      }}
                      multiTextInputProps={{
                        expressions,
                        allowableTypes,
                        newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                      }}
                    />
                    {getMultiTypeFromValue(formik.values?.folderPath) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginBottom: 4 }}
                        value={formik.values?.folderPath as string}
                        type="String"
                        variableName="folderPath"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => formik.setFieldValue('folderPath', value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>

                  <div
                    className={cx(helmcss.halfWidth, {
                      [helmcss.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.pluginPath) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTextInput
                      label={getString('pluginPath')}
                      placeholder={getString('pipeline.manifestType.kustomizePluginPathPlaceholder')}
                      name="pluginPath"
                      tooltipProps={{
                        dataTooltipId: 'pluginPathHelperText'
                      }}
                      isOptional={true}
                      multiTextInputProps={{
                        expressions,
                        allowableTypes,
                        newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                      }}
                    />
                    {getMultiTypeFromValue(formik.values?.pluginPath) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginBottom: 4 }}
                        value={formik.values?.pluginPath as string}
                        type="String"
                        variableName="pluginPath"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => formik.setFieldValue('pluginPath', value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                </Layout.Horizontal>
                <div
                  className={cx({
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.patchesPaths) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <DragnDropPaths
                    formik={formik}
                    expressions={expressions}
                    allowableTypes={allowableTypes}
                    fieldPath="patchesPaths"
                    pathLabel={getString('pipeline.manifestTypeLabels.KustomizePatches')}
                    placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                    defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
                    dragDropFieldWidth={filePathWidth}
                    allowSinglePathDeletion
                    isExpressionEnable={true}
                  />
                  {getMultiTypeFromValue(formik.values.patchesPaths) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={formik.values.patchesPaths}
                      type={getString('string')}
                      variableName={'patchesPaths'}
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={val => formik?.setFieldValue('patchesPaths', val)}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>
                <Accordion
                  activeId={isActiveAdvancedStep ? getString('advancedTitle') : ''}
                  className={cx({
                    [helmcss.skipResourceSection]: isActiveAdvancedStep
                  })}
                >
                  <Accordion.Panel
                    id={getString('advancedTitle')}
                    addDomId={true}
                    summary={getString('advancedTitle')}
                    details={
                      <KustomizeAdvancedStepSelection
                        expressions={expressions}
                        allowableTypes={allowableTypes}
                        formik={formik}
                        isReadonly={isReadonly}
                        storeType={defaultTo(modifiedPrevStepData?.store, '')}
                      />
                    }
                  />
                </Accordion>
              </div>

              <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => previousStep?.(modifiedPrevStepData)}
                />
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('submit')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default KustomizeWithGIT
