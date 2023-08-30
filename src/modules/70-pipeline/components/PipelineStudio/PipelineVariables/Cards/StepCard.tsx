/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypes, NestedAccordionPanel, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { defaultTo, set } from 'lodash-es'
import cx from 'classnames'

import produce from 'immer'
import type { StepElementConfig, StepGroupElementConfig, ExecutionWrapperConfig } from 'services/cd-ng'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { JsonNode, TemplateStepNode } from 'services/pipeline-ng'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { useStrings } from 'framework/strings'
import {
  CustomVariableEditableExtraProps,
  CustomVariablesData
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { AllNGVariables } from '@pipeline/utils/types'
import { NGTemplateInfoConfig } from 'services/template-ng'
import type { StepGroupRenderData, StepRenderData, AddStepsParams } from './ExecutionCard'
import type { PipelineVariablesData } from '../types'
import VariableAccordionSummary from '../VariableAccordionSummary'
import css from '../PipelineVariables.module.scss'

export interface StepCardProps {
  step: StepElementConfig | TemplateStepNode
  originalStep: StepElementConfig | TemplateStepNode
  stageIdentifier: string
  metadataMap: PipelineVariablesData['metadataMap']
  onUpdateStep(data: StepElementConfig, path: string): void
  stepPath: string
  readonly?: boolean
  path?: string
  allowableTypes: AllowedTypes
  stepsFactory: AbstractStepFactory // REQUIRED (pass to addUpdateGraph)
}

const getRelativeStepPath = (path?: string): string => {
  if (!path) return ''
  const indices = ['steps', 'rollbackSteps'].map(entity => path.indexOf(entity)).filter(index => index !== -1)
  const minIndex = Math.min(...indices)
  return minIndex !== Infinity ? path.slice(minIndex) : ''
}

export function StepCard(props: StepCardProps): React.ReactElement {
  const {
    step,
    originalStep,
    metadataMap,
    stageIdentifier,
    onUpdateStep,
    stepPath,
    readonly,
    path,
    allowableTypes,
    stepsFactory
  } = props

  if ((originalStep as TemplateStepNode)?.template) {
    return <></>
  }
  return (
    <React.Fragment>
      <VariablesListTable
        className={css.variablePaddingL3}
        data={step}
        originalData={originalStep}
        metadataMap={metadataMap}
      />
      <StepWidget<StepElementConfig | TemplateStepNode>
        factory={stepsFactory}
        initialValues={originalStep}
        allowableTypes={allowableTypes}
        type={(originalStep as StepElementConfig).type as StepType}
        stepViewType={StepViewType.InputVariable}
        onUpdate={(data: StepElementConfig) => onUpdateStep(data, stepPath)}
        readonly={readonly}
        customStepProps={{
          stageIdentifier,
          metadataMap,
          variablesData: step,
          path
        }}
      />
    </React.Fragment>
  )
}

export function StepCardPanel(props: StepCardProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <NestedAccordionPanel
      noAutoScroll
      collapseProps={{
        keepChildrenMounted: true
      }}
      isDefaultOpen
      addDomId
      id={`${props.stepPath}.${props.originalStep.identifier}`}
      summary={
        <VariableAccordionSummary>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
            {defaultTo(props.originalStep.name, getString('step'))}
          </Text>
        </VariableAccordionSummary>
      }
      summaryClassName={css.accordianSummaryL2}
      details={<StepCard {...props} />}
    />
  )
}

export interface StepGroupCardProps {
  steps: Array<{
    step: StepElementConfig | TemplateStepNode | StepGroupElementConfig
    originalStep: StepElementConfig | TemplateStepNode | StepGroupElementConfig
    path: string
  }>
  stageIdentifier: string
  metadataMap: PipelineVariablesData['metadataMap']
  onUpdateStep(data: StepElementConfig | TemplateStepNode | StepGroupElementConfig, path: string): void
  stepGroupIdentifier: string
  readonly?: boolean
  path?: string
  allowableTypes: AllowedTypes
  stepsFactory: AbstractStepFactory
  originalStepGroup: StepGroupElementConfig
  stepGroup: StepGroupElementConfig
  fullPath?: string
  unresolvedStepGroup?: StepGroupElementConfig
}

