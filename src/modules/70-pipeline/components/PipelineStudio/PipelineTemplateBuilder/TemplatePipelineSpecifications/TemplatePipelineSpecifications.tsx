/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { debounce, defaultTo, isEmpty, isEqual, noop, set, unset } from 'lodash-es'
import { useParams } from 'react-router-dom'
import React, { useRef } from 'react'
import { Container, Formik, FormikForm, Heading, Layout, PageError, Text } from '@wings-software/uicore'
import { Color } from '@wings-software/design-system'
import type { FormikProps, FormikErrors } from 'formik'
import { TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  getsMergedTemplateInputYamlPromise,
  useGetTemplateInputSetYaml,
  useGetYamlWithTemplateRefsResolved
} from 'services/template-ng'
import {
  getIdentifierFromValue,
  getScopeBasedProjectPathParams,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PageSpinner } from '@common/components'
import { PipelineInputSetFormInternal } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { Error, PipelineInfoConfig } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { validatePipeline } from '@pipeline/components/PipelineStudio/StepUtil'
import { ErrorsStrip } from '@pipeline/components/ErrorsStrip/ErrorsStrip'
import { useMutateAsGet } from '@common/hooks'
import { parse, stringify, yamlStringify } from '@common/utils/YamlHelperMethods'
import type { Pipeline } from '@pipeline/utils/types'
import css from './TemplatePipelineSpecifications.module.scss'

const getTemplateRuntimeInputsCount = (templateInfo: { [key: string]: any }): number =>
  (JSON.stringify(templateInfo || {}).match(/<\+input>/g) || []).length

