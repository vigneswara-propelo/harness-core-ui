/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AllowedTypes,
  Container,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  PageError,
  RUNTIME_INPUT_VALUE,
  SelectOption
} from '@harness/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { CF_DEFAULT_PAGE_SIZE, getErrorMessage } from '@cf/utils/CFUtils'
import { GetEnvironmentListQueryParams, useGetEnvironmentList } from 'services/cd-ng'
import { GetAllFeaturesQueryParams, GetFeatureFlagQueryParams, useGetAllFeatures, useGetFeatureFlag } from 'services/cf'
import { useStrings } from 'framework/strings'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import type { FlagConfigurationStepData } from './types'
import FlagChanges from './FlagChanges/FlagChanges'
import FlagChangesV2 from './FlagChangesV2/FlagChanges'
import preProcessFormValues from './preProcessFormValues'
import flagChangesValidationSchema from './FlagChanges/flagChangesValidationSchema'
import flagChangesValidationSchemaV2 from './FlagChangesV2/flagChangesValidationSchema'
import FlagChangesContextProvider from './FlagChangesContextProvider'

export interface FlagConfigurationStepWidgetProps {
  initialValues: FlagConfigurationStepData
  isNewStep?: boolean
  readonly?: boolean
  onUpdate: (data: FlagConfigurationStepData) => void
  stepViewType?: StepViewType
  allowableTypes: AllowedTypes
}

