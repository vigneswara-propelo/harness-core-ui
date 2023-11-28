/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, Popover, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { get, omit, defaultTo, isEmpty } from 'lodash-es'
import { Menu } from '@blueprintjs/core'
import type { ExecutionNode } from 'services/pipeline-ng'
import { String as Template, useStrings } from 'framework/strings'
import type {
  ExecutionPipelineGroupInfo,
  ExecutionPipelineItem,
  ExecutionPipelineNode
} from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { Duration, DynamicPopover } from '@common/components'
import {
  isExecutionRunning,
  isExecutionSuccess,
  isExecutionNotStarted,
  isExecutionQueued,
  ExecutionStatusEnum,
  ExecutionStatus,
  isExecutionWaitingForInput
} from '@pipeline/utils/statusHelpers'
import { getInterruptHistoriesFromType, getStepsTreeStatus, Interrupt } from '@pipeline/utils/executionUtils'
import { useGetRetryStepGroupData } from '@pipeline/components/PipelineDiagram/Nodes/StepGroupNode/useGetRetryStepGroupData'
import { DynamicPopoverHandlerBinding } from '@modules/10-common/components/DynamicPopover/DynamicPopover'
import HoverCard from '@modules/70-pipeline/components/HoverCard/HoverCard'
import ConditionalExecutionTooltipWrapper from '@modules/70-pipeline/components/ConditionalExecutionToolTip/ConditionalExecutionTooltipWrapper'
import { StepType } from '@modules/70-pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { getRetryInterrupts, getStepDisplayName } from './utils'
import { StatusIcon } from './StatusIcon'
import VerifyStepTooltip from '../../ExecutionGraphView/ExecutionStageDetails/components/VerifyStepTooltip/VerifyStepTooltip'
import { FailureInfo } from '../../ExecutionGraphView/ExecutionStageDetails/components/VerifyStepTooltip/VerifyStepTooltip.types'
import stageCss from '../StageSelection/StageSelection.module.scss'
import css from './StepsTree.module.scss'

export interface StepsTreeProps {
  nodes: Array<ExecutionPipelineNode<ExecutionNode>>
  selectedStepId?: string
  onStepSelect(stepId: string, retryId?: string): void
  isRoot?: boolean
  retryStep?: string
  allNodeMap: Record<string, ExecutionNode>
  openExecutionTimeInputsForStep(node?: ExecutionNode): void
}

type StepOrStepGroupPopoverData = ExecutionPipelineGroupInfo<ExecutionNode> | ExecutionPipelineItem<ExecutionNode>

interface RetryStepGroupDropdownProps {
  stepGroupData: ExecutionPipelineNode<ExecutionNode>
  commonProps: Omit<StepsTreeProps, 'nodes' | 'isRoot'>
}

export function RetryStepGroupDropdown(props: RetryStepGroupDropdownProps): JSX.Element {
  const { stepGroupData, commonProps } = props
  const [currentStepGroupRetryId, setCurrentStepGroupRetryId] = React.useState<string>('')
  const { retryStepGroupParams, retryStepGroupStepsData, goToRetryStepExecution, goToCurrentExecution } =
    useGetRetryStepGroupData({ currentStepGroupRetryId })
  const interruptHistories = getRetryInterrupts(stepGroupData)

  if (interruptHistories.length > 0) {
    let currentStepGrpRetryId = retryStepGroupParams[`${stepGroupData?.group?.data.baseFqn}`]
    const isRelated = interruptHistories?.some(
      ({ interruptConfig }) => currentStepGrpRetryId === interruptConfig?.retryInterruptConfig?.retryId
    )

    if (!isRelated) {
      currentStepGrpRetryId = ''
    }
    if (currentStepGrpRetryId !== currentStepGroupRetryId) {
      setCurrentStepGroupRetryId(currentStepGrpRetryId)
    }
  }
  let retryCount = interruptHistories.length
  if (currentStepGroupRetryId) {
    retryCount = interruptHistories.findIndex(
      ({ interruptConfig }) => interruptConfig?.retryInterruptConfig?.retryId === currentStepGroupRetryId
    )
    if (retryCount === -1) {
      retryCount = interruptHistories.length
    }
  }
  const { getString } = useStrings()
  return (
    <>
      {interruptHistories.length > 0 && (
        <Popover
          wrapperTagName="div"
          targetTagName="div"
          minimal
          position="bottom-left"
          popoverClassName={css.retryMenu}
        >
          <Layout.Horizontal border={{ bottom: true, color: Color.GREY_50 }} padding={{ bottom: 'small' }}>
            <Text margin={{ left: 'xxlarge' }} style={{ cursor: 'pointer' }} font={{ size: 'small' }}>
              {getString('pipeline.retryHistory')}
            </Text>
            <Text
              rightIcon="chevron-down"
              rightIconProps={{ size: 12, color: Color.PRIMARY_7 }}
              margin={{ left: 'medium' }}
              padding={{ left: 'xsmall' }}
              style={{ cursor: 'pointer' }}
              color={Color.PRIMARY_7}
              font={{ size: 'small' }}
            >
              {` #${retryCount + 1}`}
            </Text>
          </Layout.Horizontal>
          <Menu>
            {interruptHistories.map(({ interruptId, interruptConfig }, ind) => (
              <Menu.Item
                active={currentStepGroupRetryId === interruptConfig?.retryInterruptConfig?.retryId}
                key={interruptId}
                text={getString('pipeline.execution.retryStepCount', { num: ind + 1 })}
                onClick={() =>
                  goToRetryStepExecution(
                    interruptConfig.retryInterruptConfig?.retryId || /* istanbul ignore next */ '',
                    stepGroupData.group
                  )
                }
              />
            ))}
            <Menu.Item
              active={!currentStepGroupRetryId}
              text={getString('pipeline.execution.retryStepCount', {
                num: interruptHistories.length + 1
              })}
              onClick={() => goToCurrentExecution(stepGroupData.group)}
            />
          </Menu>
        </Popover>
      )}
      <StepsTree
        nodes={
          (!isEmpty(currentStepGroupRetryId)
            ? retryStepGroupStepsData
            : stepGroupData?.group?.items) as ExecutionPipelineNode<ExecutionNode>[]
        }
        {...commonProps}
      />
    </>
  )
}

