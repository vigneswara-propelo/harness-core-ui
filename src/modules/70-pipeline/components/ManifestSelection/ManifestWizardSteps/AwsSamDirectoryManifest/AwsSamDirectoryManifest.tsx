/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { get, set, isEmpty, defaultTo } from 'lodash-es'
import {
  Accordion,
  Layout,
  Button,
  FormInput,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  StepProps,
  ButtonVariation,
  AllowedTypes,
  FormikForm
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper, ServiceDefinition } from 'services/cd-ng'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { AcceptableValue } from '@pipeline/components/PipelineInputSetForm/CICodebaseInputSetForm'
import type {
  AwsSamDirectoryManifestDataType,
  ManifestTypes,
  AwsSamDirectoryManifestLastStepPrevStepData
} from '../../ManifestInterface'
import { GitRepoName, ManifestIdentifierValidation, ManifestStoreMap } from '../../Manifesthelper'
import { getRepositoryName, removeEmptyFieldsFromStringArray } from '../ManifestUtils'
import { ManifestDetailsCoreSection } from '../CommonManifestDetails/ManifestDetailsCoreSection'
import css from '../CommonManifestDetails/CommonManifestDetails.module.scss'

interface AwsSamDirectoryManifestPropType {
  stepName: string
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  selectedManifest: ManifestTypes | null
  selectedDeploymentType?: ServiceDefinition['type']
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
  showIdentifierField?: boolean
  editManifestModePrevStepData?: AwsSamDirectoryManifestLastStepPrevStepData
}

export function AwsSamDirectoryManifest({
  stepName,
  selectedManifest,
  selectedDeploymentType,
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  manifestIdsList,
  isReadonly = false,
  showIdentifierField = true,
  editManifestModePrevStepData
}: StepProps<ConnectorConfigDTO> & AwsSamDirectoryManifestPropType): React.ReactElement {
  const { getString } = useStrings()

  const modifiedPrevStepData = defaultTo(prevStepData, editManifestModePrevStepData)
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const gitConnectionType: string = modifiedPrevStepData?.store === ManifestStoreMap.Git ? 'connectionType' : 'type'
  const connectionType =
    modifiedPrevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    modifiedPrevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account

  const getInitialValues = (): AwsSamDirectoryManifestDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues?.identifier,
        samTemplateFile: initialValues?.spec?.samTemplateFile,
        repoName: getRepositoryName(modifiedPrevStepData, initialValues),
        paths:
          typeof specValues.paths === 'string'
            ? specValues.paths
            : removeEmptyFieldsFromStringArray(specValues.paths)?.map((path: string) => ({
                path,
                uuid: uuid(path, nameSpace())
              }))
      }
    }
    return {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      paths: [{ path: '', uuid: uuid('', nameSpace()) }],
      repoName: getRepositoryName(modifiedPrevStepData, initialValues),
      samTemplateFile: undefined
    }
  }

  const submitFormData = (
    formData: AwsSamDirectoryManifestDataType & { store?: string; connectorRef?: string }
  ): void => {
    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: formData.identifier,
        type: selectedManifest as ManifestTypes,
        spec: {
          store: {
            type: formData?.store,
            spec: {
              connectorRef: formData.connectorRef,
              gitFetchType: formData.gitFetchType,
              paths:
                typeof formData.paths === 'string'
                  ? formData.paths
                  : formData.paths.map((path: { path: string }) => path.path)
            }
          },
          samTemplateFile: formData.samTemplateFile
        }
      }
    }
    if (connectionType === GitRepoName.Account) {
      set(manifestObj, 'manifest.spec.store.spec.repoName', formData.repoName)
    }

    if (manifestObj.manifest?.spec?.store) {
      if (formData.gitFetchType === 'Branch') {
        set(manifestObj, 'manifest.spec.store.spec.branch', formData.branch)
      } else if (formData.gitFetchType === 'Commit') {
        set(manifestObj, 'manifest.spec.store.spec.commitId', formData.commitId)
      }
    }
    handleSubmit(manifestObj)
  }

  const validationSchema = Yup.object().shape({
    ...ManifestIdentifierValidation(
      getString,
      manifestIdsList,
      initialValues?.identifier,
      getString('pipeline.uniqueName')
    ),
    branch: Yup.string().when('gitFetchType', {
      is: 'Branch',
      then: Yup.string().trim().required(getString('validation.branchName'))
    }),
    commitId: Yup.string().when('gitFetchType', {
      is: 'Commit',
      then: Yup.string().trim().required(getString('validation.commitId'))
    }),
    paths: Yup.lazy((value): Yup.Schema<unknown> => {
      if (getMultiTypeFromValue(value as AcceptableValue) === MultiTypeInputType.FIXED) {
        return Yup.array().of(
          Yup.object().shape({
            path: Yup.string()
              .min(1)
              .required(getString('common.validation.fieldIsRequired', { name: getString('common.git.folderPath') }))
              .test(
                'Check prefix',
                getString('pipeline.manifestType.periodPrefixValidation', { name: getString('common.git.folderPath') }),
                (currPathValue: string) => {
                  return !(currPathValue && currPathValue.startsWith('.'))
                }
              )
          })
        )
      }
      return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
    }),
    repoName: Yup.string().test('repoName', getString('common.validation.repositoryName'), value => {
      if (
        connectionType === GitRepoName.Repo ||
        getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) !== MultiTypeInputType.FIXED
      ) {
        return true
      }
      return !isEmpty(value) && value?.length > 0
    })
  })

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="awsSamDirectoryManifest"
        validationSchema={validationSchema}
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
        {formik => {
          return (
            <FormikForm>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={css.manifestForm}
              >
                <div className={css.manifestStepWidth}>
                  <ManifestDetailsCoreSection
                    formik={formik}
                    selectedManifest={selectedManifest}
                    selectedDeploymentType={selectedDeploymentType}
                    expressions={expressions}
                    allowableTypes={allowableTypes}
                    prevStepData={modifiedPrevStepData}
                    isReadonly={isReadonly}
                    showIdentifierField={showIdentifierField}
                  />

                  <Accordion className={css.advancedStepOpen}>
                    <Accordion.Panel
                      id={getString('advancedTitle')}
                      addDomId={true}
                      summary={getString('advancedTitle')}
                      details={
                        <div
                          className={cx(css.halfWidth, {
                            [css.runtimeInput]:
                              getMultiTypeFromValue(formik.values.samTemplateFile) === MultiTypeInputType.RUNTIME
                          })}
                        >
                          <FormInput.MultiTextInput
                            multiTextInputProps={{
                              expressions,
                              allowableTypes,
                              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                            }}
                            label={getString('optionalField', {
                              name: getString('pipeline.manifestType.awsSamDirectory.samTemplateFile')
                            })}
                            placeholder={getString('common.enterPlaceholder', {
                              name: getString('pipeline.manifestType.awsSamDirectory.samTemplateFile')
                            })}
                            name="samTemplateFile"
                          />

                          {getMultiTypeFromValue(formik.values.samTemplateFile) === MultiTypeInputType.RUNTIME && (
                            <ConfigureOptions
                              value={formik.values.samTemplateFile as string}
                              type="String"
                              variableName="samTemplateFile"
                              showRequiredField={false}
                              showDefaultField={false}
                              onChange={value => formik.setFieldValue('samTemplateFile', value)}
                              isReadonly={isReadonly}
                            />
                          )}
                        </div>
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
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
