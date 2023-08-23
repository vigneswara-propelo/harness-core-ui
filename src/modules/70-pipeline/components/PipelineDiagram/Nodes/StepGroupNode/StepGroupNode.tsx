/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as React from 'react'
import cx from 'classnames'
import { Icon, Layout, Text, Button, ButtonVariation, useToaster } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { cloneDeep, debounce, defaultTo, get, isEmpty, isUndefined, set, unset } from 'lodash-es'
import { Link, useParams } from 'react-router-dom'
import { Menu, Popover, Switch } from '@blueprintjs/core'
import { produce } from 'immer'
import {
  getInterruptHistoriesFromType,
  Interrupt,
  isNodeTypeMatrixOrFor,
  STATIC_SERVICE_GROUP_NAME
} from '@pipeline/utils/executionUtils'
import { useStrings } from 'framework/strings'
import {
  isExecutionRunning,
  ExecutionStatus,
  isExecutionSkipped,
  isExecutionNotStarted,
  isExecutionComplete
} from '@pipeline/utils/statusHelpers'
import type { ExecutionGraph, StepGroupElementConfig } from 'services/pipeline-ng'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useUpdateQueryParams } from '@common/hooks'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { stageGroupTypes, StageType } from '@pipeline/utils/stageHelpers'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { updateStepWithinStageViaPath } from '@pipeline/components/PipelineStudio/RightDrawer/RightDrawer'
import { getParentPath } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import { processGroupItem } from '@pipeline/utils/execUtils'
import StepGroupGraph from '../StepGroupGraph/StepGroupGraph'
import { BaseReactComponentProps, NodeType, PipelineGraphState } from '../../types'
import SVGMarker from '../SVGMarker'
import { getBaseDotNotationWithoutEntityIdentifier, getConditionalClassName, getPositionOfAddIcon } from '../utils'
import MatrixNodeLabelWrapper from '../MatrixNodeLabelWrapper'
import AddLinkNode from '../DefaultNode/AddLinkNode/AddLinkNode'
import { DiagramDrag, DiagramType, Event, IS_NODE_TOGGLE_DISABLED } from '../../Constants'
import { useGetRetryStepGroupData } from './useGetRetryStepGroupData'
import css from './StepGroupNode.module.scss'
import defaultCss from '../DefaultNode/DefaultNode.module.scss'