// eslint-disable-next-line react/display-name
const FlagConfigurationStepWidget = forwardRef(
  (
    { initialValues, onUpdate, isNewStep, readonly, stepViewType, allowableTypes }: FlagConfigurationStepWidgetProps,
    formikRef: StepFormikFowardRef<FlagConfigurationStepData>
  ) => {
    const expressionSupportEnabled = useFeatureFlag(FeatureFlag.FFM_8261_EXPRESSIONS_IN_PIPELINE_STEP)

    const [isInitialRender, setIsInitialRender] = useState<boolean>(true)
    const formValuesRef = useRef<FlagConfigurationStepData>({} as FlagConfigurationStepData)
    const { getString } = useStrings()
    const [envType, setEnvType] = useState<MultiTypeInputType>()
    const [flagType, setFlagType] = useState<MultiTypeInputType>()

    const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()

    const envQueryParams: GetEnvironmentListQueryParams = {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier
    }

    const {
      data: environmentsData,
      loading: loadingEnvironments,
      error: errorEnvironments,
      refetch: refetchEnvironments
    } = useGetEnvironmentList({
      queryParams: envQueryParams,
      debounce: 250,
      lazy: true
    })

    const featureQueryParams: GetAllFeaturesQueryParams = {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      pageNumber: 0
    }

    const {
      data: featuresData,
      loading: loadingFeatures,
      error: errorFeatures,
      refetch: refetchFeatures
    } = useGetAllFeatures({ queryParams: featureQueryParams, debounce: 250, lazy: true })

    const loading = loadingEnvironments || loadingFeatures
    const error = errorEnvironments || errorFeatures

    const initialFormValues = useMemo(
      () => preProcessFormValues(initialValues, featuresData, projectIdentifier, orgIdentifier),
      [initialValues, featuresData, projectIdentifier, orgIdentifier]
    )

    let allowedTypes =
      !orgIdentifier || !projectIdentifier ? ([MultiTypeInputType.RUNTIME] as AllowedTypes) : allowableTypes

    if (expressionSupportEnabled) {
      allowedTypes =
        !orgIdentifier || !projectIdentifier
          ? ([MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION] as AllowedTypes)
          : ([...allowableTypes, MultiTypeInputType.EXPRESSION] as AllowedTypes)
    }

    useEffect(() => {
      if (getMultiTypeFromValue(initialValues.spec.feature) === MultiTypeInputType.FIXED) {
        refetchFeatures()
      }
      if (getMultiTypeFromValue(initialValues.spec.environment) === MultiTypeInputType.FIXED) {
        refetchEnvironments()
      }
    }, [initialValues.spec.environment, initialValues.spec.feature, refetchEnvironments, refetchFeatures])

    const onFlagTypeChange = useCallback(
      (type: MultiTypeInputType) => {
        setFlagType(type)
        if (type === MultiTypeInputType.FIXED) {
          refetchFeatures()
        }
      },
      [refetchFeatures]
    )

    const onEnvTypeChange = useCallback(
      (type: MultiTypeInputType) => {
        setEnvType(type)
        if (type === MultiTypeInputType.FIXED) {
          refetchEnvironments()
        }
      },
      [refetchEnvironments]
    )

    const showLoading = useMemo<boolean>(() => {
      if (isInitialRender) {
        if (!error) {
          setIsInitialRender(loading)
        }
        return loading
      }

      return false
    }, [isInitialRender, error, loading])

    const environmentItems = useMemo<SelectOption[]>(() => {
      if (!environmentsData?.data?.content?.length) {
        return []
      }

      return environmentsData.data.content.map(({ environment }) => ({
        label: environment?.name,
        value: environment?.identifier
      })) as SelectOption[]
    }, [environmentsData?.data?.content])

    const queryParams: GetFeatureFlagQueryParams = {
      projectIdentifier,
      accountIdentifier,
      orgIdentifier
    }

    const savedFlagId = initialValues.spec.feature

    const {
      data: savedFlagData,
      loading: getFlagLoading,
      refetch: getFlag
    } = useGetFeatureFlag({
      identifier: savedFlagId,
      queryParams,
      debounce: 250,
      lazy: true
    })

    const featureItems = useMemo<SelectOption[]>(() => {
      if (!featuresData?.features?.length) {
        return []
      }

      const flags = featuresData.features.map(({ name, identifier }) => ({ label: name, value: identifier }))

      // get flag data if not in first page of features then prepend to list
      if (
        flags.length === featureQueryParams.pageSize &&
        !flags.some(flag => flag.value === savedFlagId) &&
        savedFlagData
      ) {
        flags.unshift({ label: savedFlagData.name, value: savedFlagData.identifier })
      }

      return flags
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [featuresData?.features, savedFlagId, savedFlagData])

    useEffect(() => {
      // fetch only if a saved flag exists & flag is not in current list
      if (
        flagType === MultiTypeInputType.FIXED &&
        savedFlagId &&
        savedFlagId !== RUNTIME_INPUT_VALUE &&
        !featuresData?.features?.some(flag => flag.identifier === savedFlagId) &&
        !savedFlagData &&
        !getFlagLoading
      ) {
        getFlag()
      }
    }, [flagType, savedFlagId, savedFlagData, featureItems, getFlag, getFlagLoading, featuresData?.features])

    if (showLoading) {
      return (
        <Container
          height="100%"
          width="100%"
          padding={{ top: 'huge' }}
          data-testid="flag-configuration-step-widget-loading"
        >
          <ContainerSpinner />
        </Container>
      )
    }

    if (error) {
      return (
        <Container padding={{ top: 'huge' }} data-testid="flag-configuration-step-widget-error">
          <PageError
            message={getErrorMessage(error)}
            width={450}
            onClick={() => {
              refetchFeatures()
              refetchEnvironments()
            }}
          />
        </Container>
      )
    }

    const validationSchema = expressionSupportEnabled ? flagChangesValidationSchemaV2 : flagChangesValidationSchema

    return (
      <Formik<FlagConfigurationStepData>
        formName="FeatureFlagConfigurationForm"
        onSubmit={onUpdate}
        initialValues={initialFormValues}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          spec: Yup.object().shape({
            environment: Yup.string().required(getString('cf.pipeline.flagConfiguration.environmentRequired')),
            feature: Yup.mixed().required(getString('cf.pipeline.flagConfiguration.flagRequired')),
            instructions: Yup.lazy(val => (val === RUNTIME_INPUT_VALUE ? Yup.string() : validationSchema(getString)))
          })
        })}
      >
        {formik => {
          if (formikRef && 'current' in formikRef) {
            setFormikRef(formikRef, formik)
          }

          const { values: formValues, setFieldValue } = formik
          formValuesRef.current = formValues

          const currentFeature = featuresData?.features?.find(
            ({ identifier }) => identifier === formValues?.spec.feature
          )

          const currentEnvironment = environmentsData?.data?.content?.find(
            ({ environment }) => environment?.identifier === formValues?.spec.environment
          )?.environment

          return (
            <Layout.Vertical padding={{ right: 'xlarge' }}>
              <FormInput.InputWithIdentifier
                isIdentifierEditable={isNewStep && !readonly}
                inputLabel={getString('cf.pipeline.flagConfiguration.stepName')}
                inputGroupProps={{ disabled: readonly }}
              />
              <FormInput.MultiTypeInput
                name="spec.environment"
                useValue={true}
                selectItems={environmentItems}
                label={getString('cf.pipeline.flagConfiguration.selectEnvironment')}
                disabled={readonly}
                multiTypeInputProps={{
                  disabled: readonly,
                  allowableTypes: allowedTypes,
                  onTypeChange: onEnvTypeChange,
                  onInput: event => {
                    if (envType === MultiTypeInputType.FIXED) {
                      refetchEnvironments({
                        queryParams: { ...envQueryParams, searchTerm: (event.target as HTMLInputElement).value }
                      })
                    }
                  }
                }}
              />
              <FormInput.MultiTypeInput
                name="spec.feature"
                useValue
                selectItems={featureItems}
                label={getString('cf.pipeline.flagConfiguration.selectFlag')}
                disabled={readonly}
                multiTypeInputProps={{
                  disabled: readonly,
                  allowableTypes: allowedTypes,
                  onTypeChange: onFlagTypeChange,
                  onInput: event => {
                    if (flagType === MultiTypeInputType.FIXED) {
                      refetchFeatures({
                        queryParams: { ...featureQueryParams, name: (event.target as HTMLInputElement).value }
                      })
                    }
                  }
                }}
              />

              {expressionSupportEnabled ? (
                <FlagChangesContextProvider
                  flag={currentFeature || formValues?.spec.feature}
                  environmentIdentifier={formValues?.spec.environment}
                  accountIdentifier={accountIdentifier}
                  orgIdentifier={orgIdentifier}
                  projectIdentifier={projectIdentifier}
                  mode={StepViewType.Edit}
                  initialInstructions={initialValues.spec.instructions}
                >
                  <FlagChangesV2 />
                </FlagChangesContextProvider>
              ) : (
                <FlagChanges
                  selectedFeature={
                    formValues.spec.feature === RUNTIME_INPUT_VALUE ? formValues.spec.feature : currentFeature
                  }
                  selectedEnvironmentId={currentEnvironment?.identifier}
                  initialInstructions={initialValues.spec.instructions}
                  clearField={(fieldName: string) => setFieldValue(fieldName, undefined)}
                  setField={(fieldName: string, value: unknown) => setFieldValue(fieldName, value)}
                  fieldValues={formValues}
                  envType={envType}
                  flagType={flagType}
                  showRuntimeFixedSelector
                />
              )}
            </Layout.Vertical>
          )
        }}
      </Formik>
    )
  }
)

export default FlagConfigurationStepWidget
