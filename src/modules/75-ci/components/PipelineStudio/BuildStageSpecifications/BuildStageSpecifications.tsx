/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import * as yup from 'yup'
import { Accordion, Card, Formik, FormikForm, Switch, Text, MultiTypeInputType, Layout } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { cloneDeep, debounce, defaultTo, isEqual, set, uniqBy } from 'lodash-es'
import cx from 'classnames'
import { produce } from 'immer'
import type { FormikProps } from 'formik'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { NGVariable, StageElementConfig, StringNGVariable } from 'services/cd-ng'
import { UseFromStageInfraYaml } from 'services/ci'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type {
  CustomVariableEditableExtraProps,
  CustomVariablesData
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { useStrings } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { NameSchema } from '@common/utils/Validation'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import ErrorsStripBinded from '@pipeline/components/ErrorsStrip/ErrorsStripBinded'
import { isContextTypeNotStageTemplate } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import MultiTypeSecretInput from '@platform/secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { useFeatureFlag, useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { StageTimeout } from '@modules/75-cd/components/PipelineStudio/StageTimeout/StageTimeout'
import { BuildTabs } from '../CIPipelineStagesUtils'
import { Modes } from '../BuildInfraSpecifications/BuildInfraSpecifications'
import css from './BuildStageSpecifications.module.scss'

const logger = loggerFor(ModuleName.CD)

export interface Variable {
  name: string
  type: string
  value?: string
}

export default function BuildStageSpecifications({ children }: React.PropsWithChildren<unknown>): JSX.Element {
  const { variablesPipeline, metadataMap } = usePipelineVariables()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const { getString } = useStrings()
  const SSCA_SLSA_COMPLIANCE = useFeatureFlag(FeatureFlag.SSCA_SLSA_COMPLIANCE)

  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage,
    stepsFactory,
    contextType,
    allowableTypes,
    isReadonly
  } = usePipelineContext()

  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  const [buildInfraType, setBuildInfraType] = React.useState<CIBuildInfrastructureType | undefined>(undefined)
  const { stage } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')
  const { stage: propagatedStage } = getStageFromPipeline<BuildStageElementConfig>(
    (stage?.stage?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage || ''
  )
  const currentMode = (stage?.stage?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage
    ? Modes.Propagate
    : Modes.NewConfiguration

  React.useEffect(() => {
    const stageBuildInfraType =
      (stage?.stage?.spec?.infrastructure?.type as CIBuildInfrastructureType) ||
      (stage?.stage?.spec?.runtime?.type as CIBuildInfrastructureType)
    const propagatedStageType =
      (propagatedStage?.stage?.spec?.infrastructure?.type as CIBuildInfrastructureType) ||
      (propagatedStage?.stage?.spec?.runtime?.type as CIBuildInfrastructureType)
    currentMode === Modes.NewConfiguration
      ? setBuildInfraType(stageBuildInfraType)
      : setBuildInfraType(propagatedStageType)
  }, [stage, propagatedStage, currentMode])

  const getInitialValues = (): {
    identifier: string
    name: string
    description: string
    tags?: { [key: string]: string }
    cloneCodebase: boolean
    sharedPaths: string[]
    cacheIntelligenceEnabled?: boolean
    cacheIntelligencePaths?: string[]
    cacheIntelligenceKey?: string
    variables: NGVariable[]
    slsa_provenance?: {
      enabled: boolean
      attestation: {
        type: 'cosign'
        spec: {
          password: string
          private_key: string
        }
      }
    }
  } => {
    const pipelineData = stage?.stage || null
    const spec = stage?.stage?.spec || null

    const identifier = pipelineData?.identifier || ''
    const name = pipelineData?.name || ''
    const description = pipelineData?.description || ''
    const tags = pipelineData?.tags
    const cloneCodebase = !!spec?.cloneCodebase
    const cacheIntelligenceEnabled = !!spec?.caching?.enabled
    const sharedPaths =
      typeof spec?.sharedPaths === 'string'
        ? spec?.sharedPaths
        : (spec?.sharedPaths as any)
            ?.filter((path: string) => !!path)
            ?.map((_value: string) => ({
              id: uuid('', nameSpace()),
              value: _value
            })) || []
    const cacheIntelligencePaths =
      typeof spec?.caching?.paths === 'string'
        ? spec?.caching?.paths
        : (spec?.caching?.paths as any)
            ?.filter((path: string) => !!path)
            ?.map((_value: string) => ({
              id: uuid('', nameSpace()),
              value: _value
            })) || []
    const cacheIntelligenceKey = spec?.caching?.key
    const variables = pipelineData?.variables || []

    return {
      identifier,
      name,
      description,
      tags,
      cloneCodebase,
      sharedPaths: sharedPaths as any,
      cacheIntelligenceEnabled,
      cacheIntelligencePaths,
      cacheIntelligenceKey,
      slsa_provenance: (spec as any)?.slsa_provenance,
      variables
    }
  }

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: BuildTabs.OVERVIEW, form: formikRef })
    return () => unSubscribeForm({ tab: BuildTabs.OVERVIEW, form: formikRef })
  }, [])

  const commonValidationSchema = yup.lazy(value => {
    if (Array.isArray(value)) {
      return yup.array().test('valuesShouldBeUnique', getString('validation.uniqueValues'), list => {
        if (!list) return true
        return uniqBy(list, 'value').length === list.length
      })
    } else {
      return yup.string()
    }
  })

  const validationSchema = yup.object().shape({
    ...(isContextTypeNotStageTemplate(contextType) && { name: NameSchema(getString) }),
    sharedPaths: commonValidationSchema,
    cacheIntelligencePaths: commonValidationSchema,
    slsa_provenance: yup.object().shape({
      enabled: yup.boolean(),
      attestation: yup.object().when('enabled', {
        is: true,
        then: yup.object().shape({
          type: yup.string(),
          spec: yup.object().shape({
            private_key: yup.string().required('Private key is required'),
            password: yup.string().required('Password is required')
          })
        })
      })
    })
  })

  const handleValidate = (values: any): void => {
    if (stage?.stage) {
      const prevStageData = cloneDeep(stage.stage)
      const newStageData = produce(stage.stage, (stageData: any) => {
        let spec = stageData.spec

        stageData.identifier = values.identifier
        stageData.name = values.name
        stageData.description = values.description

        if (values.tags) {
          stageData.tags = values.tags
        } else {
          delete stageData.tags
        }

        spec.cloneCodebase = values.cloneCodebase

        if (values.sharedPaths && values.sharedPaths.length > 0) {
          spec.sharedPaths =
            typeof values.sharedPaths === 'string'
              ? values.sharedPaths
              : values.sharedPaths.map((listValue: { id: string; value: string }) => listValue.value)
        } else {
          delete spec.sharedPaths
        }

        if (formikRef.current?.dirty) {
          set(spec, 'caching.enabled', values.cacheIntelligenceEnabled)

          if (values.cacheIntelligencePaths && values.cacheIntelligencePaths.length > 0) {
            set(
              spec,
              'caching.paths',
              typeof values.cacheIntelligencePaths === 'string'
                ? values.cacheIntelligencePaths
                : values.cacheIntelligencePaths.map((listValue: { id: string; value: string }) => listValue.value)
            )
          } else {
            set(spec, 'caching.paths', [])
          }

          spec = set(spec, 'caching.key', values.cacheIntelligenceKey)
        }

        if (values?.variables && values.variables?.length > 0) {
          stageData.variables = values.variables
        } else {
          delete stageData.variables
        }

        if (values.skipCondition) {
          stageData.skipCondition = values.skipCondition
        } else {
          delete stageData.skipCondition
        }

        if (SSCA_SLSA_COMPLIANCE) {
          set(spec, 'slsa_provenance.enabled', !!values.slsa_provenance?.enabled)
          if (values.slsa_provenance?.enabled) {
            set(spec, 'slsa_provenance.attestation.type', 'cosign')
            set(spec, 'slsa_provenance.attestation.spec', values.slsa_provenance.attestation.spec)
          } else if (spec.slsa_provenance.attestation) {
            delete spec.slsa_provenance.attestation
          }
        } else {
          delete spec.slsa_provenance
        }
      })

      if (!isEqual(prevStageData, newStageData)) {
        updateStage(newStageData as unknown as StageElementConfig)
      }
    }
  }

  const debounceHandleValidate = React.useRef(
    debounce((values: any) => {
      return handleValidate(values)
    }, 500)
  ).current

  const handleStepWidgetUpdate = React.useCallback(
    debounce((values: StageElementConfig): void => {
      updateStage({ ...stage?.stage, ...values })
    }, 300),
    [stage?.stage, updateStage]
  )

  // Cleanup debounce
  useEffect(() => {
    return () => {
      debounceHandleValidate.flush()
    }
  }, [])

  const { expressions } = useVariablesExpression()

  return (
    <div className={css.wrapper}>
      <ErrorsStripBinded domRef={scrollRef as React.MutableRefObject<HTMLElement | undefined>} />
      <div className={css.contentSection} ref={scrollRef}>
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          validate={debounceHandleValidate}
          formName="ciBuildStage"
          onSubmit={values => logger.info(JSON.stringify(values))}
        >
          {formik => {
            const { values: formValues, setFieldValue } = formik
            window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: BuildTabs.OVERVIEW }))
            formikRef.current = formik as FormikProps<unknown> | null
            return (
              <>
                <div className={css.tabHeading} id="stageDetails">
                  {getString('stageDetails')}
                </div>
                <Card className={cx(css.sectionCard)} disabled={isReadonly}>
                  <FormikForm>
                    {isContextTypeNotStageTemplate(contextType) && (
                      <NameIdDescriptionTags
                        formikProps={formik}
                        identifierProps={{
                          isIdentifierEditable: false,
                          inputGroupProps: { disabled: isReadonly }
                        }}
                        descriptionProps={{ disabled: isReadonly }}
                        tagsProps={{ disabled: isReadonly }}
                      />
                    )}

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Switch
                        checked={formValues.cloneCodebase}
                        label={getString('cloneCodebaseLabel')}
                        onChange={e => setFieldValue('cloneCodebase', e.currentTarget.checked)}
                        disabled={isReadonly}
                        tooltipProps={{ tooltipId: 'cloneCodebase' }}
                      />
                    </div>
                  </FormikForm>
                </Card>

                <div className={css.tabHeading} id="sharedPaths">
                  {getString('pipelineSteps.build.stageSpecifications.sharedPaths')}
                </div>
                <Card disabled={isReadonly} className={cx(css.sectionCard)}>
                  <FormikForm className={cx(css.fields, css.contentCard)}>
                    <MultiTypeList
                      name="sharedPaths"
                      multiTextInputProps={{
                        expressions,
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                        newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                      }}
                      multiTypeFieldSelectorProps={{
                        label: (
                          <Text tooltipProps={{ dataTooltipId: 'stageSpecificationsSharedPaths' }}>
                            {getString('pipelineSteps.build.stageSpecifications.sharedPaths')}
                          </Text>
                        ),
                        allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
                      }}
                      disabled={isReadonly}
                      configureOptionsProps={{ hideExecutionTimeField: true }}
                    />
                  </FormikForm>
                </Card>

                <div className={css.tabHeading} id="cacheIntelligence">
                  {getString('pipeline.cacheIntelligence.label')}
                </div>
                <Card disabled={isReadonly} className={cx(css.sectionCard)}>
                  <FormikForm className={cx(css.fields, css.contentCard)}>
                    <Layout.Vertical spacing="medium">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Switch
                          checked={formValues.cacheIntelligenceEnabled}
                          label={getString('ci.cacheIntelligence.enable')}
                          onChange={e => setFieldValue('cacheIntelligenceEnabled', e.currentTarget.checked)}
                          disabled={isReadonly || buildInfraType !== CIBuildInfrastructureType.Cloud}
                          tooltipProps={{ tooltipId: 'enableCacheIntelligence' }}
                        />
                      </div>
                      {formValues.cacheIntelligenceEnabled ? (
                        <>
                          <MultiTypeList
                            name="cacheIntelligencePaths"
                            multiTextInputProps={{
                              expressions,
                              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                            }}
                            multiTypeFieldSelectorProps={{
                              label: (
                                <Text
                                  font={{ variation: FontVariation.FORM_LABEL }}
                                  tooltipProps={{ dataTooltipId: 'cacheIntelligencePaths' }}
                                >
                                  {getString('pipelineSteps.paths')}
                                </Text>
                              ),
                              allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
                            }}
                            disabled={isReadonly}
                            configureOptionsProps={{ hideExecutionTimeField: true }}
                          />
                          <MultiTypeTextField
                            name="cacheIntelligenceKey"
                            label={
                              <Layout.Horizontal
                                flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}
                                spacing="xsmall"
                                padding={{ bottom: 'small' }}
                              >
                                <Text
                                  font={{ size: 'small', weight: 'semi-bold' }}
                                  tooltipProps={{ dataTooltipId: 'cacheIntelligenceKey' }}
                                >
                                  {getString('keyLabel')}
                                </Text>
                                <Text
                                  color={Color.GREY_400}
                                  font={{ size: 'small', weight: 'semi-bold' }}
                                  style={{ textTransform: 'capitalize' }}
                                >
                                  {getString('common.optionalLabel')}
                                </Text>
                              </Layout.Horizontal>
                            }
                            multiTextInputProps={{
                              disabled: isReadonly,
                              multiTextInputProps: {
                                allowableTypes: [
                                  MultiTypeInputType.FIXED,
                                  MultiTypeInputType.EXPRESSION,
                                  MultiTypeInputType.RUNTIME
                                ],
                                newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                              },
                              placeholder: getString('ci.cacheIntelligence.keyNamePlaceholder')
                            }}
                            configureOptionsProps={{
                              hideExecutionTimeField: true
                            }}
                          />
                        </>
                      ) : (
                        <></>
                      )}
                    </Layout.Vertical>
                  </FormikForm>
                </Card>

                {SSCA_SLSA_COMPLIANCE && (
                  <>
                    <div className={css.tabHeading} id="slsaProvenance">
                      {getString('pipeline.slsaProvenance')}
                    </div>
                    <Card disabled={isReadonly} className={cx(css.sectionCard)}>
                      <FormikForm className={cx(css.fields, css.contentCard)}>
                        <Layout.Vertical spacing="medium">
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Switch
                              checked={formValues.slsa_provenance?.enabled}
                              label={getString('ci.slsaProvenance.generate')}
                              onChange={e => setFieldValue('slsa_provenance.enabled', e.currentTarget.checked)}
                              disabled={isReadonly}
                              tooltipProps={{ tooltipId: 'enableSlsaProvenance' }}
                            />
                          </div>
                          {formValues.slsa_provenance?.enabled && (
                            <>
                              <MultiTypeSecretInput
                                type="SecretFile"
                                name="slsa_provenance.attestation.spec.private_key"
                                label={getString('platform.connectors.serviceNow.privateKey')}
                                expressions={expressions}
                                allowableTypes={allowableTypes}
                                enableConfigureOptions
                                configureOptionsProps={{
                                  hideExecutionTimeField: true
                                }}
                                disabled={isReadonly}
                              />

                              <MultiTypeSecretInput
                                name="slsa_provenance.attestation.spec.password"
                                label={getString('password')}
                                expressions={expressions}
                                allowableTypes={allowableTypes}
                                enableConfigureOptions
                                configureOptionsProps={{
                                  hideExecutionTimeField: true
                                }}
                                disabled={isReadonly}
                              />
                            </>
                          )}
                        </Layout.Vertical>
                      </FormikForm>
                    </Card>
                  </>
                )}

                <Accordion className={css.accordionTitle} activeId="">
                  <Accordion.Panel
                    id="advanced"
                    addDomId={true}
                    summary={
                      <div
                        className={css.tabHeading}
                        id="advanced"
                        style={{
                          paddingLeft: 'var(--spacing-small)',
                          paddingRight: 'var(--spacing-4)',
                          marginBottom: 0
                        }}
                      >
                        {getString('advancedTitle')}
                      </div>
                    }
                    details={
                      <Card
                        className={(css.sectionCard, css.sectionCardVariables)}
                        id="variables"
                        style={{ width: '100%' }}
                      >
                        <StageTimeout<StageElementConfig>
                          data={stage}
                          onChange={handleStepWidgetUpdate}
                          isReadonly={isReadonly}
                        />
                        <div className={css.tabSubHeading}>{getString('pipeline.stageVariables')}</div>
                        <Text style={{ color: 'var(--grey-500)', lineHeight: '24px' }}>
                          {getString('workflowVariableInfo')}
                        </Text>
                        <div className={css.stageSection}>
                          <div className={css.stageDetails}>
                            <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
                              factory={stepsFactory}
                              readonly={isReadonly}
                              initialValues={{
                                variables: ((stage?.stage as StageElementConfig)?.variables || []) as AllNGVariables[],
                                canAddVariable: true
                              }}
                              allowableTypes={allowableTypes}
                              type={StepType.CustomVariable}
                              stepViewType={StepViewType.StageVariable}
                              onUpdate={({ variables }: CustomVariablesData) => {
                                if (!variables?.length) {
                                  const clonedStage = stage?.stage
                                  delete clonedStage?.variables
                                  handleStepWidgetUpdate({ ...clonedStage } as StageElementConfig)
                                } else {
                                  handleStepWidgetUpdate({ ...stage?.stage, variables } as StageElementConfig)
                                }
                              }}
                              customStepProps={{
                                formName: 'addEditStageCustomVariableForm',
                                yamlProperties: defaultTo(
                                  getStageFromPipeline<BuildStageElementConfig>(
                                    stage?.stage?.identifier || '',
                                    variablesPipeline
                                  )?.stage?.stage?.variables?.map?.(
                                    variable =>
                                      metadataMap[(variable as StringNGVariable).value || '']?.yamlProperties || {}
                                  ),
                                  []
                                )
                              }}
                            />
                          </div>
                        </div>
                      </Card>
                    }
                  />
                </Accordion>
              </>
            )
          }}
        </Formik>
        {children}
      </div>
    </div>
  )
}