export function StepGroupNode(props: any): JSX.Element {
  const { replaceQueryParams } = useUpdateQueryParams<ExecutionPageQueryParams>()
  const { queryParams, selectedStageId, pipelineExecutionDetail, addNewNodeToMap } = useExecutionContext()
  const allowAdd = defaultTo(props.allowAdd, false)
  const { getString } = useStrings()
  const [showAdd, setVisibilityOfAdd] = React.useState(false)
  const [isNodeCollapsed, setNodeCollapsed] = React.useState(stageGroupTypes.includes(props?.type))
  const [childPipelineData, setChildPipelineData] = React.useState<PipelineGraphState[]>([])
  const [retryStepGroupStepsData, setRetryStepGroupStepsData] = React.useState<any>([])
  const [executionMetaData, setExecutionMetaData] = React.useState<ExecutionGraph['executionMetadata'] | undefined>(
    undefined
  )
  const {
    state: {
      pipelineView,
      selectionState: { selectedStageId: selectedStageIdentifier }
    },
    updateStage,
    updatePipelineView,
    getStageFromPipeline
  } = usePipelineContext()

  const whenCondition = IS_NODE_TOGGLE_DISABLED && props?.data?.stepGroup?.when?.condition === 'false'
  const { stage: selectedStage } = getStageFromPipeline(defaultTo(selectedStageIdentifier, ''))
  const { showPrimary } = useToaster()
  const CreateNode: React.FC<any> | undefined = props?.getNode?.(NodeType.CreateNode)?.component
  const DefaultNode: React.FC<any> | undefined = props?.getDefaultNode()?.component
  const stepGroupData = defaultTo(props?.data?.stepGroup, props?.data?.step?.data?.stepGroup) || props?.data?.step
  const stepsData = stepGroupData?.steps || stepGroupData?.template?.templateInputs?.steps
  const isParentMatrix = defaultTo(props?.isParentMatrix, false)
  const isAnyParentContainerStepGroup =
    props?.data?.isAnyParentContainerStepGroup || !!(props?.data?.stepGroup as StepGroupElementConfig)?.stepGroupInfra
  const { module, source = 'executions' } = useParams<PipelineType<ExecutionPathProps>>()
  const [currentStepGroupRetryId, setCurrentStepGroupRetryId] = React.useState<string>('')
  // Matrix / Looping Strategies baseFqn is present at root level
  const stepGroupBaseFqn = defaultTo(stepGroupData?.data?.baseFqn, stepGroupData?.baseFqn)
  const interruptHistories = React.useMemo(() => {
    return getInterruptHistoriesFromType(
      defaultTo(stepGroupData?.data?.interruptHistories, stepGroupData?.interruptHistories),
      Interrupt.RETRY
    )
  }, [stepGroupData?.data?.interruptHistories, stepGroupData?.interruptHistories])

  const { executionNode, retryStepGroupParams, loading, goToCurrentExecution, goToRetryStepExecution } =
    useGetRetryStepGroupData({
      currentStepGroupRetryId
    })

  React.useEffect(() => {
    let currentStepGrpRetryId = retryStepGroupParams[`${stepGroupBaseFqn}`]
    const isRelated = interruptHistories?.some(
      ({ interruptConfig }) => currentStepGrpRetryId === interruptConfig?.retryInterruptConfig?.retryId
    )

    if (!isRelated) {
      currentStepGrpRetryId = ''
    }
    setCurrentStepGroupRetryId(currentStepGrpRetryId)
  }, [retryStepGroupParams, interruptHistories, stepGroupData?.data, stepGroupBaseFqn])

  React.useEffect(() => {
    if (executionNode?.data?.executionGraph) {
      const items: Array<PipelineGraphState> = []
      const { rootNodeId, nodeAdjacencyListMap, nodeMap } = executionNode.data.executionGraph
      processGroupItem({
        items,
        id: rootNodeId as string,
        isRollbackNext: false,
        nodeAdjacencyListMap,
        nodeMap,
        rootNodes: [],
        isNestedGroup: true
      })
      setRetryStepGroupStepsData(items[0].data?.stepGroup?.steps)
      const newNodeMap = executionNode?.data?.executionGraph?.nodeMap
      for (const nodeId in newNodeMap) {
        Object.assign(newNodeMap[nodeId], { __isInterruptNode: true })
        addNewNodeToMap(nodeId, newNodeMap[nodeId])
      }
    }
  }, [executionNode?.data])

  const stepStatus = defaultTo(props?.status || props?.data?.status, props?.data?.step?.status as ExecutionStatus)
  const isExecutionView = Boolean(stepStatus)
  const displayName =
    props?.type === StageType.PIPELINE_ROLLBACK
      ? getString('pipeline.execution.rollbackStages')
      : props.name || props.identifier
  const showTemplateIcon = !!props.data?.isTemplateNode || !!props?.data?.stepGroup?.template
  const isNestedStepGroup = Boolean(
    get(props, 'data.step.data.isNestedGroup') || (get(props, 'data.isNestedGroup') && props?.parentIdentifier)
  )

  const defaultNodeIcon =
    props?.type === StageType.PIPELINE_ROLLBACK
      ? 'rollback-pipeline'
      : props?.type === StageType.PIPELINE
      ? 'chained-pipeline'
      : 'step-group'

  React.useEffect(() => {
    if (
      stageGroupTypes.includes(props?.type) &&
      (isExecutionRunning(props?.status) || isExecutionComplete(props?.status)) &&
      isNodeCollapsed &&
      childPipelineData &&
      childPipelineData?.length > 0
    ) {
      setNodeCollapsed(false)
    }
  }, [props?.status, childPipelineData])

  React.useEffect(() => {
    if (props?.type === StageType.PIPELINE && !isExecutionRunning(props?.status) && props?.id !== selectedStageId)
      setNodeCollapsed(true)
  }, [props?.status, selectedStageId])

  React.useEffect(() => {
    if (props?.childPipelineData?.length) setChildPipelineData(props?.childPipelineData)
  }, [props?.childPipelineData])

  React.useEffect(() => {
    if (props?.executionMetaData) setExecutionMetaData(props?.executionMetaData)
  }, [props?.executionMetaData])

  React.useEffect(() => {
    props?.updateGraphLinks?.()
  }, [isNodeCollapsed])

  React.useEffect(() => {
    // collapse stepGroup in execution view till data loads
    if (!stageGroupTypes.includes(props?.type)) setNodeCollapsed(stepsData?.length === 0 && isExecutionView)
  }, [stepsData])

  const debounceHideVisibility = debounce(() => {
    setVisibilityOfAdd(false)
  }, 300)

  const nodeType = Object.keys(props?.data?.stepGroup?.strategy || {})[0]
  const showExecutionMetaDataForChainedPipeline = props?.type === StageType.PIPELINE && !!executionMetaData
  const isSGUsedInProvisioner = props?.data?.nodeStateMetadata?.dotNotationPath?.includes('provisioner')
  // To be used for empty state stepGroup create-node
  const baseFqn = getBaseDotNotationWithoutEntityIdentifier(props?.data?.nodeStateMetadata?.dotNotationPath)
  const relativeBasePath = props?.data?.nodeStateMetadata?.relativeBasePath || ''
  const relativeFQNPath = getBaseDotNotationWithoutEntityIdentifier(props?.data?.nodeStateMetadata?.relativeBasePath)
  React.useEffect(() => {
    // collapse stepGroup template
    if (!isEmpty(props?.data?.stepGroup?.template)) {
      setNodeCollapsed(true)
    }
  }, [props?.data?.stepGroup])

  const onToggleClick = (e: React.MouseEvent<Element, MouseEvent>): void => {
    e.stopPropagation()
    e.preventDefault()
    const originalStepData = cloneDeep(props?.data?.stepGroup)
    if (whenCondition) {
      unset(originalStepData, 'when')
    } else {
      set(originalStepData, 'when.condition', 'false')
      set(originalStepData, 'when.stageStatus', 'Success')
    }
    const processingNodeIdentifier = props.identifier
    if (processingNodeIdentifier) {
      const stageData = produce(selectedStage, draft => {
        if (get(draft, getParentPath(isSGUsedInProvisioner))) {
          updateStepWithinStageViaPath(
            get(draft, getParentPath(isSGUsedInProvisioner)),
            originalStepData,
            props?.data?.nodeStateMetadata?.relativeBasePath,
            props?.data?.nodeStateMetadata?.dotNotationPath
          )
        }
      })
      // update view data before updating pipeline because its async
      updatePipelineView(
        produce(pipelineView, draft => {
          set(draft, 'drawerData.data.stepConfig.node', originalStepData)
        })
      )

      if (stageData?.stage) {
        updateStage(stageData.stage)
      }
    }
  }

  const isToggleAllowed = stepStatus || !IS_NODE_TOGGLE_DISABLED

  const retryCount = React.useMemo(() => {
    let rtryCount = interruptHistories.length
    if (currentStepGroupRetryId) {
      rtryCount = interruptHistories.findIndex(
        ({ interruptConfig }) => interruptConfig?.retryInterruptConfig?.retryId === currentStepGroupRetryId
      )
    }
    return rtryCount
  }, [interruptHistories, currentStepGroupRetryId])

  return (
    <>
      {isNodeCollapsed && DefaultNode ? (
        <DefaultNode
          onClick={(event: Event) => {
            if (!isEmpty(props?.data?.stepGroup?.template)) {
              event.stopPropagation()
              debounceHideVisibility()
              props?.fireEvent?.({
                type: Event.StepGroupClicked,
                target: event.target,
                data: { ...props }
              })
              return
            }

            if (!stageGroupTypes.includes(props?.type) && isEmpty(stepsData) && isExecutionView) {
              showPrimary(getString('pipeline.execution.emptyStepGroup'))
            }
            if (stageGroupTypes.includes(props?.type)) {
              // Restrict pipeline rollback stage uncollapsed view in chained pipeline
              const isChildStagePipelineRollback =
                !isEmpty(selectedStageId) &&
                props?.type === StageType.PIPELINE_ROLLBACK &&
                get(pipelineExecutionDetail?.pipelineExecutionSummary, [
                  'layoutNodeMap',
                  `${selectedStageId}`,
                  'nodeType'
                ]) === StageType.PIPELINE
              if (
                isExecutionNotStarted(props?.status) ||
                isExecutionSkipped(props?.status) ||
                isChildStagePipelineRollback
              )
                return

              const params = {
                ...queryParams,
                stage: props?.id,
                ...(childPipelineData &&
                  childPipelineData.length > 0 &&
                  (isNodeTypeMatrixOrFor(childPipelineData[0]?.type)
                    ? {
                        childStage: get(
                          childPipelineData,
                          [0, 'data', 'children', 0, 'stageNodeId'],
                          childPipelineData[0]?.id.split('|')[0]
                        ) as string,
                        stageExecId: get(
                          childPipelineData,
                          [0, 'data', 'children', 0, 'id'],
                          childPipelineData[0]?.id.split('|')[0]
                        ) as string
                      }
                    : { childStage: childPipelineData[0]?.id.split('|')[0] }))
              }
              delete params?.step
              delete params?.collapsedNode
              if (!isNodeTypeMatrixOrFor(childPipelineData[0]?.type)) delete params?.stageExecId
              if (isUndefined(childPipelineData) || isEmpty(childPipelineData)) delete params?.childStage
              replaceQueryParams(params)
              // Once the childPipelineData is available after refresh, the node will uncollapse.
              if (isUndefined(childPipelineData) || isEmpty(childPipelineData)) return
            }
            setNodeCollapsed(false)
          }}
          {...props}
          isNodeCollapsed={true}
          icon={defaultNodeIcon}
          selectedNodeId={stageGroupTypes.includes(props?.type) ? selectedStageId : props?.selectedNodeId} // In order to apply selected node background color on collapsing the node after execution is completed
          onToggleClick={onToggleClick}
        />
      ) : (
        <div style={{ position: 'relative' }}>
          <div
            onMouseOver={e => {
              e.stopPropagation()
              allowAdd && setVisibilityOfAdd(true)
            }}
            onMouseLeave={e => {
              e.stopPropagation()
              allowAdd && debounceHideVisibility()
            }}
            onDragLeave={() => allowAdd && debounceHideVisibility()}
            style={stepGroupData?.containerCss ? stepGroupData?.containerCss : undefined}
            className={cx(css.stepGroup, css.marginBottom, {
              [css.firstnode]: !props?.isParallelNode,
              [css.parallelNodes]: props?.isParallelNode,
              [css.nestedGroup]: isNestedStepGroup,
              [css.stepGroupNormal]: !isNestedStepGroup,
              parentMatrix: isParentMatrix,
              [css.templateStepGroup]: !!props?.data?.isTemplateNode,
              [css.rollbackGroup]: StageType.PIPELINE_ROLLBACK === props?.type,
              [defaultCss.disabled]: whenCondition
            })}
          >
            <div
              className={cx(
                defaultCss.markerStart,
                defaultCss.stepMarker,
                defaultCss.stepGroupMarkerLeft,
                css.markerStart
              )}
            >
              <SVGMarker />
            </div>
            <div
              className={cx(
                defaultCss.markerEnd,
                defaultCss.stepMarker,
                defaultCss.stepGroupMarkerRight,
                css.markerStart
              )}
            >
              <SVGMarker />
            </div>
            {props.data?.loopingStrategyEnabled && (
              <MatrixNodeLabelWrapper isParallelNode={props?.isParallelNode} nodeType={nodeType} />
            )}

            <div
              id={props?.id}
              className={cx('stepGroupNode', css.horizontalBar)}
              data-collapsedNode={isNodeCollapsed}
            ></div>
            {props?.data?.isInComplete && (
              <Icon className={css.incomplete} size={12} name={'warning-sign'} color="orange500" />
            )}
            {props.data?.skipCondition && (
              <div className={css.conditional}>
                <Text
                  tooltip={`Skip condition:\n${props.data?.skipCondition}`}
                  tooltipProps={{
                    isDark: true
                  }}
                >
                  <Icon size={26} name={'conditional-skip-new'} {...getConditionalClassName(whenCondition)} />
                </Text>
              </div>
            )}
            {!isToggleAllowed && (
              <div className={defaultCss.switch} data-testid="toggle-stepGroup-node" onClick={onToggleClick}>
                <Switch aria-label="Global Freeze Toggle" checked={!whenCondition} />
              </div>
            )}
            {props.data?.conditionalExecutionEnabled && (
              <div className={css.conditional}>
                <Text
                  tooltip={getString('pipeline.conditionalExecution.title')}
                  tooltipProps={{
                    isDark: true
                  }}
                >
                  <Icon size={26} name={'conditional-skip-new'} {...getConditionalClassName(whenCondition)} />
                </Text>
              </div>
            )}
            <div
              className={cx(css.stepGroupHeader, {
                [css.pipelineStageHeader]: showExecutionMetaDataForChainedPipeline
              })}
            >
              <Layout.Horizontal spacing="xsmall" flex={{ justifyContent: 'space-between' }} width={'100%'}>
                <Layout.Vertical>
                  <Layout.Horizontal
                    onMouseOver={e => {
                      e.stopPropagation()
                    }}
                    onMouseOut={e => {
                      e.stopPropagation()
                    }}
                    flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                    width={showExecutionMetaDataForChainedPipeline ? '50%' : '100%'}
                  >
                    <Icon
                      className={css.collapseIcon}
                      name="minus"
                      margin={{ right: 'small' }}
                      onClick={e => {
                        e.stopPropagation()
                        setNodeCollapsed(true)
                      }}
                    />
                    <Text
                      data-nodeid={props.id}
                      className={css.cursor}
                      data-test-id="step-group-name"
                      onMouseEnter={event => {
                        event.stopPropagation()
                        props?.fireEvent?.({
                          type: Event.MouseEnterNode,
                          target: event.target,
                          data: { ...props }
                        })
                      }}
                      onMouseLeave={event => {
                        event.stopPropagation()
                        debounceHideVisibility()
                        props?.fireEvent?.({
                          type: Event.MouseLeaveNode,
                          target: event.target,
                          data: { ...props }
                        })
                      }}
                      lineClamp={1}
                      onClick={event => {
                        event.stopPropagation()
                        debounceHideVisibility()
                        props?.fireEvent?.({
                          type: Event.StepGroupClicked,
                          target: event.target,
                          data: { ...props }
                        })
                      }}
                      tooltipProps={{
                        position: 'bottom'
                      }}
                    >
                      {displayName}
                    </Text>
                    {showTemplateIcon && <Icon size={12} name={'template-library'} margin={{ left: 'xsmall' }} />}
                  </Layout.Horizontal>
                  {interruptHistories.length > 0 ? (
                    <Popover
                      wrapperTagName="div"
                      targetTagName="div"
                      minimal
                      position="bottom-left"
                      popoverClassName={css.retryMenu}
                    >
                      <Layout.Horizontal>
                        <Text margin={{ left: 'medium', top: 'small' }} style={{ cursor: 'pointer' }}>
                          {getString('retry')}
                        </Text>
                        <Text
                          rightIcon="chevron-down"
                          rightIconProps={{ size: 12, color: Color.PRIMARY_7 }}
                          margin={{ left: 'medium', top: 'small' }}
                          padding={{ left: 'xsmall' }}
                          style={{ cursor: 'pointer' }}
                          color={Color.PRIMARY_7}
                        >
                          {` #${retryCount + 1}`}
                        </Text>
                      </Layout.Horizontal>

                      <Menu>
                        {interruptHistories.map(({ interruptId, interruptConfig }, i) => (
                          <Menu.Item
                            active={currentStepGroupRetryId === interruptConfig?.retryInterruptConfig?.retryId}
                            key={interruptId}
                            text={getString('pipeline.execution.retryStepCount', { num: i + 1 })}
                            onClick={() =>
                              goToRetryStepExecution(
                                interruptConfig.retryInterruptConfig?.retryId || /* istanbul ignore next */ '',
                                stepGroupData
                              )
                            }
                          />
                        ))}
                        <Menu.Item
                          active={!currentStepGroupRetryId}
                          text={getString('pipeline.execution.retryStepCount', { num: interruptHistories.length + 1 })}
                          onClick={() => goToCurrentExecution(stepGroupData)}
                        />
                      </Menu>
                    </Popover>
                  ) : null}
                </Layout.Vertical>
                {showExecutionMetaDataForChainedPipeline && (
                  <Link
                    to={routes.toExecutionPipelineView({
                      accountId: get(executionMetaData, 'accountId', ''),
                      orgIdentifier: get(executionMetaData, 'orgIdentifier', ''),
                      projectIdentifier: get(executionMetaData, 'projectIdentifier', ''),
                      pipelineIdentifier: get(executionMetaData, 'pipelineIdentifier', '-1'),
                      executionIdentifier: get(executionMetaData, 'planExecutionId', '-1'),
                      module,
                      source
                    })}
                    target="_blank"
                    className={css.childPipelineDetails}
                  >
                    <Text
                      font={{ variation: FontVariation.LEAD }}
                      color={Color.PRIMARY_7}
                      lineClamp={1}
                      style={{ lineHeight: '18px', maxWidth: '90px' }}
                      margin={{ right: 'xsmall' }}
                    >
                      {`${executionMetaData?.pipelineIdentifier}`}
                    </Text>
                    <Text
                      font={{ variation: FontVariation.LEAD }}
                      color={Color.PRIMARY_7}
                      lineClamp={1}
                      style={{ lineHeight: '18px' }}
                    >
                      {`(ID: ${executionMetaData?.runSequence})`}
                    </Text>
                    <Icon name="launch" color={Color.PRIMARY_7} size={14} margin={{ left: 'xsmall' }} />
                  </Link>
                )}
              </Layout.Horizontal>
            </div>
            <div className={css.stepGroupBody}>
              <StepGroupGraph
                {...props}
                isContainerStepGroup={
                  (props?.data?.stepGroup as StepGroupElementConfig)?.stepGroupInfra?.type === 'KubernetesDirect'
                }
                isAnyParentContainerStepGroup={isAnyParentContainerStepGroup}
                data={
                  stageGroupTypes.includes(props?.type)
                    ? childPipelineData
                    : !isEmpty(currentStepGroupRetryId)
                    ? retryStepGroupStepsData
                    : stepsData
                }
                isNodeCollapsed={isNodeCollapsed}
                parentIdentifier={props?.identifier}
                hideLinks={props?.identifier === STATIC_SERVICE_GROUP_NAME}
                setVisibilityOfAdd={setVisibilityOfAdd}
                type={props?.type}
                baseFqn={baseFqn}
                relativeBasePath={relativeBasePath}
                loadingStepGroupGraphData={loading}
              />
            </div>
            {!props.readonly && props?.identifier !== STATIC_SERVICE_GROUP_NAME && (
              <Button
                className={cx(css.closeNode, { [css.readonly]: props.readonly })}
                minimal
                icon="cross"
                variation={ButtonVariation.PRIMARY}
                iconProps={{ size: 10 }}
                onMouseDown={e => {
                  e.stopPropagation()
                  props?.fireEvent?.({
                    type: Event.RemoveNode,
                    data: {
                      identifier: props?.identifier,
                      node: props
                    }
                  })
                }}
                withoutCurrentColor={true}
              />
            )}
          </div>
          {!props.isParallelNode && !props.readonly && (
            <AddLinkNode<BaseReactComponentProps>
              nextNode={props?.nextNode}
              parentIdentifier={props?.parentIdentifier}
              isParallelNode={props.isParallelNode}
              readonly={props.readonly}
              data={props}
              fireEvent={props.fireEvent}
              identifier={props.identifier}
              prevNodeIdentifier={props.prevNodeIdentifier as string}
              relativeBasePath={relativeFQNPath}
              style={{ left: getPositionOfAddIcon(props), top: isNestedStepGroup ? '48px' : '22px' }}
              className={cx(defaultCss.addNodeIcon, 'stepAddIcon', defaultCss.stepGroupAddIcon)}
              isAnyParentContainerStepGroup={isAnyParentContainerStepGroup}
            />
          )}
          {!props?.nextNode && props?.parentIdentifier && !props.readonly && !props.isParallelNode && (
            <AddLinkNode<BaseReactComponentProps>
              nextNode={props?.nextNode}
              style={{ right: getPositionOfAddIcon(props, true), top: isNestedStepGroup ? '48px' : '22px' }}
              parentIdentifier={props?.parentIdentifier}
              isParallelNode={props.isParallelNode}
              readonly={props.readonly}
              data={props}
              fireEvent={props.fireEvent}
              isRightAddIcon={true}
              identifier={props.identifier}
              relativeBasePath={relativeFQNPath}
              prevNodeIdentifier={props.prevNodeIdentifier as string}
              className={cx(defaultCss.addNodeIcon, 'stepAddIcon')}
              isAnyParentContainerStepGroup={
                isAnyParentContainerStepGroup && !(props?.data?.stepGroup as StepGroupElementConfig)?.stepGroupInfra
              }
            />
          )}
          {allowAdd && !props.readonly && CreateNode && (
            <CreateNode
              className={cx(
                defaultCss.addNode,
                { [defaultCss.visible]: showAdd },
                { [defaultCss.marginBottom]: props?.isParallelNode }
              )}
              wrapperClassname={defaultCss.floatingAddNodeWrapper}
              onMouseOver={() => allowAdd && setVisibilityOfAdd(true)}
              onMouseLeave={() => allowAdd && debounceHideVisibility()}
              onDragLeave={debounceHideVisibility}
              onDrop={(event: any) => {
                props?.fireEvent?.({
                  type: Event.DropNodeEvent,
                  data: {
                    entityType: DiagramType.Default,
                    node: JSON.parse(event.dataTransfer.getData(DiagramDrag.NodeDrag)),
                    destination: props
                  }
                })
              }}
              onClick={(event: any): void => {
                event.stopPropagation()
                props?.fireEvent?.({
                  type: Event.AddParallelNode,
                  target: event.target,
                  data: {
                    identifier: props?.identifier,
                    parentIdentifier: props?.parentIdentifier,
                    entityType: DiagramType.StepGroupNode,
                    node: props,
                    relativeBasePath: relativeFQNPath
                  }
                })
              }}
              name={''}
              hidden={!showAdd}
            />
          )}
        </div>
      )}
    </>
  )
}
