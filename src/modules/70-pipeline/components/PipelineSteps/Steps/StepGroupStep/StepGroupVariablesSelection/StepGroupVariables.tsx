/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypes, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import type { AllNGVariables } from '@pipeline/utils/types'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { useStrings } from 'framework/strings'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { getStepFromId } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import { useTemplateVariables } from '@pipeline/components/TemplateVariablesContext/TemplateVariablesContext'
import { TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
// eslint-disable-next-line no-restricted-imports
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { StepGroupFormikValues } from '../StepGroupUtil'
import { CustomVariablesEditableStage } from '../../CustomVariables/CustomVariablesEditableStage'

export interface StepGroupVariablesProps {
  readonly?: boolean
  allowableTypes?: AllowedTypes
  formikRef: FormikProps<StepGroupFormikValues>
  isRollback?: boolean
  isProvisionerStep?: boolean
}

const getRelativeStepsPathFromPipeline = /* istanbul ignore next */ (isProvisionerStep: boolean): string => {
  return isProvisionerStep ? 'stage.stage.spec.environment.provisioner' : 'stage.stage.spec.execution'
}
const getExecutionPathFromTemplate = /* istanbul ignore next */ (
  templateType: TemplateType,
  isProvisionerStep?: boolean
): string => {
  switch (templateType) {
    case TemplateType.Pipeline:
      return getRelativeStepsPathFromPipeline(Boolean(isProvisionerStep))
    case TemplateType.Stage:
      return 'spec.execution'
    default:
      return '' // StepGroup template is at basePath
  }
}

export default function StepGroupVariables(props: StepGroupVariablesProps): JSX.Element | null {
  const { readonly, formikRef, isRollback = false, isProvisionerStep = false } = props
  const {
    state: {
      selectionState: { selectedStageId }
    },
    allowableTypes,
    getStageFromPipeline
  } = usePipelineContext()
  const { getString } = useStrings()
  const { templateType } = useParams<TemplateStudioPathProps>()
  const { variablesPipeline, metadataMap: pipelineMetaDataMap } = usePipelineVariables()
  const { variablesTemplate, metadataMap: templateMetaDataMap } = useTemplateVariables()

  const stepsData = React.useMemo(() => {
    // Template studio
    /* istanbul ignore next */
    if (templateType) {
      const executionRelativePath = getExecutionPathFromTemplate(templateType as TemplateType, isProvisionerStep)

      const stageFromVariablesTemplate =
        templateType === TemplateType.Pipeline
          ? getStageFromPipeline(defaultTo(selectedStageId, ''), variablesTemplate)
          : variablesTemplate

      return get(stageFromVariablesTemplate, executionRelativePath, variablesTemplate)
    }
    // Pipeline Studio
    const stageFromVariablesPipeline = getStageFromPipeline(defaultTo(selectedStageId, ''), variablesPipeline)
    return get(stageFromVariablesPipeline, getRelativeStepsPathFromPipeline(Boolean(isProvisionerStep)))
  }, [getStageFromPipeline, isProvisionerStep, selectedStageId, templateType, variablesPipeline, variablesTemplate])

  const metadataMap = !isEmpty(pipelineMetaDataMap) ? pipelineMetaDataMap : templateMetaDataMap

  const getYamlPropertiesForVariables = (): AllNGVariables[] => {
    // search for step in execution of variable pipeline to fetch uuid
    const execStep = getStepFromId(stepsData, formikRef.values?.identifier, false, false, Boolean(isRollback))
    return execStep.node?.variables || []
  }

  return (
    <Layout.Vertical padding={{ top: 'medium', bottom: 'medium' }}>
      <Text font={{ variation: FontVariation.BODY2 }} tooltipProps={{ dataTooltipId: 'stepGroupVariables' }}>
        {getString('common.variables')}
      </Text>
      <section>
        <CustomVariablesEditableStage
          formName="addEditStepGroupVariableForm"
          initialValues={{
            variables: defaultTo(formikRef.values?.variables, []) as AllNGVariables[],
            canAddVariable: true
          }}
          allowableTypes={allowableTypes}
          readonly={readonly}
          onUpdate={
            /* istanbul ignore next */ ({ variables }: CustomVariablesData) => {
              formikRef.setFieldValue('variables', variables)
            }
          }
          isDrawerMode={true}
          yamlProperties={
            /* istanbul ignore next */ getYamlPropertiesForVariables().map(
              variable => metadataMap[variable.value || '']?.yamlProperties || {}
            )
          }
        />
      </section>
    </Layout.Vertical>
  )
}
