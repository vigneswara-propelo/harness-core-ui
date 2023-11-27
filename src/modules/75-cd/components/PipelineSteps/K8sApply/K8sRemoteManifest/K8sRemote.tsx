import React from 'react'
import {
  Button,
  Formik,
  Layout,
  Heading,
  ButtonVariation,
  FormInput,
  SelectOption,
  getMultiTypeFromValue,
  MultiTypeInputType,
  StepProps,
  AllowedTypes
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import cx from 'classnames'
import { Form, FieldArray } from 'formik'
import { get, defaultTo } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import type { StartupCommandConfiguration } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import type { ManifestStepInitData } from '@pipeline/components/ManifestSelection/ManifestInterface'
import FileStoreSelectField from '@platform/filestore/components/MultiTypeFileSelect/FileStoreSelect/FileStoreSelectField'

import type { ConnectorSelectedValue } from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { GitFetchTypes } from '@pipeline/components/ManifestSelection/Manifesthelper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface K8sRemoteManifestStepTwoProps {
  allowableTypes: AllowedTypes
  isReadonly: boolean
  onSubmitCallBack: (data: ManifestStepInitData | StartupCommandConfiguration) => void
  isTerraformPlan?: boolean
  isBackendConfig?: boolean
  isTerragruntPlan?: boolean
  fieldPath: string
  expressions: string[]
}
interface FormInputPaths {
  connectorRef: string
  repoName: string
  gitFetchType: string
  branch: string
  commitId: string
  paths: string
  useConnectorCredentials: string
  valuesPaths: string
  files: string
}

