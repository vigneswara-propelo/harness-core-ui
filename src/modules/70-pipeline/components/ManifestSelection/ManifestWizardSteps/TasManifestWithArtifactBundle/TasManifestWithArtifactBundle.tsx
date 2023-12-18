/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import * as Yup from 'yup'
import { get, defaultTo } from 'lodash-es'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import {
  Layout,
  Button,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  StepProps,
  ButtonVariation,
  AllowedTypes,
  FormikForm,
  FormInput,
  SelectOption
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { AcceptableValue } from '@modules/70-pipeline/components/PipelineInputSetForm/CICodebaseInputSetForm'
import type {
  ManifestTypes,
  TASManifestLastStepPrevStepData,
  TASManifestWithArtifactBuildDataType
} from '../../ManifestInterface'
import { cfCliVersions, getArtifactBundleTypes, ManifestIdentifierValidation } from '../../Manifesthelper'
import DragnDropPaths from '../../DragnDropPaths'
import { filePathWidth, removeEmptyFieldsFromStringArray } from '../ManifestUtils'
import css from '../CommonManifestDetails/CommonManifestDetails.module.scss'

interface TasManifestWithArtifactBundleProps {
  stepName: string
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  selectedManifest: ManifestTypes | null
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
  editManifestModePrevStepData?: TASManifestLastStepPrevStepData
}

export function TasManifestWithArtifactBundle({
  stepName,
  selectedManifest,
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  manifestIdsList,
  isReadonly = false,
  editManifestModePrevStepData
}: StepProps<ConnectorConfigDTO> & TasManifestWithArtifactBundleProps): React.ReactElement {
  const { getString } = useStrings()

  const modifiedPrevStepData = defaultTo(prevStepData, editManifestModePrevStepData)

  const validationSchema = Yup.object().shape({
    ...ManifestIdentifierValidation(
      getString,
      manifestIdsList,
      initialValues?.identifier,
      getString('pipeline.uniqueName')
    ),
    artifactBundleType: Yup.string().required(
      getString('common.validation.fieldIsRequired', {
        name: getString('pipeline.manifestType.artifactBundle.artifactBundleType')
      })
    ),
    deployableUnitPath: Yup.string().required(
      getString('common.validation.fieldIsRequired', {
        name: getString('pipeline.manifestType.artifactBundle.deployableArtifactPath')
      })
    ),
    manifestPath: Yup.string().required(
      getString('common.validation.fieldIsRequired', {
        name: getString('pipelineSteps.manifestPathLabel')
      })
    ),
    varsPaths: Yup.lazy((value): Yup.Schema<unknown> => {
      if (getMultiTypeFromValue(value as unknown as AcceptableValue) === MultiTypeInputType.FIXED) {
        return Yup.array().of(
          Yup.object().shape({
            path: Yup.string().min(1).required(getString('pipeline.manifestType.varsPathRequired'))
          })
        )
      }
      return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
    }),
    autoScalerPath: Yup.lazy((value): Yup.Schema<unknown> => {
      if (getMultiTypeFromValue(value as unknown as AcceptableValue) === MultiTypeInputType.FIXED) {
        return Yup.array().of(
          Yup.object().shape({
            path: Yup.string().min(1).required(getString('pipeline.manifestType.autoScalerPathRequired'))
          })
        )
      }
      return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
    })
  })

  const getInitialValues = (): TASManifestWithArtifactBuildDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        cfCliVersion: initialValues.spec?.cfCliVersion,
        varsPaths:
          typeof initialValues.spec?.varsPaths === 'string'
            ? initialValues.spec?.varsPaths
            : removeEmptyFieldsFromStringArray(initialValues.spec?.varsPaths)?.map((path: string) => ({
                path,
                uuid: uuid(path, nameSpace())
              })),
        autoScalerPath:
          typeof initialValues.spec?.autoScalerPath === 'string'
            ? initialValues.spec?.autoScalerPath
            : removeEmptyFieldsFromStringArray(initialValues.spec?.autoScalerPath)?.map((path: string) => ({
                path,
                uuid: uuid(path, nameSpace())
              }))
      }
    }
    return {
      identifier: '',
      cfCliVersion: 'V7',
      manifestPath: '',
      deployableUnitPath: '',
      artifactBundleType: 'ZIP'
    }
  }

  const submitFormData = (formData: TASManifestWithArtifactBuildDataType & { store?: string }): void => {
    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: formData.identifier,
        type: selectedManifest as ManifestTypes,
        spec: {
          cfCliVersion: formData.cfCliVersion,
          store: {
            type: formData.store,
            spec: {
              manifestPath: formData.manifestPath,
              deployableUnitPath: formData.deployableUnitPath,
              artifactBundleType: formData.artifactBundleType
            }
          },
          varsPaths:
            typeof formData?.varsPaths === 'string'
              ? formData?.varsPaths
              : formData?.varsPaths?.map((path: { path: string }) => path.path),
          autoScalerPath:
            typeof formData?.autoScalerPath === 'string'
              ? formData?.autoScalerPath
              : formData?.autoScalerPath?.map((path: { path: string }) => path.path)
        }
      }
    }

    handleSubmit(manifestObj)
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>

      <Formik<TASManifestWithArtifactBuildDataType>
        initialValues={getInitialValues()}
        formName="tasManifestDetails"
        validationSchema={validationSchema}
        onSubmit={formData => {
          submitFormData({
            ...modifiedPrevStepData,
            ...formData
          })
        }}
      >
        {(formik: FormikProps<TASManifestWithArtifactBuildDataType>) => {
          return (
            <FormikForm>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={css.manifestForm}
              >
                <div className={css.manifestStepWidth}>
                  <div className={css.tasManifestWidth60}>
                    <FormInput.Text
                      name="identifier"
                      label={getString('pipeline.manifestType.manifestIdentifier')}
                      placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                      isIdentifier={true}
                    />
                  </div>
                  <div className={css.tasManifestWidth60}>
                    <FormInput.Select
                      name="cfCliVersion"
                      label={getString('pipeline.manifestType.cfCliVersion')}
                      items={cfCliVersions as SelectOption[]}
                      disabled
                    />
                  </div>

                  <div className={css.tasManifestWidth60}>
                    <FormInput.Select
                      name="artifactBundleType"
                      label={getString('pipeline.manifestType.artifactBundle.artifactBundleType')}
                      items={getArtifactBundleTypes(getString)}
                      disabled={isReadonly}
                    />
                  </div>

                  <div
                    className={cx(css.tasManifestWidth60, {
                      [css.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.deployableUnitPath) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTextInput
                      name="deployableUnitPath"
                      label={getString('pipeline.manifestType.artifactBundle.deployableArtifactPath')}
                      placeholder={getString('common.enterPlaceholder', {
                        name: getString('pipeline.manifestType.artifactBundle.artifactPathPlaceholder')
                      })}
                      multiTextInputProps={{
                        allowableTypes,
                        expressions
                      }}
                    />
                    {getMultiTypeFromValue(formik.values.deployableUnitPath) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        value={formik.values.deployableUnitPath}
                        type="String"
                        variableName="deployableUnitPath"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          formik.setFieldValue('deployableUnitPath', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>

                  <div
                    className={cx(css.tasManifestWidth60, {
                      [css.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.manifestPath) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTextInput
                      name="manifestPath"
                      label={getString('pipelineSteps.manifestPathLabel')}
                      placeholder={getString('common.enterPlaceholder', {
                        name: getString('pipelineSteps.manifestPathLabel')
                      })}
                      multiTextInputProps={{
                        allowableTypes,
                        expressions
                      }}
                    />
                    {getMultiTypeFromValue(formik.values.manifestPath) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        value={formik.values.manifestPath}
                        type="String"
                        variableName="manifestPath"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          formik.setFieldValue('manifestPath', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>

                  {/* VARS AND AUTOSCALER */}
                  <div
                    className={cx({
                      [css.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.varsPaths as string) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <DragnDropPaths
                      formik={formik}
                      expressions={expressions}
                      allowableTypes={allowableTypes}
                      fieldPath="varsPaths"
                      pathLabel={getString('pipeline.manifestType.varsYAMLPath')}
                      placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                      defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
                      dragDropFieldWidth={filePathWidth}
                    />
                    {getMultiTypeFromValue(formik.values.varsPaths as string) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        value={formik.values.varsPaths as string}
                        type={getString('string')}
                        variableName={'varsPaths'}
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={/* istanbul ignore next */ val => formik?.setFieldValue('varsPaths', val)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                  <div
                    className={cx({
                      [css.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.autoScalerPath as string) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <DragnDropPaths
                      formik={formik}
                      expressions={expressions}
                      allowableTypes={allowableTypes}
                      fieldPath="autoScalerPath"
                      pathLabel={getString('pipeline.manifestType.autoScalerYAMLPath')}
                      placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                      defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
                      dragDropFieldWidth={filePathWidth}
                      allowOnlyOneFilePath={true}
                    />
                    {getMultiTypeFromValue(formik.values.autoScalerPath as string) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        value={formik.values.autoScalerPath as string}
                        type={getString('string')}
                        variableName={'autoScalerPath'}
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={/* istanbul ignore next */ val => formik?.setFieldValue('autoScalerPath', val)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
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