export function StepGroupCard(props: StepGroupCardProps): React.ReactElement {
  const {
    steps,
    metadataMap,
    onUpdateStep,
    stageIdentifier,
    readonly,
    allowableTypes,
    stepsFactory,
    originalStepGroup,
    stepGroup,
    unresolvedStepGroup,
    path: sgPath,
    fullPath
  } = props
  const { getString } = useStrings()

  return (
    <React.Fragment>
      <VariablesListTable
        data={stepGroup}
        originalData={originalStepGroup}
        metadataMap={metadataMap}
        className={css.variablePaddingL1}
      />
      <NestedAccordionPanel
        noAutoScroll
        isDefaultOpen
        key={`${sgPath}.${originalStepGroup.identifier}.variables`}
        id={`${sgPath}.${originalStepGroup.identifier}.variables`}
        addDomId
        summaryClassName={css.accordianSummaryL2}
        summary={
          <VariableAccordionSummary>
            <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
              {getString('pipeline.stepGroupVariables')}
            </Text>
          </VariableAccordionSummary>
        }
        collapseProps={{
          keepChildrenMounted: true
        }}
        details={
          <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
            factory={stepsFactory}
            initialValues={{
              variables: defaultTo(originalStepGroup?.variables, []) as AllNGVariables[],
              canAddVariable: true
            }}
            allowableTypes={allowableTypes}
            readonly={readonly}
            type={StepType.CustomVariable}
            stepViewType={StepViewType.InputVariable}
            onUpdate={({ variables }: CustomVariablesData) => {
              onUpdateStep(
                produce(unresolvedStepGroup as StepGroupElementConfig, draft => {
                  if (draft) {
                    set(draft, 'variables', variables)
                  }
                }),
                getRelativeStepPath(fullPath)
              )
            }}
            customStepProps={{
              formName: 'addEditStepGroupCustomVariableForm',
              variableNamePrefix: `${originalStepGroup.identifier}.variables.`,
              domId: `StepGroup.${originalStepGroup.identifier}.Variables-panel`,
              className: cx(css.customVariables, css.customVarPadL1, css.addVariableL1),
              path: `${sgPath}.customVariables`,
              yamlProperties: (defaultTo(stepGroup?.variables, []) as AllNGVariables[]).map?.(
                variable =>
                  metadataMap[variable.value || /* istanbul ignore next */ '']?.yamlProperties ||
                  /* istanbul ignore next */ {}
              )
            }}
          />
        }
      />
      {steps.map((row: any) => {
        if (row.type === 'StepGroupRenderData') {
          // when parent is step-group and child is step-group template
          const isStepGroupTemplate = !!(row?.unresolvedStepGroup as TemplateStepNode)?.template

          return (
            <StepGroupCardPanel
              key={row.path}
              steps={row.steps}
              stepGroupIdentifier={row.identifier}
              path={row.path}
              fullPath={row.fullPath}
              allowableTypes={allowableTypes}
              metadataMap={metadataMap}
              readonly={readonly || isStepGroupTemplate}
              stageIdentifier={stageIdentifier}
              onUpdateStep={onUpdateStep}
              stepsFactory={stepsFactory}
              originalStepGroup={row?.originalStepGroup}
              stepGroup={row?.stepGroup}
              unresolvedStepGroup={row?.unresolvedStepGroup}
            />
          )
        }
        const { step, originalStep, path } = row
        return (
          <StepCardPanel
            key={path}
            step={step}
            originalStep={originalStep}
            metadataMap={metadataMap}
            stepPath={path}
            readonly={readonly}
            allowableTypes={allowableTypes}
            stageIdentifier={stageIdentifier}
            onUpdateStep={onUpdateStep}
            stepsFactory={stepsFactory}
          />
        )
      })}
    </React.Fragment>
  )
}

export function StepGroupCardPanel(props: StepGroupCardProps): React.ReactElement {
  return (
    <NestedAccordionPanel
      noAutoScroll
      isDefaultOpen
      addDomId
      collapseProps={{
        keepChildrenMounted: true
      }}
      panelClassName={css.accordianSummaryL1}
      id={`${props.path}.StepGroup.${props.stepGroupIdentifier}`}
      summary={
        <VariableAccordionSummary>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
            {props.originalStepGroup.name}
          </Text>
        </VariableAccordionSummary>
      }
      summaryClassName={css.accordianSummaryL1}
      details={<StepGroupCard {...props} />}
    />
  )
}

interface StepGroupTemplateVariables extends Omit<StepGroupCardProps, 'steps'> {
  templateSteps: any
  originalSteps: ExecutionWrapperConfig[]
  path: string
  fullParentPath?: string
  unresolvedStepGroupTemplate?: StepGroupElementConfig
}

