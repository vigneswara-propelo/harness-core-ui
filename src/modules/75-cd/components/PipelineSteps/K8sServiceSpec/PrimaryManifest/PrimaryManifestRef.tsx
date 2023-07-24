import React, { useEffect, useMemo } from 'react'
import {
  AllowedTypes,
  Container,
  getMultiTypeFromValue,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption
} from '@harness/uicore'
import { useGetPrimaryManifestsRefQuery } from '@harnessio/react-ng-manager-client'
import { defaultTo, get, isEmpty, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikContextType } from 'formik'
import produce from 'immer'
import { KubernetesServiceSpec } from 'services/cd-ng'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import type { PipelineStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import { useStageFormContext } from '@pipeline/context/StageFormContext'
import { isValueRuntimeInput } from '@common/utils/utils'
import ExperimentalInput from '../K8sServiceSpecForms/ExperimentalInput'
import type { K8SDirectServiceStep } from '../K8sServiceSpecInterface'

interface PrimaryManifestRefProps {
  template: KubernetesServiceSpec
  initialValues: K8SDirectServiceStep
  readonly: boolean
  allowableTypes: AllowedTypes
  serviceIdentifier?: string
  stepViewType?: StepViewType
  primaryManifest?: string
  formik?: FormikContextType<unknown>
  path?: string
}

function PrimaryManifestRef({
  template,
  initialValues,
  path,
  allowableTypes,
  readonly,
  formik,
  serviceIdentifier = '',
  stepViewType
}: PrimaryManifestRefProps): React.ReactElement | null {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getStageFormTemplate, updateStageFormTemplate } = useStageFormContext()

  const { data: manifestSourceResponse, isLoading } = useGetPrimaryManifestsRefQuery({
    pathParams: {
      project: projectIdentifier,
      org: orgIdentifier,
      service: serviceIdentifier
    }
  })

  const manifestSources = useMemo(
    () =>
      defaultTo(
        manifestSourceResponse?.content?.identifiers?.map(source => ({ label: source, value: source })),
        []
      ),
    [manifestSourceResponse?.content?.identifiers]
  )

  useEffect(() => {
    if (isLoading) {
      return
    }
    const manifestSourceTemplate = getStageFormTemplate(`${path}.manifestConfigurations.sources`)
    const serviceInputsFormikValue = get(formik?.values, `${path}.manifestConfigurations.sources`)
    const isSingleManifestSource = manifestSources.length === 1
    if (
      typeof manifestSourceTemplate === 'string' &&
      getMultiTypeFromValue(manifestSourceTemplate) === MultiTypeInputType.RUNTIME &&
      (!isEmpty(serviceInputsFormikValue) || isSingleManifestSource)
    ) {
      const shouldSetDefaultManifestSource = isSingleManifestSource && stepViewType !== StepViewType.TemplateUsage

      const sourceIdentifierToSourceInputMap = get(
        manifestSourceResponse?.content?.identifiers,
        shouldSetDefaultManifestSource
          ? manifestSources[0].value
          : `${initialValues?.manifestConfigurations?.primaryManifestRef}`
      )
      if (sourceIdentifierToSourceInputMap) {
        const idSourceMap = yamlParse(defaultTo(sourceIdentifierToSourceInputMap, ''))
        if (idSourceMap) {
          if (shouldSetDefaultManifestSource) {
            formik?.setValues(
              produce(formik?.values, (draft: StageElementWrapper<PipelineStageElementConfig>) => {
                set(draft, `${path}.manifestConfigurations.primaryManifestRef`, manifestSources[0].value)
              })
            )
          }
          updateStageFormTemplate([idSourceMap], `${path}.manifestConfigurations.primaryManifestRef`)
        }
      } else {
        const primaryRefFormikValue = get(formik?.values, `${path}.manifestConfigurations.primaryManifestRef`)
        if (isEmpty(primaryRefFormikValue) && shouldSetDefaultManifestSource) {
          formik?.setValues(
            produce(formik?.values, (draft: StageElementWrapper<PipelineStageElementConfig>) => {
              set(draft, `${path}.manifestConfigurations.primaryManifestRef`, manifestSources[0].value)
            })
          )
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifestSources, manifestSourceResponse?.content?.identifiers])

  const onPrimaryManifestRefChange = (value: SelectOption): void => {
    if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED) {
      updateStageFormTemplate(undefined, `${path}.manifestConfigurations.primaryManifestRef`)
      const isRuntime = isValueRuntimeInput(value) && stepViewType === StepViewType.TemplateUsage

      formik?.setValues(
        produce(formik?.values, (draft: StageElementWrapper<PipelineStageElementConfig>) => {
          set(draft, `${path}.manifestConfigurations.primaryManifestRef`, isRuntime ? RUNTIME_INPUT_VALUE : value)
        })
      )
    }
  }

  return (
    <Container width={400}>
      {getMultiTypeFromValue(template?.manifestConfigurations?.primaryManifestRef as string) ===
        MultiTypeInputType.RUNTIME && (
        <ExperimentalInput
          tooltipProps={{ dataTooltipId: 'primaryManifestRef' }}
          label={getString('cd.pipelineSteps.serviceTab.manifest.primaryManifest')}
          placeholder={getString('cd.pipelineSteps.serviceTab.manifest.primaryManifest')}
          name={`${path}.manifestConfigurations.primaryManifestRef`}
          selectItems={manifestSources}
          useValue
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              addClearBtn: !readonly,
              items: manifestSources
            },
            onChange: onPrimaryManifestRefChange
          }}
          disabled={readonly}
          formik={formik}
        />
      )}
    </Container>
  )
}

export default PrimaryManifestRef