export function TemplatePipelineSpecifications(): JSX.Element {
  const {
    state: { pipeline, schemaErrors, gitDetails },
    allowableTypes,
    updatePipeline,
    isReadonly
  } = usePipelineContext()
  const queryParams = useParams<ProjectPathProps>()
  const templateRef = getIdentifierFromValue(defaultTo(pipeline.template?.templateRef, ''))
  const scope = getScopeFromValue(defaultTo(pipeline.template?.templateRef, ''))
  const { getString } = useStrings()
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  const formRefDom = React.useRef<HTMLElement | undefined>()
  const [formikErrors, setFormikErrors] = React.useState<FormikErrors<PipelineInfoConfig>>()
  const [showFormError, setShowFormError] = React.useState<boolean>()
  const dummyPipeline = useRef(pipeline)
  const viewTypeMetadata = { isTemplateBuilder: true }
  const [loadingMergedTemplateInputs, setLoadingMergedTemplateInputs] = React.useState<boolean>(false)

  const onChange = React.useCallback(
    debounce(async (values: PipelineInfoConfig): Promise<void> => {
      await updatePipeline({ ...pipeline, ...values })
    }, 300),
    [pipeline, updatePipeline]
  )

  const {
    data: pipelineResponse,
    error: pipelineError,
    refetch: refetchPipeline,
    loading: pipelineLoading
  } = useMutateAsGet(useGetYamlWithTemplateRefsResolved, {
    queryParams: {
      ...getScopeBasedProjectPathParams(queryParams, scope),
      pipelineIdentifier: pipeline.identifier,
      repoIdentifier: gitDetails.repoIdentifier,
      branch: gitDetails.branch,
      getDefaultFromOtherRepo: true
    },
    body: {
      originalEntityYaml: yamlStringify({ pipeline: dummyPipeline.current })
    }
  })

  const allValues = React.useMemo(
    () => parse<Pipeline>(defaultTo(pipelineResponse?.data?.mergedPipelineYaml, ''))?.pipeline,
    [pipelineResponse?.data?.mergedPipelineYaml]
  )

  const {
    data: templateInputSetYaml,
    error: templateInputSetError,
    refetch: refetchTemplateInputSet,
    loading: templateInputSetLoading
  } = useGetTemplateInputSetYaml({
    templateIdentifier: templateRef,
    queryParams: {
      ...getScopeBasedProjectPathParams(queryParams, scope),
      versionLabel: defaultTo(pipeline.template?.versionLabel, ''),
      repoIdentifier: gitDetails.repoIdentifier,
      branch: gitDetails.branch,
      getDefaultFromOtherRepo: true
    }
  })

  const templateInputs: PipelineInfoConfig = React.useMemo(
    () => parse(defaultTo(templateInputSetYaml?.data, '')),
    [templateInputSetYaml?.data]
  )

  const templateInputsCount = React.useMemo(() => getTemplateRuntimeInputsCount(templateInputs), [templateInputs])

  React.useEffect(() => {
    if (!isEmpty(templateInputs)) {
      setLoadingMergedTemplateInputs(true)
      try {
        getsMergedTemplateInputYamlPromise({
          body: {
            oldTemplateInputs: stringify(defaultTo(pipeline?.template?.templateInputs, '')),
            newTemplateInputs: stringify(templateInputs)
          },
          queryParams: {
            accountIdentifier: queryParams.accountId
          }
        }).then(response => {
          if (response && response.status === 'SUCCESS') {
            const mergedTemplateInputs = parse(defaultTo(response.data?.mergedTemplateInputs, ''))
            set(pipeline, TEMPLATE_INPUT_PATH, mergedTemplateInputs)
            updatePipeline(pipeline)
          } else {
            throw response
          }
        })
      } catch (error) {
        set(pipeline, TEMPLATE_INPUT_PATH, templateInputs)
        updatePipeline(pipeline)
      }
      setLoadingMergedTemplateInputs(false)
    } else if (!templateInputSetLoading) {
      unset(pipeline, TEMPLATE_INPUT_PATH)
      updatePipeline(pipeline)
    }
  }, [templateInputs])

  React.useEffect(() => {
    dummyPipeline.current = pipeline
    setFormikErrors({})
  }, [pipeline.template?.templateRef, pipeline.template?.versionLabel])

  React.useEffect(() => {
    if (schemaErrors) {
      formikRef.current?.submitForm()
      setShowFormError(true)
    }
  }, [schemaErrors])

  const validateForm = (values: PipelineInfoConfig) => {
    if (
      isEqual(values.template?.templateRef, pipeline.template?.templateRef) &&
      isEqual(values.template?.versionLabel, pipeline.template?.versionLabel) &&
      templateInputs
    ) {
      onChange?.(values)
      const errorsResponse = validatePipeline({
        pipeline: values.template?.templateInputs as PipelineInfoConfig,
        template: templateInputs,
        originalPipeline: allValues,
        getString,
        viewType: StepViewType.DeploymentForm,
        viewTypeMetadata
      })
      const newFormikErrors = set({}, TEMPLATE_INPUT_PATH, errorsResponse)
      setFormikErrors(newFormikErrors)
      return newFormikErrors
    } else {
      setFormikErrors({})
      return {}
    }
  }

  const refetch = () => {
    refetchPipeline()
    refetchTemplateInputSet()
  }

  const isLoading = pipelineLoading || templateInputSetLoading || loadingMergedTemplateInputs

  const error = defaultTo(templateInputSetError, pipelineError)

  return (
    <Container className={css.contentSection} height={'100%'} background={Color.FORM_BG}>
      {isLoading && <PageSpinner />}
      {!isLoading && error && (
        <PageError message={defaultTo((error?.data as Error)?.message, error?.message)} onClick={() => refetch()} />
      )}
      {!isLoading && !error && templateInputs && allValues && pipeline && (
        <>
          {showFormError && formikErrors && <ErrorsStrip formErrors={formikErrors} domRef={formRefDom} />}
          <Formik<PipelineInfoConfig>
            initialValues={pipeline}
            formName="templateStageOverview"
            onSubmit={noop}
            validate={validateForm}
          >
            {(formik: FormikProps<PipelineInfoConfig>) => {
              formikRef.current = formik as FormikProps<unknown> | null
              return (
                <FormikForm>
                  <Container
                    className={css.inputsContainer}
                    ref={ref => {
                      formRefDom.current = ref as HTMLElement
                    }}
                  >
                    <Layout.Vertical padding={{ bottom: 'large' }} spacing={'xlarge'}>
                      <Layout.Horizontal flex={{ distribution: 'space-between' }}>
                        <Heading level={5} color={Color.BLACK}>
                          {getString('pipeline.templateInputs')}
                        </Heading>
                        <Text font={{ size: 'normal' }}>{`Total Inputs: ${templateInputsCount}`}</Text>
                      </Layout.Horizontal>
                      <Container>
                        <PipelineInputSetFormInternal
                          template={templateInputs}
                          originalPipeline={allValues}
                          path={TEMPLATE_INPUT_PATH}
                          readonly={isReadonly}
                          viewType={StepViewType.InputSet}
                          allowableTypes={allowableTypes}
                          viewTypeMetadata={viewTypeMetadata}
                        />
                      </Container>
                    </Layout.Vertical>
                  </Container>
                </FormikForm>
              )
            }}
          </Formik>
        </>
      )}
    </Container>
  )
}
