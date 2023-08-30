/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import produce from 'immer'
import { set } from 'lodash-es'
import { AllowedTypes, NestedAccordionPanel, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import type {
  ExecutionElementConfig,
  ExecutionWrapperConfig,
  StepElementConfig,
  StepGroupElementConfig
} from 'services/cd-ng'

import type { TemplateStepNode } from 'services/pipeline-ng'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { AllNGVariables } from '@pipeline/utils/types'
import type { PipelineVariablesData } from '../types'
import { StepCardPanel, StepGroupCardPanel } from './StepCard'
import VariableAccordionSummary from '../VariableAccordionSummary'
import css from '../PipelineVariables.module.scss'

export interface AddStepsParams {
  steps?: ExecutionWrapperConfig[]
  originalSteps?: ExecutionWrapperConfig[]
  unresolvedSteps?: ExecutionWrapperConfig[]
  parentPath?: string
  fullParentPath?: string
}

export interface StepRenderData {
  step: StepElementConfig | TemplateStepNode
  originalStep: StepElementConfig | TemplateStepNode
  path: string
  fullPath: string
  type: 'StepRenderData'
  unresolvedStep?: StepElementConfig | TemplateStepNode
}

export interface StepGroupRenderData {
  steps: Array<StepRenderData>
  name: string
  originalName: string
  identifier: string
  path: string
  fullPath: string
  type: 'StepGroupRenderData'
  stepGroup: StepGroupElementConfig
  originalStepGroup: StepGroupElementConfig
  variables?: AllNGVariables[]
  unresolvedStepGroup?: StepGroupElementConfig
}

export interface ExecutionCardProps {
  id: string
  title: string
  execution: ExecutionElementConfig
  originalExecution: ExecutionElementConfig
  metadataMap: PipelineVariablesData['metadataMap']
  stageIdentifier: string
  onUpdateExecution(data: ExecutionElementConfig): void
  allowableTypes: AllowedTypes
  stepsFactory: AbstractStepFactory
  unresolvedExecution?: ExecutionElementConfig
  readonly?: boolean
  path?: string
}

export function ExecutionCard(props: ExecutionCardProps): React.ReactElement {
  const {
    execution,
    originalExecution,
    unresolvedExecution,
    metadataMap,
    stageIdentifier,
    onUpdateExecution,
    readonly,
    path,
    allowableTypes,
    stepsFactory
  } = props

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
        steps: execution.steps,
        originalSteps: originalExecution.steps,
        unresolvedSteps: unresolvedExecution?.steps,
        parentPath: `${path}.steps`
      }),
      ...addToCards({
        steps: execution.rollbackSteps,
        originalSteps: originalExecution.rollbackSteps,
        unresolvedSteps: unresolvedExecution?.rollbackSteps,
        parentPath: `${path}.rollbackSteps`
      })
    ]
  }, [execution, originalExecution, unresolvedExecution])

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
              stepPath={pathStep}
              metadataMap={metadataMap}
              readonly={readonly || isStepTemplate}
              stageIdentifier={stageIdentifier}
              allowableTypes={allowableTypes}
              onUpdateStep={(data: StepElementConfig, stepPath: string) => {
                onUpdateExecution(
                  produce(unresolvedExecution as ExecutionElementConfig, draft => {
                    set(draft, stepPath, data)
                  })
                )
              }}
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
                onUpdateExecution(
                  produce(unresolvedExecution as ExecutionElementConfig, draft => {
                    set(draft, stepPath, data)
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

export function ExecutionCardPanel(props: ExecutionCardProps): React.ReactElement {
  return (
    <NestedAccordionPanel
      noAutoScroll
      isDefaultOpen
      addDomId
      id={props.id}
      collapseProps={{
        keepChildrenMounted: true
      }}
      summary={
        <VariableAccordionSummary>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
            {props.title}
          </Text>
        </VariableAccordionSummary>
      }
      panelClassName={css.panel}
      details={<ExecutionCard {...props} />}
    />
  )
}