export const K8sRemoteFile: React.FC<StepProps<ManifestStepInitData> & K8sRemoteManifestStepTwoProps> = props => {
  const { getString } = useStrings()

  const { previousStep, prevStepData, onSubmitCallBack, isReadonly, allowableTypes, name, fieldPath, expressions } =
    props

  const storeType = get(prevStepData, 'manifestSource.spec.store.type')
  const isHarnessStore = storeType === 'Harness'
  const gitFetchTypes: SelectOption[] = [
    { label: getString('gitFetchTypes.fromBranch'), value: GitFetchTypes.Branch },
    { label: getString('gitFetchTypes.fromCommit'), value: GitFetchTypes.Commit }
  ]
  const formInputNames = (path: string): FormInputPaths => ({
    connectorRef: `${path}.store.spec.connectorRef`,
    repoName: `${path}.store.spec.repoName`,
    gitFetchType: `${path}.store.spec.gitFetchType`,
    branch: `${path}.store.spec.branch`,
    commitId: `${path}.store.spec.commitId`,
    paths: `${path}.store.spec.paths`,
    files: `${path}.store.spec.files`,
    useConnectorCredentials: `${path}.moduleSource.useConnectorCredentials`,
    valuesPaths: `${path}.valuesPaths`
  })

  const formikOnChangeNames = (path: string): Omit<FormInputPaths, 'connectorRef' | 'gitFetchType'> => ({
    repoName: `${path}.store.spec.repoName`,
    branch: `${path}.store.spec.branch`,
    commitId: `${path}.store.spec.commitId`,
    paths: `${path}.store.spec.paths`,
    files: `${path}.store.spec.files`,
    useConnectorCredentials: `${path}.moduleSource.useConnectorCredentials`,
    valuesPaths: `${path}.valuesPaths`
  })

  return (
    <Layout.Vertical>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24, fontWeight: 'bold' }} margin={{ bottom: 'xlarge' }}>
        {name}
      </Heading>
      <Formik<ManifestStepInitData>
        formName={'k8sapply'}
        initialValues={prevStepData as ManifestStepInitData}
        validationSchema={Yup.object().shape({
          manifestSource: Yup.object().shape({
            spec: Yup.object().shape({
              store: Yup.object().shape({
                spec: Yup.object().shape({
                  gitFetchType: Yup.string(),
                  branch: Yup.string().when('gitFetchType', {
                    is: GitFetchTypes.Branch,
                    then: Yup.string().trim().required(getString('validation.branchName'))
                  }),
                  commitId: Yup.string().when('gitFetchType', {
                    is: GitFetchTypes.Commit,
                    then: Yup.string().trim().required(getString('validation.commitId'))
                  }),
                  paths: Yup.mixed().when(' ', {
                    is: () => {
                      return !isHarnessStore
                    },
                    then: Yup.lazy(value => {
                      if (!value) {
                        return Yup.string().required(getString('cd.pathCannotBeEmpty'))
                      }
                      return getMultiTypeFromValue(value as boolean) === MultiTypeInputType.FIXED
                        ? Yup.array().of(Yup.string().min(1).required(getString('cd.pathCannotBeEmpty')))
                        : Yup.string()
                    })
                  })
                })
              })
            })
          })
        })}
        onSubmit={data => {
          onSubmitCallBack({
            ...prevStepData,
            manifestSource: {
              type: data?.selectedManifest,
              spec: {
                store: {
                  type: defaultTo(get(data, 'store'), ''),
                  spec: {
                    ...data?.manifestSource?.spec.store.spec,
                    connectorRef:
                      /* istanbul ignore next */
                      ((data?.connectorRef as ConnectorSelectedValue)?.value as string) || data?.connectorRef
                  }
                },
                valuesPaths: defaultTo(get(data, 'manifestSource.spec.valuesPaths'), [])
              }
            }
          } as ManifestStepInitData)
        }}
      >
        {formik => {
          const formikValues = formik?.values
          const store = get(formikValues, `${fieldPath}.store.spec`)

          const commitId = defaultTo(get(store, 'commitId'), '')
          const branch = defaultTo(get(store, 'branch'), '')

          return (
            <Form>
              {isHarnessStore ? (
                <>
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <MultiTypeFieldSelector
                      defaultValueToReset={['']}
                      name={formInputNames(fieldPath).files}
                      label={getString('fileFolderPathText')}
                      allowedTypes={allowableTypes}
                    >
                      <FieldArray
                        name={formInputNames(fieldPath).files}
                        render={arrayHelpers => (
                          <Layout.Vertical>
                            {defaultTo(get(formikValues, `${fieldPath}.store.spec.files`), ['']).map(
                              (path: string, index: number) => (
                                <Layout.Horizontal key={index} data-testid={`${path}-${index}`}>
                                  <FileStoreSelectField
                                    name={`${fieldPath}.store.spec.files[${index}]`}
                                    onChange={(newValue: string) => {
                                      formik?.setFieldValue(`${fieldPath}.store.spec.files[${index}]`, newValue)
                                    }}
                                  />
                                  <Button
                                    variation={ButtonVariation.ICON}
                                    icon="main-trash"
                                    onClick={() => arrayHelpers.remove(index)}
                                    disabled={isReadonly}
                                    data-testid={`removeFileStorePath${index}`}
                                  />
                                </Layout.Horizontal>
                              )
                            )}
                            <span>
                              <Button
                                margin={{ top: 'medium' }}
                                variation={ButtonVariation.LINK}
                                text={getString('addFileText')}
                                onClick={() => {
                                  arrayHelpers.push('')
                                }}
                                disabled={isReadonly}
                                data-testid={`addFilePath-file-store`}
                                icon="add"
                              />
                            </span>
                          </Layout.Vertical>
                        )}
                      />
                    </MultiTypeFieldSelector>
                  </div>
                </>
              ) : (
                <div>
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.Select
                      items={gitFetchTypes}
                      name={formInputNames(fieldPath).gitFetchType}
                      label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                      placeholder={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    />
                  </div>
                  {get(store, 'gitFetchType') === gitFetchTypes[0].value && (
                    <div className={cx(stepCss.formGroup, stepCss.md)}>
                      <FormInput.MultiTextInput
                        label={getString('pipelineSteps.deploy.inputSet.branch')}
                        placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                        name={formInputNames(fieldPath).branch}
                        multiTextInputProps={{ expressions, allowableTypes }}
                      />
                      {getMultiTypeFromValue(branch) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          style={{ alignSelf: 'center', marginTop: 1 }}
                          value={branch as string}
                          type="String"
                          variableName={formInputNames(fieldPath).branch}
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue(formikOnChangeNames(fieldPath).branch, value)
                          }}
                          isReadonly={isReadonly}
                          allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                        />
                      )}
                    </div>
                  )}

                  {get(store, 'gitFetchType') === gitFetchTypes[1].value && (
                    <div className={cx(stepCss.formGroup, stepCss.md)}>
                      <FormInput.MultiTextInput
                        label={getString('pipeline.manifestType.commitId')}
                        placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                        name={formInputNames(fieldPath).commitId}
                        multiTextInputProps={{ expressions, allowableTypes }}
                      />
                      {getMultiTypeFromValue(commitId) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          style={{ alignSelf: 'center', marginTop: 1 }}
                          value={commitId as string}
                          type="String"
                          variableName={formInputNames(fieldPath).commitId}
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue(formikOnChangeNames(fieldPath).commitId, value)
                          }}
                          isReadonly={isReadonly}
                          allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                        />
                      )}
                    </div>
                  )}

                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <MultiTypeFieldSelector
                      defaultValueToReset={['']}
                      name={formInputNames(fieldPath).paths}
                      label={getString('fileFolderPathText')}
                      allowedTypes={allowableTypes}
                    >
                      <FieldArray
                        name={formInputNames(fieldPath).paths}
                        render={arrayHelpers => (
                          <Layout.Vertical>
                            {defaultTo(get(formikValues, `${fieldPath}.store.spec.paths`), [
                              { value: '', id: uuid() }
                            ]).map((path: string, index: number) => (
                              <Layout.Horizontal key={index}>
                                <FormInput.MultiTextInput
                                  label=""
                                  placeholder={getString('cd.filePathPlaceholder')}
                                  name={`${fieldPath}.store.spec.paths[${index}]`}
                                  multiTextInputProps={{
                                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                                    expressions,
                                    textProps: { disabled: isReadonly }
                                  }}
                                  disabled={isReadonly}
                                  style={{ width: '430px' }}
                                  data-testid={`${path}-${index}`}
                                />

                                <Button
                                  variation={ButtonVariation.ICON}
                                  icon="main-trash"
                                  onClick={() => arrayHelpers.remove(index)}
                                  disabled={isReadonly}
                                  data-testid={`removeFilePath${index}`}
                                />
                              </Layout.Horizontal>
                            ))}
                            <span>
                              <Button
                                variation={ButtonVariation.LINK}
                                text={getString('addFileText')}
                                onClick={() => {
                                  arrayHelpers.push('')
                                }}
                                disabled={isReadonly}
                                data-testid={`addFilePath`}
                                icon="add"
                              />
                            </span>
                          </Layout.Vertical>
                        )}
                      />
                    </MultiTypeFieldSelector>
                  </div>
                </div>
              )}
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <MultiTypeFieldSelector
                  defaultValueToReset={['']}
                  name={formInputNames(fieldPath).valuesPaths}
                  label={getString('pipeline.manifestType.valuesYamlPath')}
                  allowedTypes={allowableTypes}
                >
                  <FieldArray
                    name={formInputNames(fieldPath).valuesPaths}
                    render={arrayHelpers => (
                      <Layout.Vertical>
                        {defaultTo(get(formikValues, `${fieldPath}.valuesPaths`), []).map(
                          (path: string, index: number) => (
                            <Layout.Horizontal key={index}>
                              {isHarnessStore ? (
                                <FileStoreSelectField
                                  name={`${fieldPath}.valuesPaths[${index}]`}
                                  onChange={(newValue: string) => {
                                    formik?.setFieldValue(`${fieldPath}.valuesPaths[${index}]`, newValue)
                                  }}
                                />
                              ) : (
                                <FormInput.MultiTextInput
                                  label=""
                                  placeholder={getString('pipeline.manifestType.pathPlaceholder')}
                                  name={`${fieldPath}.valuesPaths[${index}]`}
                                  multiTextInputProps={{
                                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                                    expressions,
                                    textProps: { disabled: isReadonly }
                                  }}
                                  disabled={isReadonly}
                                  style={{ width: '430px' }}
                                  data-testid={`${path}-${index}`}
                                />
                              )}

                              <Button
                                variation={ButtonVariation.ICON}
                                icon="main-trash"
                                onClick={() => arrayHelpers.remove(index)}
                                disabled={isReadonly}
                                data-testid={`removeValuesPath${index}`}
                              />
                            </Layout.Horizontal>
                          )
                        )}
                        <span>
                          <Button
                            variation={ButtonVariation.LINK}
                            text={getString('pipeline.manifestType.addValuesYamlPath')}
                            onClick={() => {
                              arrayHelpers.push('')
                            }}
                            disabled={isReadonly}
                            data-testid={`addValuesPath`}
                            icon="add"
                          />
                        </span>
                      </Layout.Vertical>
                    )}
                  />
                </MultiTypeFieldSelector>
              </div>
              <Layout.Horizontal spacing="xxlarge">
                <Button
                  text={getString('back')}
                  variation={ButtonVariation.SECONDARY}
                  icon="chevron-left"
                  onClick={() => {
                    previousStep?.(prevStepData)
                  }}
                  data-testid={'previous-button'}
                  data-name="tf-remote-back-btn"
                />
                <Button
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('submit')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
