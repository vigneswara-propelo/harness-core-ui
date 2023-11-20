/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import {
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  SelectOption,
  FormikForm
} from '@harness/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import type { FormikProps, FormikValues } from 'formik'
import * as Yup from 'yup'
import { defaultTo, get, isEqual, memoize, merge, filter, isUndefined, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { IItemRendererProps } from '@blueprintjs/select'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import {
  ArtifactoryImagePath,
  ConnectorConfigDTO,
  DockerBuildDetailsDTO,
  Failure,
  Error,
  useGetBuildDetailsForArtifactoryArtifact,
  useGetImagePathsForArtifactory,
  ServiceDefinition
} from 'services/cd-ng'
import {
  checkIfQueryParamsisNotEmpty,
  defaultArtifactInitialValues,
  getArtifactFormData,
  getArtifactPathToFetchTags,
  getConnectorIdValue,
  getFinalArtifactFormObj,
  resetTag,
  shouldFetchFieldOptions,
  helperTextData,
  getConnectorRefQueryData,
  shouldHideHeaderAndNavBtns,
  isTemplateView,
  resetFieldValue,
  getLabelValueObject
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import {
  getHelpeTextForTags,
  isAzureWebAppDeploymentType,
  isAzureWebAppOrSshWinrmGenericDeploymentType,
  isCustomDeploymentType,
  isServerlessDeploymentType,
  isSshOrWinrmDeploymentType,
  isTASDeploymentType,
  repositoryFormats,
  RepositoryFormatTypes,
  isAWSLambdaDeploymentType
} from '@pipeline/utils/stageHelpers'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import {
  TagTypes,
  ArtifactType,
  ImagePathProps,
  ImagePathTypes,
  ARTIFACT_FILTER_TYPES
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ArtifactIdentifierValidation, filterTypeOptions, ModalViewFor, tagOptions } from '../../../ArtifactHelper'
import { NoTagResults, selectItemsMapper } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import ServerlessArtifactoryRepository from './ServerlessArtifactoryRepository'
import { ArtifactoryArtifactDigestField } from './ArtifactoryDigestField'
import css from '../../ArtifactConnector.module.scss'

const getRepositoryValue = (
  formData: ImagePathTypes & { connectorId?: string },
  isGenericArtifactory = /* istanbul ignore next */ false
): string => {
  if (isGenericArtifactory) {
    /* istanbul ignore if */
    if ((formData?.repository as SelectOption)?.value) {
      return (formData?.repository as SelectOption)?.value as string
    }
  }
  return formData?.repository as string
}

const getRepositoryFormat = (values: ImagePathTypes & { spec?: any }): string | undefined => {
  return defaultTo(values?.spec?.repositoryFormat, values?.repositoryFormat)
}

function Artifactory({
  context,
  handleSubmit,
  expressions,
  allowableTypes,
  prevStepData,
  initialValues,
  previousStep,
  artifactIdentifiers,
  isReadonly = false,
  selectedArtifact,
  selectedDeploymentType = /* istanbul ignore next */ '',
  isMultiArtifactSource,
  formClassName = '',
  editArtifactModePrevStepData
}: StepProps<ConnectorConfigDTO> & ImagePathProps<ImagePathTypes>): React.ReactElement {
  const { getString } = useStrings()

  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)

  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!isMultiArtifactSource
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)
  const isArtifactTemplate = isTemplateView(context)
  const [lastQueryData, setLastQueryData] = useState({ artifactPath: '', repository: '', artifactFilter: '' })
  const [tagList, setTagList] = useState<DockerBuildDetailsDTO[] | undefined>([])
  const isServerlessDeploymentTypeSelected = isServerlessDeploymentType(selectedDeploymentType)
  const isSSHWinRmDeploymentType = isSshOrWinrmDeploymentType(selectedDeploymentType)
  const isAzureWebAppDeploymentTypeSelected = isAzureWebAppDeploymentType(selectedDeploymentType)
  const isCustomDeploymentTypeSelected = isCustomDeploymentType(selectedDeploymentType)
  const isTasDeploymentTypeSelected = isTASDeploymentType(selectedDeploymentType)
  const isAWSLambdaDeploymentTypeSelected = isAWSLambdaDeploymentType(selectedDeploymentType)
  const { CDS_ARTIFACTORY_REPOSITORY_URL_MANDATORY } = useFeatureFlags()

  const showRepositoryFormatForAllowedTypes =
    isSSHWinRmDeploymentType ||
    isAzureWebAppDeploymentTypeSelected ||
    isCustomDeploymentTypeSelected ||
    isTasDeploymentTypeSelected ||
    isArtifactTemplate

  // For Serverless and AWS Lambda, there is not dropdown for repositoryFormat to select from
  // By default, UI should be rendered assuming repositoryFormat is Generic
  const shouldChooseGenericAsDefault = isServerlessDeploymentTypeSelected || isAWSLambdaDeploymentTypeSelected

  const getRepositoryFormatForInitialization = () => {
    let repoFormat = RepositoryFormatTypes.Docker
    if (shouldChooseGenericAsDefault) repoFormat = RepositoryFormatTypes.Generic
    if (showRepositoryFormatForAllowedTypes) {
      const repoFormatFromValues = getRepositoryFormat(initialValues) as RepositoryFormatTypes
      repoFormat = repoFormatFromValues ? repoFormatFromValues : RepositoryFormatTypes.Generic
    }

    return repoFormat
  }

  const [repositoryFormat, setRepositoryFormat] = useState<string | undefined>(getRepositoryFormatForInitialization())
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [artifactPaths, setArtifactPaths] = useState<SelectOption[]>([])
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const isAzureWebAppGenericTypeSelected = isAzureWebAppOrSshWinrmGenericDeploymentType(
    selectedDeploymentType,
    getRepositoryFormat(initialValues)
  )
  const [isAzureWebAppGeneric, setIsAzureWebAppGeneric] = useState<boolean>(isAzureWebAppGenericTypeSelected)

  const isGenericArtifactory = React.useMemo(() => {
    return repositoryFormat === RepositoryFormatTypes.Generic
  }, [repositoryFormat])

  useEffect(() => {
    const evaluatedRepoformat = getRepositoryFormatForInitialization()
    setRepositoryFormat(evaluatedRepoformat)
  }, [])

  const schemaObject = {
    artifactPath: Yup.lazy(value =>
      typeof value === 'object'
        ? Yup.object().required(getString('pipeline.artifactsSelection.validation.artifactPath')) // typeError is necessary here, otherwise we get a bad-looking yup error
        : Yup.string().required(getString('pipeline.artifactsSelection.validation.artifactPath'))
    ),
    repository: Yup.lazy(value =>
      typeof value === 'object'
        ? Yup.object().required(getString('common.git.validation.repoRequired')) // typeError is necessary here, otherwise we get a bad-looking yup error
        : Yup.string().required(getString('common.git.validation.repoRequired'))
    ),
    tagType: Yup.string().required(),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.tag'))
    }),
    ...(CDS_ARTIFACTORY_REPOSITORY_URL_MANDATORY && {
      repositoryUrl: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.repositoryUrl'))
    })
  }

  const serverlessArtifactorySchema = {
    repository: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
    filterType: Yup.string(),
    artifactDirectory: Yup.mixed().when('filterType', {
      is: ARTIFACT_FILTER_TYPES.DIRECTORY,
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactDirectory'))
    }),
    artifactFilter: Yup.mixed().when('filterType', {
      is: ARTIFACT_FILTER_TYPES.FILTER,
      then: Yup.lazy(value =>
        typeof value === 'object'
          ? Yup.object().required(getString('pipeline.artifactsSelection.validation.artifactsFilter')) // typeError is necessary here, otherwise we get a bad-looking yup error
          : Yup.string().required(getString('pipeline.artifactsSelection.validation.artifactsFilter'))
      )
    }),
    tagType: Yup.string().required(),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactPathFilter'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.artifactPath'))
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)

  const serverlessPrimarySchema = Yup.object().shape(serverlessArtifactorySchema)

  const connectorRef = getConnectorIdValue(modifiedPrevStepData)

  const sidecarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      getString,
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const serverlessSidecarSchema = Yup.object().shape({
    ...serverlessArtifactorySchema,
    ...ArtifactIdentifierValidation(
      getString,
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const isArtifactDisabled = (formik: FormikProps<ImagePathTypes>) => {
    if (
      getMultiTypeFromValue(formik?.values?.repository) === MultiTypeInputType.RUNTIME ||
      getMultiTypeFromValue(modifiedPrevStepData?.connectorId) === MultiTypeInputType.RUNTIME
    )
      return true
    return !(
      (formik.values?.repository as SelectOption)?.value?.toString()?.length ||
      formik.values?.repository?.toString()?.length
    )
  }

  const {
    data,
    loading: artifactoryBuildDetailsLoading,
    refetch: refetchArtifactoryTag,
    error: artifactoryTagError
  } = useGetBuildDetailsForArtifactoryArtifact({
    queryParams: {
      artifactPath: lastQueryData.artifactPath || undefined,
      artifactFilter: lastQueryData.artifactFilter || undefined,
      repository: lastQueryData.repository,
      repositoryFormat,
      connectorRef: getConnectorRefQueryData(modifiedPrevStepData),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true,
    debounce: 300
  })

  const {
    data: imagePathData,
    loading: imagePathLoading,
    refetch: refetchImagePathData,
    error: imagePathError
  } = useGetImagePathsForArtifactory({
    queryParams: {
      repository: lastQueryData.repository,
      connectorRef: getConnectorRefQueryData(modifiedPrevStepData),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (imagePathLoading) {
      setArtifactPaths([{ label: getString('loading'), value: getString('loading') }])
    }
    if ((imagePathError?.data as Failure)?.status === 'ERROR') {
      const errorMessage = (imagePathError?.data as Failure)?.message as string
      setArtifactPaths([{ label: errorMessage, value: errorMessage }])
    } else if ((imagePathError?.data as Failure)?.status === 'FAILURE') {
      const erroObj = (imagePathError?.data as Failure)?.errors?.[0]
      const errorMessage =
        erroObj?.fieldId && erroObj?.error ? `${erroObj?.fieldId} ${erroObj?.error}` : getString('somethingWentWrong')
      setArtifactPaths([{ label: errorMessage, value: errorMessage }])
    }
  }, [imagePathLoading, imagePathError])

  useEffect(() => {
    if (imagePathData) {
      setArtifactPaths(
        imagePathData.data?.imagePaths?.map((imagePath: ArtifactoryImagePath) => ({
          label: imagePath.imagePath || '',
          value: imagePath.imagePath || ''
        })) || []
      )
    }
  }, [imagePathData, connectorRef])

  useEffect(() => {
    const filteredQueryData: { artifactFilter?: string; repository: string; artifactPath?: string } = {
      ...lastQueryData
    }
    if (isEmpty(lastQueryData.artifactFilter) && !isEmpty(lastQueryData.artifactPath)) {
      delete filteredQueryData.artifactFilter
    } else if (!isEmpty(lastQueryData.artifactFilter) && isEmpty(lastQueryData.artifactPath)) {
      delete filteredQueryData.artifactPath
    }
    if (checkIfQueryParamsisNotEmpty(Object.values(filteredQueryData))) {
      refetchArtifactoryTag()
    }
  }, [lastQueryData, refetchArtifactoryTag])
  useEffect(() => {
    if (artifactoryTagError && tagList?.length) {
      setTagList([])
    } else if (Array.isArray(data?.data?.buildDetailsList) && !isEqual(data?.data?.buildDetailsList, tagList)) {
      setTagList(data?.data?.buildDetailsList)
    }
  }, [data?.data?.buildDetailsList, artifactoryTagError])

  const canFetchTags = useCallback(
    (artifactPath: string, repository: string, artifactFilter: string, filterType: ARTIFACT_FILTER_TYPES): boolean => {
      return !!(
        (lastQueryData.artifactPath !== artifactPath ||
          lastQueryData.repository !== repository ||
          lastQueryData.artifactFilter !== artifactFilter) &&
        shouldFetchFieldOptions(modifiedPrevStepData, [
          filterType === ARTIFACT_FILTER_TYPES.FILTER ? artifactFilter : artifactPath,
          repository
        ])
      )
    },
    [lastQueryData, modifiedPrevStepData]
  )
  const fetchTags = useCallback(
    (
      artifactPath = /* istanbul ignore next */ '',
      repository = /* istanbul ignore next */ '',
      artifactFilter = '',
      filterType = ARTIFACT_FILTER_TYPES.DIRECTORY
    ): void => {
      if (canFetchTags(artifactPath, repository, artifactFilter, filterType)) {
        setLastQueryData({
          artifactPath,
          repository,
          artifactFilter
        })
      }
    },
    [canFetchTags]
  )

  const isTagDisabled = useCallback((formikValue): boolean => {
    return !checkIfQueryParamsisNotEmpty([formikValue.artifactPath, formikValue.repository])
  }, [])

  const isArtifactPathDisabled = useCallback((formikValue): boolean => {
    return !checkIfQueryParamsisNotEmpty([
      formikValue.artifactDirectory || formikValue.artifactFilter,
      formikValue.repository
    ])
  }, [])

  const getInitialValues = useCallback((): ImagePathTypes => {
    const artifactFormDataValues = getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed,
      selectedDeploymentType as ServiceDefinition['type'],
      isGenericArtifactory
    ) as ImagePathTypes
    if (
      getMultiTypeFromValue(artifactFormDataValues.artifactPath) === MultiTypeInputType.FIXED &&
      (artifactFormDataValues.artifactPath as string)?.length
    ) {
      artifactFormDataValues.artifactPath = getLabelValueObject(artifactFormDataValues?.artifactPath as string)
    }
    artifactFormDataValues.digest =
      getMultiTypeFromValue(artifactFormDataValues.digest) === MultiTypeInputType.FIXED &&
      artifactFormDataValues.tagType === TagTypes.Value &&
      !isUndefined(artifactFormDataValues.digest)
        ? getLabelValueObject(artifactFormDataValues.digest)
        : artifactFormDataValues.digest
    return artifactFormDataValues
  }, [initialValues, selectedArtifact, isIdentifierAllowed, isGenericArtifactory])

  const submitFormData = (formData: ImagePathTypes & { connectorId?: string }): void => {
    const artifactObj = getFinalArtifactFormObj(formData, isIdentifierAllowed, isGenericArtifactory)
    merge(artifactObj.spec, {
      repository: getRepositoryValue(formData, isGenericArtifactory),
      repositoryUrl: formData?.repositoryUrl,
      repositoryFormat: isArtifactTemplate ? defaultTo(formData.repositoryFormat, repositoryFormat) : repositoryFormat,
      digest: defaultTo(formData?.digest?.value, formData?.digest)
    })

    if (isAzureWebAppGeneric) {
      delete artifactObj?.spec?.repositoryUrl
    }
    if (isGenericArtifactory) {
      delete artifactObj?.spec?.digest
    }
    handleSubmit(artifactObj)
  }

  const handleValidate = (formData: ImagePathTypes & { connectorId?: string }) => {
    if (hideHeaderAndNavBtns) {
      submitFormData({
        ...modifiedPrevStepData,
        ...formData,
        repository: defaultTo((formData?.repository as SelectOption)?.value, formData?.repository) as string,
        artifactPath: defaultTo((formData?.artifactPath as SelectOption)?.value, formData?.artifactPath) as string,
        tag: defaultTo(formData?.tag?.value, formData?.tag),
        connectorId: getConnectorIdValue(modifiedPrevStepData)
      })
    }
  }

  const getValidationSchema = useCallback(() => {
    if (isGenericArtifactory) {
      if (isIdentifierAllowed) {
        return serverlessSidecarSchema
      }
      return serverlessPrimarySchema
    }
    if (isIdentifierAllowed) {
      return sidecarSchema
    }
    return primarySchema
  }, [context, isGenericArtifactory, primarySchema, serverlessPrimarySchema, sidecarSchema])

  const loadingPlaceholderText = shouldChooseGenericAsDefault
    ? getString('pipeline.artifactsSelection.loadingArtifactPaths')
    : getString('pipeline.artifactsSelection.loadingTags')

  const getSelectItems = useCallback(selectItemsMapper.bind(null, tagList, isGenericArtifactory), [
    tagList,
    isGenericArtifactory
  ])

  const tags = React.useMemo(
    () =>
      artifactoryBuildDetailsLoading
        ? [{ label: loadingPlaceholderText, value: loadingPlaceholderText }]
        : defaultTo(
            filter(getSelectItems(), (option: SelectOption) => option?.label && option?.value),
            []
          ),
    [artifactoryBuildDetailsLoading, loadingPlaceholderText, getSelectItems]
  ) as SelectOption[]

  const itemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={artifactoryBuildDetailsLoading} />
  ))

  const imagePathItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => {
    const isDisabled =
      imagePathLoading ||
      (imagePathError?.data as Error)?.status === 'ERROR' ||
      (imagePathError?.data as Failure)?.status === 'FAILURE'
    return <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={isDisabled} />
  })

  const onTagInputFocus = (e: React.FocusEvent<HTMLInputElement>, formik: FormikValues): void => {
    if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
      return
    }
    const artifactPathValue: SelectOption | string = getArtifactPathToFetchTags(formik, true, isGenericArtifactory)
    fetchTags(
      defaultTo((artifactPathValue as SelectOption)?.value, artifactPathValue),
      defaultTo(formik.values?.repository?.value, formik.values?.repository),
      defaultTo(formik.values?.artifactFilter?.value, formik.values?.artifactFilter),
      formik.values?.filterType
    )
  }

  const getTagFieldHelperText = (formikForm: FormikProps<ImagePathTypes>) => {
    return (
      getMultiTypeFromValue(formikForm.values?.tag) === MultiTypeInputType.FIXED &&
      getHelpeTextForTags(
        helperTextData(selectedArtifact, formikForm, getConnectorIdValue(modifiedPrevStepData)),
        getString,
        isGenericArtifactory
      )
    )
  }

  const getErrorTextForArtifactPath = (formik: FormikValues) => {
    if (!isGenericArtifactory) return undefined
    if (formik?.values?.filterType === ARTIFACT_FILTER_TYPES.DIRECTORY) {
      return getString('pipeline.noArtifactPaths', {
        filterField: getString('pipeline.artifactsSelection.artifactDirectory')
      })
    }
    return getString('pipeline.noArtifactPaths', {
      filterField: getString('pipeline.artifactsSelection.artifactFilter')
    })
  }

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.artifactsSelection.artifactDetails')}
        </Text>
      )}
      <Formik
        initialValues={getInitialValues()}
        formName="artifactoryArtifact"
        validationSchema={getValidationSchema()}
        validate={handleValidate}
        onSubmit={formData => {
          submitFormData({
            ...modifiedPrevStepData,
            ...formData,
            repository: defaultTo((formData?.repository as SelectOption)?.value, formData?.repository) as string,
            artifactPath: defaultTo((formData?.artifactPath as SelectOption)?.value, formData?.artifactPath) as string,
            tag: defaultTo(formData?.tag?.value, formData?.tag),
            connectorId: getConnectorIdValue(modifiedPrevStepData)
          })
        }}
      >
        {formik => {
          const onChangeImageArtifactPath = (): void => {
            tagList?.length && setTagList([])
            resetTag(formik)
          }
          return (
            <FormikForm>
              <div className={cx(css.artifactForm, formClassName)}>
                {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
                {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
                {showRepositoryFormatForAllowedTypes && (
                  <div className={css.imagePathContainer}>
                    <FormInput.Select
                      name="repositoryFormat"
                      label={getString('common.repositoryFormat')}
                      items={repositoryFormats}
                      onChange={selectedRepoFormatValue => {
                        setTagList([])
                        setArtifactPaths([])
                        setRepositoryFormat(selectedRepoFormatValue?.value as string)
                        if (selectedArtifact) {
                          formik.setValues({
                            ...defaultArtifactInitialValues(selectedArtifact),
                            identifier: formik.values.identifier,
                            repositoryFormat: selectedRepoFormatValue?.value
                          })
                        }
                        setIsAzureWebAppGeneric(
                          showRepositoryFormatForAllowedTypes &&
                            selectedRepoFormatValue?.value === RepositoryFormatTypes.Generic
                        )
                        resetFieldValue(formik, 'digest')
                      }}
                    />
                  </div>
                )}

                <ServerlessArtifactoryRepository
                  connectorRef={getConnectorIdValue(modifiedPrevStepData)}
                  isReadonly={isReadonly}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  formik={formik}
                  repoFormat={repositoryFormat}
                  fieldName={'repository'}
                  stepViewType={StepViewType.Edit}
                  onChange={(value: SelectOption) => {
                    if (
                      value.value !== formik.values.repository &&
                      getMultiTypeFromValue(value) === MultiTypeInputType.FIXED &&
                      value
                    ) {
                      setArtifactPaths([])
                      setTagList([])
                      if (isGenericArtifactory) {
                        formik.setValues({
                          ...formik.values,
                          repository: value.value as string,
                          artifactDirectory:
                            getMultiTypeFromValue(get(formik.values, 'artifactDirectory', '')) ===
                            MultiTypeInputType.FIXED
                              ? ''
                              : get(formik.values, 'artifactDirectory', ''),
                          tag:
                            getMultiTypeFromValue(get(formik.values, 'tag', '')) === MultiTypeInputType.FIXED
                              ? ''
                              : get(formik.values, 'tag', ''),
                          tagRegex:
                            getMultiTypeFromValue(get(formik.values, 'tagRegex', '')) === MultiTypeInputType.FIXED
                              ? ''
                              : get(formik.values, 'tagRegex', '')
                        })
                      } else {
                        formik.setValues({
                          ...formik.values,
                          repository: value.value as string,
                          artifactPath:
                            getMultiTypeFromValue(get(formik.values, 'artifactPath', '')) === MultiTypeInputType.FIXED
                              ? ''
                              : get(formik.values, 'artifactPath', ''),
                          tag:
                            getMultiTypeFromValue(get(formik.values, 'tag', '')) === MultiTypeInputType.FIXED
                              ? ''
                              : get(formik.values, 'tag', ''),
                          tagRegex:
                            getMultiTypeFromValue(get(formik.values, 'tagRegex', '')) === MultiTypeInputType.FIXED
                              ? ''
                              : get(formik.values, 'tagRegex', '')
                        })
                      }
                    }
                  }}
                />

                {isGenericArtifactory && (
                  <>
                    <div className={cx(css.tagGroup, css.marginBottom)}>
                      <FormInput.RadioGroup
                        name="filterType"
                        radioGroup={{ inline: true }}
                        items={filterTypeOptions}
                        className={css.radioGroup}
                        onChange={e => {
                          resetFieldValue(formik, 'tagRegex')
                          resetFieldValue(formik, 'tag')
                          resetFieldValue(formik, 'digest')
                          formik.setValues({
                            ...formik.values,
                            filterType: e?.currentTarget?.value as ARTIFACT_FILTER_TYPES,
                            tagType: TagTypes.Value,
                            artifactDirectory: '',
                            artifactFilter: ''
                          })
                        }}
                      />
                    </div>

                    {formik.values?.filterType === ARTIFACT_FILTER_TYPES.DIRECTORY ? (
                      <div key={formik.values?.filterType} className={css.imagePathContainer}>
                        <FormInput.MultiTextInput
                          label={getString('pipeline.artifactsSelection.artifactDirectory')}
                          name="artifactDirectory"
                          placeholder={getString('pipeline.artifactsSelection.artifactDirectoryPlaceholder')}
                          multiTextInputProps={{
                            expressions,
                            allowableTypes
                          }}
                          onChange={() => {
                            resetTag(formik)
                          }}
                        />
                        {getMultiTypeFromValue(formik.values.artifactDirectory) === MultiTypeInputType.RUNTIME && (
                          <div className={css.configureOptions}>
                            <ConfigureOptions
                              style={{ alignSelf: 'center' }}
                              value={formik.values?.artifactDirectory as string}
                              type={getString('string')}
                              variableName="artifactDirectory"
                              showRequiredField={false}
                              showDefaultField={false}
                              onChange={value => {
                                formik.setFieldValue('artifactDirectory', value)
                              }}
                              isReadonly={isReadonly}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div key={formik.values?.filterType} className={css.imagePathContainer}>
                        <FormInput.MultiTextInput
                          label={getString('pipeline.artifactsSelection.artifactFilter')}
                          name="artifactFilter"
                          placeholder={getString('pipeline.artifactsSelection.artifactFilterPlaceholder')}
                          multiTextInputProps={{
                            expressions,
                            allowableTypes
                          }}
                          onChange={() => {
                            resetTag(formik)
                          }}
                        />
                        {getMultiTypeFromValue(formik.values.artifactFilter) === MultiTypeInputType.RUNTIME && (
                          <div className={css.configureOptions}>
                            <ConfigureOptions
                              style={{ alignSelf: 'center' }}
                              value={formik.values?.artifactFilter as string}
                              type={getString('string')}
                              variableName="artifactFilter"
                              showRequiredField={false}
                              showDefaultField={false}
                              onChange={value => {
                                formik.setFieldValue('artifactFilter', value)
                              }}
                              isReadonly={isReadonly}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {isGenericArtifactory ? null : (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTypeInput
                      selectItems={artifactPaths}
                      helperText={
                        getMultiTypeFromValue(formik?.values?.artifactPath) === MultiTypeInputType.FIXED &&
                        getHelpeTextForTags(
                          {
                            repository: formik.values?.repository as string,
                            connectorRef: getConnectorIdValue(modifiedPrevStepData)
                          },
                          getString,
                          isGenericArtifactory,
                          getString('pipeline.artifactOrImagePathDependencyRequired')
                        )
                      }
                      multiTypeInputProps={{
                        onChange: () => {
                          onChangeImageArtifactPath()
                        },
                        expressions,
                        allowableTypes,
                        selectProps: {
                          items: artifactPaths,
                          addClearBtn: true,
                          itemRenderer: imagePathItemRenderer,
                          allowCreatingNewItems: true,
                          addTooltip: true
                        },
                        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                          if (
                            e?.target?.type !== 'text' ||
                            (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                          ) {
                            return
                          }
                          if (!isArtifactDisabled(formik)) {
                            refetchImagePathData({
                              queryParams: {
                                repository: (formik.values?.repository as string) || '',
                                connectorRef: getConnectorRefQueryData(modifiedPrevStepData),
                                accountIdentifier: accountId,
                                orgIdentifier,
                                projectIdentifier
                              }
                            })
                          }
                        }
                      }}
                      label={getString('pipeline.artifactImagePathLabel')}
                      name="artifactPath"
                      placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
                      className={css.tagInputButton}
                    />
                    {getMultiTypeFromValue(formik.values?.artifactPath) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.artifactPath as string}
                          type="String"
                          variableName="artifactPath"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('artifactPath', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                )}
                {!isGenericArtifactory && (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('repositoryUrlLabel')}
                      name="repositoryUrl"
                      placeholder={getString('pipeline.repositoryUrlPlaceholder')}
                      multiTextInputProps={{
                        expressions,
                        allowableTypes
                      }}
                      isOptional={!CDS_ARTIFACTORY_REPOSITORY_URL_MANDATORY}
                    />
                    {getMultiTypeFromValue(formik.values.repositoryUrl) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          style={{ alignSelf: 'center' }}
                          value={formik.values?.repositoryUrl as string}
                          type={getString('string')}
                          variableName="repositoryUrl"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('repositoryUrl', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className={cx(css.tagGroup, css.marginBottom)}>
                  {formik.values?.filterType === ARTIFACT_FILTER_TYPES.DIRECTORY && (
                    <FormInput.RadioGroup
                      label={
                        isGenericArtifactory ? getString('pipeline.artifactsSelection.artifactDetails') : undefined
                      }
                      name="tagType"
                      radioGroup={{ inline: true }}
                      items={tagOptions}
                      className={css.radioGroup}
                      onChange={() => {
                        resetFieldValue(formik, 'tagRegex')
                        resetFieldValue(formik, 'tag')
                        resetFieldValue(formik, 'digest')
                      }}
                    />
                  )}
                </div>
                {formik.values?.tagType === 'value' ? (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTypeInput
                      selectItems={tags}
                      disabled={
                        isGenericArtifactory ? isArtifactPathDisabled(formik?.values) : isTagDisabled(formik?.values)
                      }
                      helperText={getTagFieldHelperText(formik)}
                      multiTypeInputProps={{
                        expressions,
                        allowableTypes,
                        selectProps: {
                          defaultSelectedItem: formik.values?.tag,
                          noResults: (
                            <NoTagResults
                              tagError={artifactoryTagError}
                              defaultErrorText={getErrorTextForArtifactPath(formik)}
                            />
                          ),
                          items: tags,
                          addClearBtn: true,
                          itemRenderer: itemRenderer,
                          allowCreatingNewItems: true,
                          addTooltip: true
                        },
                        onFocus: (e: React.FocusEvent<HTMLInputElement>) => onTagInputFocus(e, formik)
                      }}
                      label={isGenericArtifactory ? getString('pipeline.artifactPathLabel') : getString('tagLabel')}
                      name="tag"
                      className={css.tagInputButton}
                    />

                    {getMultiTypeFromValue(formik.values?.tag) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.tag}
                          type="String"
                          variableName="tag"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('tag', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                {formik.values?.tagType === 'regex' ? (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={
                        isGenericArtifactory ? getString('pipeline.artifactPathFilterLabel') : getString('tagRegex')
                      }
                      name="tagRegex"
                      placeholder={getString('pipeline.artifactsSelection.existingDocker.enterTagRegex')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.tagRegex) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.tagRegex}
                          type="String"
                          variableName="tagRegex"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('tagRegex', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                ) : null}
                {!isGenericArtifactory && (
                  <ArtifactoryArtifactDigestField
                    repositoryFormat={repositoryFormat as string}
                    formik={formik}
                    expressions={expressions}
                    allowableTypes={allowableTypes}
                    isReadonly={isReadonly}
                    connectorRefValue={connectorRef}
                    isTagDetailsLoading={artifactoryBuildDetailsLoading}
                  />
                )}
              </div>
              {!hideHeaderAndNavBtns && (
                <Layout.Horizontal spacing="medium">
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
              )}
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
export default Artifactory