export function StepGroupTemplateCard(props: StepGroupTemplateVariables): React.ReactElement {
  const { metadataMap, stageIdentifier, onUpdateStep, readonly, path, allowableTypes, stepsFactory } = props

  const onUpdateSGSpec = React.useCallback(
    execution => {
      const processedData = produce(props?.originalStepGroup, draft => {
        set(draft, 'spec', execution)
      })
      onUpdateStep((processedData as JsonNode)?.spec, '')
    },
    [onUpdateStep, props?.originalStepGroup]
  )

  const allSteps = React.useMemo(() => {
    function addToCards({
      steps,
      originalSteps,
      unresolvedSteps,
      parentPath = /* istanbul ignore next */ '',
      fullParentPath = ''
    }: AddStepsParams): Array<StepRenderData | StepGroupRenderData> {
      if (!steps || !Array.isArray(steps)) return []
      return steps.reduce<Array<StepRenderData | StepGroupRenderData>>((cards, { step, stepGroup, parallel }, i) => {
        if (step) {
          cards.push({
            type: 'StepRenderData',
            step,
            originalStep: originalSteps?.[i]?.step || /* istanbul ignore next */ {
              timeout: '10m',
              name: '',
              type: '',
              identifier: ''
            },
            unresolvedStep: unresolvedSteps?.[i]?.step,
            path: parentPath,
            fullPath: `${fullParentPath || parentPath}[${i}].step`
          })
        } else if (stepGroup) {
          const isStepGroupTemplate = !!(unresolvedSteps?.[i]?.stepGroup as unknown as TemplateStepNode)?.template
          cards.push({
            type: 'StepGroupRenderData',
            stepGroup,
            originalStepGroup: originalSteps?.[i]?.stepGroup || /* istanbul ignore next */ {
              name: '',
              identifier: ''
            },
            unresolvedStepGroup: unresolvedSteps?.[i]?.stepGroup,
            steps: [
              ...(addToCards({
                steps: stepGroup.steps,
                originalSteps: originalSteps?.[i]?.stepGroup?.steps,
                unresolvedSteps: isStepGroupTemplate
                  ? (unresolvedSteps?.[i]?.stepGroup as unknown as TemplateStepNode)?.template?.templateInputs?.steps
                  : unresolvedSteps?.[i]?.stepGroup?.steps,
                parentPath: `${parentPath}.steps`,
                fullParentPath: `${fullParentPath || parentPath}[${i}].stepGroup.steps`
              }) as StepRenderData[])
            ],
            name: stepGroup.name || '',
            originalName: originalSteps?.[i]?.stepGroup?.name || /* istanbul ignore next */ '',
            identifier: originalSteps?.[i]?.stepGroup?.identifier || /* istanbul ignore next */ '',
            path: `${parentPath}.stepGroup`,
            fullPath: `${fullParentPath || parentPath}[${i}].stepGroup`
          })
        } /* istanbul ignore else */ else if (parallel) {
          cards.push(
            ...addToCards({
              steps: parallel,
              originalSteps: originalSteps?.[i]?.parallel,
              unresolvedSteps: unresolvedSteps?.[i]?.parallel,
              parentPath: `${parentPath}.parallel`,
              fullParentPath: `${fullParentPath || parentPath}[${i}].parallel`
            })
          )
        }

        return cards
      }, [])
    }

    return [
      ...addToCards({
        steps: props?.templateSteps?.steps,
        originalSteps: props?.originalSteps,
        unresolvedSteps: props?.unresolvedStepGroupTemplate?.steps,
        parentPath: `${path}.steps`
      })
    ]
  }, [props?.templateSteps, props?.originalSteps, props?.unresolvedStepGroupTemplate, path])

  return (
    <React.Fragment>
      {allSteps.map((row, index) => {
        if (row.type === 'StepRenderData' && row.step && row.originalStep) {
          const { step, originalStep, path: pathStep, unresolvedStep } = row
          const isStepTemplate = !!(unresolvedStep as unknown as TemplateStepNode)?.template

          return (
            <StepCardPanel
              key={index}
              step={step}
              originalStep={originalStep}
              metadataMap={metadataMap}
              stageIdentifier={stageIdentifier}
              stepPath={pathStep}
              readonly={readonly || isStepTemplate}
              allowableTypes={allowableTypes}
              onUpdateStep={onUpdateStep}
              stepsFactory={stepsFactory}
            />
          )
        }

        /* istanbul ignore else */
        if (row.type === 'StepGroupRenderData') {
          const { path: sgPath, stepGroup, originalStepGroup, fullPath, unresolvedStepGroup } = row
          const isStepGroupTemplate = !!(unresolvedStepGroup as unknown as TemplateStepNode)?.template

          return (
            <StepGroupCardPanel
              key={sgPath}
              originalStepGroup={originalStepGroup}
              stepGroup={stepGroup}
              unresolvedStepGroup={unresolvedStepGroup}
              steps={row.steps}
              stepGroupIdentifier={row.identifier}
              path={sgPath}
              metadataMap={metadataMap}
              readonly={readonly || isStepGroupTemplate}
              stageIdentifier={stageIdentifier}
              allowableTypes={allowableTypes}
              fullPath={fullPath}
              onUpdateStep={(data: StepElementConfig, stepPath: string) => {
                onUpdateSGSpec(
                  produce((props?.unresolvedStepGroupTemplate as NGTemplateInfoConfig)?.spec, draft => {
                    if (draft) {
                      set(draft, stepPath, data)
                    }
                  })
                )
              }}
              stepsFactory={stepsFactory}
            />
          )
        }

        return null
      })}
    </React.Fragment>
  )
}