export function StepsTree(props: StepsTreeProps): React.ReactElement {
  const { nodes, selectedStepId, onStepSelect, isRoot, retryStep, allNodeMap, openExecutionTimeInputsForStep } = props
  const { getString } = useStrings()
  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<{ data: StepOrStepGroupPopoverData }> | undefined
  >()
  const commonProps: Omit<StepsTreeProps, 'nodes' | 'isRoot'> = {
    selectedStepId,
    onStepSelect,
    retryStep,
    allNodeMap,
    openExecutionTimeInputsForStep
  }

  function handleStepSelect(identifier: string, status?: string, retryId?: string): void {
    if (isExecutionNotStarted(status) || isExecutionQueued(status)) {
      return
    }

    onStepSelect(identifier, retryId)
  }

  const renderPopover = ({ data: stepInfo }: { data: StepOrStepGroupPopoverData }): JSX.Element => {
    return (
      <HoverCard data={stepInfo}>
        {stepInfo?.when && <ConditionalExecutionTooltipWrapper data={stepInfo.when} mode={Modes.STEP} />}
        {stepInfo?.data?.stepType === StepType.Verify && stepInfo?.data?.status === 'Skipped' && (
          <VerifyStepTooltip failureInfo={stepInfo?.data?.failureInfo as FailureInfo} />
        )}
      </HoverCard>
    )
  }

  const onMouseLeave = (): void => {
    dynamicPopoverHandler?.hide()
  }

  const onMouseEnter = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, data?: StepOrStepGroupPopoverData): void => {
    dynamicPopoverHandler?.show(
      e.target as Element,
      {
        data: data as StepOrStepGroupPopoverData
      },
      { useArrows: true, darkMode: false, fixedPosition: false, placement: 'right' }
    )
  }

  return (
    <>
      <ul className={css.root}>
        {nodes.map((step, i) => {
          if (step.item) {
            const status = getStepsTreeStatus({ step, allNodeMap }) || step.item.status
            const statusLower = status.toLowerCase()
            const retryInterrupts = getRetryInterrupts(step)

            if (retryInterrupts.length > 0) {
              const retryNodes: Array<ExecutionPipelineNode<ExecutionNode>> = getInterruptHistoriesFromType(
                step.item.data?.interruptHistories,
                Interrupt.RETRY
              ).map((node, k): { item: ExecutionPipelineItem<ExecutionNode> } => ({
                item: {
                  ...(step.item as ExecutionPipelineItem<ExecutionNode>),
                  name: getString('pipeline.execution.retryStepCount', { num: k + 1 }),
                  retryId: defaultTo(node.interruptConfig.retryInterruptConfig?.retryId, ''),
                  status: ExecutionStatusEnum.Failed,
                  // override data in order to stop infinite loop
                  data: defaultTo(
                    omit(
                      get(allNodeMap, defaultTo(node.interruptConfig.retryInterruptConfig?.retryId, '')),
                      'interruptHistories'
                    ),
                    {}
                  )
                }
              }))

              const num = retryNodes.length + 1

              retryNodes.push({
                item: {
                  ...(step.item as ExecutionPipelineItem<ExecutionNode>),
                  name: getString('pipeline.execution.retryStepCount', { num }),
                  data: omit(step.item.data, 'interruptHistories') // override data in order to stop infinite loop
                }
              })
              const name = getStepDisplayName(step.item)
              return (
                <li key={step.item.identifier} className={css.item} data-type="retry-item">
                  <div
                    className={css.step}
                    data-status={statusLower}
                    onMouseEnter={e => {
                      onMouseEnter(e, step.item)
                    }}
                    onMouseLeave={onMouseLeave}
                  >
                    <StatusIcon className={css.icon} status={status as ExecutionStatus} />
                    <Text className={cx(css.name, stageCss.entityName)}>{name}</Text>
                  </div>
                  <StepsTree nodes={retryNodes} {...commonProps} />
                </li>
              )
            }

            const shouldShowExecutionInputs =
              !!step.item.data?.executionInputConfigured && isExecutionWaitingForInput(step.item.status)
            const key = defaultTo(step.item.retryId, step.item.identifier)
            const name = getStepDisplayName(step.item)
            return (
              <li
                className={cx(css.item, {
                  [css.active]: step.item?.retryId === retryStep && selectedStepId === step.item.identifier
                })}
                key={key}
                data-type="item"
              >
                <div
                  className={css.step}
                  data-status={statusLower}
                  onClick={() =>
                    handleStepSelect(step.item?.identifier as string, step.item?.status, step.item?.retryId)
                  }
                  onMouseEnter={e => {
                    onMouseEnter(e, step.item)
                  }}
                  onMouseLeave={onMouseLeave}
                >
                  <StatusIcon className={css.icon} status={status as ExecutionStatus} />
                  <Text className={cx(css.name, stageCss.entityName)}>{name}</Text>
                  {shouldShowExecutionInputs ? (
                    <button
                      className={stageCss.inputWaiting}
                      onClick={() => openExecutionTimeInputsForStep(step.item?.data)}
                    >
                      <Icon name="runtime-input" size={12} />
                    </button>
                  ) : (
                    <Duration
                      className={css.duration}
                      startTime={step.item.data?.startTs}
                      endTime={step.item.data?.endTs}
                      durationText={' '}
                      icon={null}
                    />
                  )}
                </div>
              </li>
            )
          }

          if (step.group) {
            const status = getStepsTreeStatus({ step, allNodeMap }) || step.group.status
            const statusLower = status.toLowerCase()
            const name = getStepDisplayName(step.group)
            return (
              <li className={css.item} key={step.group.identifier} data-type="group">
                <div
                  className={css.step}
                  data-status={statusLower}
                  onMouseEnter={e => {
                    onMouseEnter(e, step.group)
                  }}
                  onMouseLeave={onMouseLeave}
                >
                  <StatusIcon className={css.icon} status={status as ExecutionStatus} />
                  <div className={css.nameWrapper}>
                    {isRoot ? null : <div className={css.groupIcon} />}
                    {name ? (
                      <Text className={cx(css.name, stageCss.entityName)}>{name}</Text>
                    ) : (
                      <Template className={css.name} stringID="stepGroup" />
                    )}
                  </div>

                  <Duration
                    className={css.duration}
                    startTime={step.group.data?.startTs}
                    endTime={step.group.data?.endTs}
                    durationText={' '}
                    icon={null}
                  />
                </div>
                <RetryStepGroupDropdown stepGroupData={step} commonProps={commonProps} />
              </li>
            )
          }

          /* istanbul ignore else */
          if (step.parallel) {
            // here assumption is that parallel steps cannot have nested parallel steps
            const isRunning =
              step.parallel.some(pStep => isExecutionRunning(defaultTo(pStep.item?.status, pStep.group?.status))) ||
              step.parallel.some(pStep =>
                isExecutionRunning(
                  getStepsTreeStatus({
                    step: pStep,
                    allNodeMap
                  }) as ExecutionStatus
                )
              )
            const isSuccess = step.parallel.every(pStep =>
              isExecutionSuccess(defaultTo(pStep.item?.status, pStep.group?.status))
            )

            let status = ''

            if (isRunning) {
              status = ExecutionStatusEnum.Running
            } else if (isSuccess) {
              status = ExecutionStatusEnum.Success
            } else {
              // find first non success state
              const nonSuccessStep = step.parallel.find(
                pStep => !isExecutionSuccess(defaultTo(pStep.item?.status, pStep.group?.status))
              )

              /* istanbul ignore else */
              if (nonSuccessStep) {
                status = defaultTo(defaultTo(nonSuccessStep.item?.status, nonSuccessStep.group?.status), '')
              }
            }

            return (
              <li className={css.item} key={i} data-type="parallel">
                <div className={css.step} data-status={status.toLowerCase()}>
                  <StatusIcon className={css.icon} status={status as ExecutionStatus} />
                  <div className={css.nameWrapper}>
                    {isRoot ? null : <div className={css.parallelIcon} />}
                    <Template className={css.name} stringID="parallelSteps" />
                  </div>
                </div>
                <StepsTree nodes={step.parallel} {...commonProps} />
              </li>
            )
          }

          /* istanbul ignore next */
          return null
        })}
      </ul>
      <DynamicPopover
        hoverHideDelay={50}
        render={renderPopover}
        bind={setDynamicPopoverHandler}
        closeOnMouseOut
        usePortal
      />
    </>
  )
}
