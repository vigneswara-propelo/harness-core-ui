/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  SelectOption,
  FormInput,
  FormikForm,
  MultiTypeInputType
} from '@harness/uicore'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { defaultTo, memoize } from 'lodash-es'
import { IItemRendererProps } from '@blueprintjs/select'
import { useStrings } from 'framework/strings'
import {
  ConnectorConfigDTO,
  GARPackageDTO,
  GarRepositoryDTO,
  RegionGar,
  useGetPackagesForGoogleArtifactRegistry,
  useGetRegionsForGoogleArtifactRegistry,
  useGetRepositoriesForGoogleArtifactRegistry
} from 'services/cd-ng'
import type { GarSpec } from 'services/pipeline-ng'
import {
  getConnectorIdValue,
  isAllFieldsAreFixedForFetchingPackages,
  isAllFieldsAreFixedForFetchRepos,
  resetFieldValue
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { NoTagResults } from '@modules/70-pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import { GitQueryParams, ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { useQueryParams } from '@modules/10-common/hooks'
import { EXPRESSION_STRING } from '@modules/70-pipeline/utils/constants'
import ItemRendererWithMenuItem from '@modules/10-common/components/ItemRenderer/ItemRendererWithMenuItem'
import type { ImagePathProps } from '../../../ArtifactInterface'
import css from '../../ArtifactConnector.module.scss'

export const repositoryType: SelectOption[] = [
  { label: 'npm', value: 'npm' },
  { label: 'maven', value: 'maven' },
  { label: 'docker', value: 'docker' },
  { label: 'apt', value: 'apt' },
  { label: 'yum', value: 'yum' },
  { label: 'python', value: 'python' },
  { label: 'kubeflow-pipelines', value: 'kubeflow-pipelines' }
]

function FormComponent(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<GarSpec> & { formik: FormikProps<GarSpec> }
): React.ReactElement {
  const { prevStepData, previousStep, initialValues, formik } = props
  const { getString } = useStrings()
  const [regions, setRegions] = useState<SelectOption[]>([])
  const { data: regionsData } = useGetRegionsForGoogleArtifactRegistry({})
  const [repoSelectItems, setRepoSelectItems] = useState<SelectOption[]>([])
  const [packageSelectItems, setPackageSelectItems] = useState<SelectOption[]>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const connectorRefValue = getConnectorIdValue(prevStepData)
  const projectValue = defaultTo(formik.values.project, initialValues?.project)
  const regionValue = defaultTo(formik.values.region, initialValues?.region)
  const repositoryNameValue = defaultTo(formik.values?.repositoryName, initialValues?.repositoryName)

  const {
    data: repoDetails,
    refetch: refetchRepoDetails,
    loading: fetchingRepos,
    error: fetchRepoError
  } = useGetRepositoriesForGoogleArtifactRegistry({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      project: projectValue,
      region: regionValue
    }
  })

  const {
    data: packageDetails,
    refetch: refetchPackageDetails,
    loading: fetchingPackages,
    error: fetchPackagesError
  } = useGetPackagesForGoogleArtifactRegistry({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      project: projectValue,
      region: regionValue,
      repositoryName: repositoryNameValue
    }
  })

  useEffect(() => {
    if (regionsData?.data) {
      setRegions(
        regionsData?.data?.map((item: RegionGar) => {
          return { label: item.name, value: item.value } as SelectOption
        })
      )
    }
  }, [regionsData])

  useEffect(() => {
    if (fetchRepoError) {
      setRepoSelectItems([])
      return
    }
    const repoItems =
      repoDetails?.data?.garRepositoryDTOList?.map((repo: GarRepositoryDTO) => ({
        value: defaultTo(repo.repository, ''),
        label: defaultTo(repo.repository, '')
      })) || []
    setRepoSelectItems(repoItems)
  }, [repoDetails?.data, fetchRepoError])

  useEffect(() => {
    if (fetchPackagesError) {
      setPackageSelectItems([])
      return
    }
    const packageItems =
      packageDetails?.data?.garPackageDTOList?.map((repo: GARPackageDTO) => ({
        value: defaultTo(repo.packageName, ''),
        label: defaultTo(repo.packageName, '')
      })) || []
    setPackageSelectItems(packageItems)
  }, [packageDetails?.data, fetchPackagesError])

  const getRepos = (): SelectOption[] => {
    if (fetchingRepos) {
      return [
        {
          label: getString('common.loadingFieldOptionsSingular', {
            fieldName: getString('repositories')
          }),
          value: getString('common.loadingFieldOptionsSingular', {
            fieldName: getString('repositories')
          })
        }
      ]
    }
    return defaultTo(repoSelectItems, [])
  }

  const getPackages = (): SelectOption[] => {
    if (fetchingPackages) {
      return [
        {
          label: getString('common.loadingFieldOptionsSingular', {
            fieldName: getString('packagesLabel')
          }),
          value: getString('common.loadingFieldOptionsSingular', {
            fieldName: getString('packagesLabel')
          })
        }
      ]
    }
    return defaultTo(packageSelectItems, [])
  }

  const itemRendererForRepo = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingRepos} />
  ))
  const itemRendererForPackage = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingPackages} />
  ))

  return (
    <FormikForm>
      <div className={cx(css.artifactForm)}>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTextInput
            name="project"
            label={getString('pipelineSteps.projectIDLabel')}
            placeholder={getString('pipeline.artifactsSelection.projectIDPlaceholder')}
            multiTextInputProps={{
              allowableTypes: [MultiTypeInputType.FIXED]
            }}
          />
        </div>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTypeInput
            label={getString('regionLabel')}
            name="region"
            useValue
            placeholder={getString('pipeline.regionPlaceholder')}
            multiTypeInputProps={{
              width: 500,
              allowableTypes: [MultiTypeInputType.FIXED],
              selectProps: {
                allowCreatingNewItems: true,
                items: regions
              }
            }}
            selectItems={regions}
          />
        </div>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTypeInput
            selectItems={getRepos()}
            name="repositoryName"
            label={getString('common.repositoryName')}
            placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
            useValue
            multiTypeInputProps={{
              allowableTypes: [MultiTypeInputType.FIXED],
              selectProps: {
                noResults: (
                  <NoTagResults
                    tagError={fetchRepoError}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={getString('pipeline.artifactsSelection.validation.noRepo')}
                  />
                ),
                itemRenderer: itemRendererForRepo,
                items: getRepos(),
                allowCreatingNewItems: true
              },
              onChange: () => {
                resetFieldValue(formik, 'package')
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                ) {
                  return
                }
                if (isAllFieldsAreFixedForFetchRepos(projectValue, regionValue, connectorRefValue)) {
                  refetchRepoDetails({
                    queryParams: {
                      ...commonParams,
                      connectorRef: connectorRefValue,
                      project: projectValue,
                      region: regionValue
                    }
                  })
                }
              }
            }}
          />
        </div>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTypeInput
            selectItems={getPackages()}
            name="package"
            label={getString('pipeline.testsReports.callgraphField.package')}
            placeholder={getString('pipeline.manifestType.packagePlaceholder')}
            useValue
            multiTypeInputProps={{
              allowableTypes: [MultiTypeInputType.FIXED],

              selectProps: {
                noResults: (
                  <NoTagResults
                    tagError={fetchPackagesError}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={getString('pipeline.artifactsSelection.validation.noPackage')}
                  />
                ),
                itemRenderer: itemRendererForPackage,
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
                if (
                  isAllFieldsAreFixedForFetchingPackages(
                    projectValue,
                    regionValue,
                    repositoryNameValue,
                    connectorRefValue
                  )
                ) {
                  refetchPackageDetails({
                    queryParams: {
                      ...commonParams,
                      connectorRef: connectorRefValue,
                      project: projectValue,
                      region: regionValue,
                      repositoryName: repositoryNameValue
                    }
                  })
                }
              }
            }}
          />
        </div>
      </div>
      <Layout.Horizontal spacing="medium">
        <Button
          variation={ButtonVariation.SECONDARY}
          text={getString('back')}
          icon="chevron-left"
          onClick={() => previousStep?.(prevStepData)}
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
}

export function GoogleArtifactRegistry(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<GarSpec>
): React.ReactElement {
  const { getString } = useStrings()
  const { handleSubmit, initialValues, prevStepData } = props

  const schemaObject = {
    project: Yup.string().required(getString('common.validation.projectIsRequired')),
    region: Yup.string().required(getString('validation.regionRequired')),
    repositoryName: Yup.string().required(getString('common.validation.repositoryName')),
    package: Yup.string().required(getString('common.validation.package'))
  }

  const primarySchema = Yup.object().shape(schemaObject)
  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        formName="imagePath"
        validationSchema={primarySchema}
        onSubmit={formData => {
          handleSubmit({
            ...formData,
            connectorRef: getConnectorIdValue(prevStepData)
          })
        }}
      >
        {formik => {
          return <FormComponent {...props} formik={formik} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
