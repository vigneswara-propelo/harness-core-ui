/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Text, Layout, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Link } from 'react-router-dom'
import { defaultTo, isArray, isEmpty, isNil, isUndefined } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'
import { Duration } from '@common/exports'
import { useDelegateSelectionLogsModal } from '@common/components/DelegateSelectionLogs/DelegateSelectionLogs'
import {
  DelegateInfo,
  ExecutableResponse,
  ExecutionGraph,
  ExecutionNode,
  InterruptEffectDTO,
  getApprovalInstancePromise
} from 'services/pipeline-ng'
import { String, useStrings } from 'framework/strings'
import { IfPrivateAccess } from 'framework/components/PublicAccess/PublicAccess'
import routes from '@common/RouteDefinitions'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import {
  ExecutionStatusEnum,
  isExecutionComplete,
  isExecutionCompletedWithBadState
} from '@pipeline/utils/statusHelpers'
import { TaskContext } from '@common/components/DelegateTaskLogs/DelegateTaskLogs'
import DelegateTaskLogsButton from '@common/components/DelegateTaskLogs/DelegateTaskLogsButton'
import { encodeURIWithReservedChars } from './utils'

import css from './StepDetails.module.scss'

interface Task {
  taskId: string
  taskName: string
  delegateName?: string
  delegateId?: string
  name?: string
}
export interface StepLabels {
  label: string
  value: React.ReactNode
}

export interface StepDetailsProps {
  step: ExecutionNode
  latestDelegateTaskId?: string
  delegateTaskName?: string
  executionMetadata: ExecutionGraph['executionMetadata']
  labels?: StepLabels[]
  progressData?: {
    [key: string]: string
  }
  ticketStatus?: string
  approvalInstanceMetadata?: any
  interruptHistoryData?: InterruptEffectDTO
}

export function StepDetails(props: StepDetailsProps): React.ReactElement {
  const {
    step,
    executionMetadata,
    labels = [],
    progressData,
    ticketStatus,
    latestDelegateTaskId,
    delegateTaskName,
    approvalInstanceMetadata,
    interruptHistoryData
  } = props
  const { getString } = useStrings()
  const [loader, setLoader] = useState<boolean>(false)
  const { orgIdentifier, projectIdentifier, accountId } = defaultTo(executionMetadata, {})
  //TODO - types will modified when the backend swagger docs are updated
  const deploymentTag = step?.stepParameters?.deploymentTag as any
  const serviceIdentifier = step?.stepParameters?.serviceIdentifier as any
  const activityId = step?.progressData?.activityId as any
  const estimatedRemainingTime = step?.progressData?.estimatedRemainingTime
  const progressPercentage = step?.progressData?.progressPercentage
  const timeout = step?.stepParameters?.timeout as any
  const retryInterval = step?.stepParameters?.spec?.retryInterval?.timeoutString as string | undefined
  const [taskList, setTaskList] = React.useState<Array<ExecutableResponse>>([])
  const { openDelegateSelectionLogsModal } = useDelegateSelectionLogsModal()

  React.useEffect(() => {
    let tasks: Task[] = defaultTo(
      step.executableResponses?.map(item => item.taskChain || item.task).filter(item => item !== undefined),
      []
    )
    if (step?.stepDetails && !isEmpty(step?.stepDetails) && isEmpty(tasks)) {
      tasks = []
      const stepDetailsKeys = Object.keys(step?.stepDetails)
      stepDetailsKeys.forEach(stepDetailsKey => {
        const stepDelegateInfos = step.stepDetails?.[stepDetailsKey]?.stepDelegateInfos?.filter(
          (item: Task) => item !== undefined
        )
        stepDelegateInfos?.forEach((stepDelegateInfo: Task) => {
          tasks.push({
            ...stepDelegateInfo,
            name: defaultTo(stepDelegateInfo?.delegateName, stepDelegateInfo.name)
          })
        })
      })
    }
    if (tasks) {
      setTaskList(tasks)
    }
  }, [step.executableResponses])

  const showDelegateRow = (delegateList: DelegateInfo[] | undefined, tasks: ExecutableResponse[]): boolean => {
    return (
      (delegateList && delegateList?.length > 0) ||
      tasks?.length > 0 ||
      !isUndefined(progressData?.latestDelegateTaskId || latestDelegateTaskId)
    )
  }

  const delegateListContainsTask = (delegateList: DelegateInfo[] | undefined, taskId: string): boolean => {
    return !!delegateList?.find((item: DelegateInfo) => item.taskId === taskId)
  }

  const delegateInfoList = !isEmpty(step.delegateInfoList) ? step.delegateInfoList : taskList
  const delegateLogsAvailable =
    (step.startTs !== undefined && !isEmpty(delegateInfoList)) ||
    (step.startTs !== undefined && step.stepDetails && Object.keys(step.stepDetails).length > 0)

  const taskIds = delegateInfoList?.map(delegate => delegate.taskId || '')?.filter(a => a)
  const startTime = Math.floor((step?.startTs as number) / 1000)
  const endTime = Math.floor((step?.endTs || Date.now()) / 1000)

  const handleSelectionLogClick = (): void => {
    setLoader(true)
    const approvalData = {
      taskId: defaultTo(latestDelegateTaskId || progressData?.latestDelegateTaskId, ''),
      taskName: defaultTo(delegateTaskName || progressData?.taskName, '')
    }
    getApprovalInstancePromise({
      approvalInstanceId: approvalInstanceMetadata?.approvalInstanceId,
      pathParams: { approvalInstanceId: approvalInstanceMetadata?.approvalInstanceId },
      queryParams: { accountIdentifier: accountId }
    })
      .then(data => {
        approvalData.taskId = defaultTo(
          data?.data?.details?.latestDelegateTaskId || progressData?.latestDelegateTaskId,
          ''
        )
        approvalData.taskName = defaultTo(data?.data?.details?.delegateTaskName || progressData?.taskName, '')
      })
      .finally(() => {
        setLoader(false)
        openDelegateSelectionLogsModal(approvalData)
      })
  }

  const getInterruptAppliedByLabel = React.useMemo(() => {
    const issuedBy = interruptHistoryData?.interruptConfig?.issuedBy
    return issuedBy?.manualIssuer
      ? defaultTo(issuedBy.manualIssuer.email_id, '')
      : issuedBy?.timeoutIssuer
      ? getString('pipeline.failureStrategies.fieldLabels.onTimeoutLabel')
      : getString('pipeline.failureStrategies.title')
  }, [interruptHistoryData, getString])

  if (loader) {
    return (
      <Layout.Vertical height="100%" flex={{ alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </Layout.Vertical>
    )
  }
  return (
    <table className={css.detailsTable}>
      <tbody>
        <tr>
          <th>{`${getString('startedAt')}:`}</th>
          <td>{step?.startTs ? new Date(step.startTs).toLocaleString() : '-'}</td>
        </tr>
        <tr>
          <th>{`${getString('endedAt')}:`}</th>
          <td>{step?.endTs ? new Date(step.endTs).toLocaleString() : '-'}</td>
        </tr>

        <tr>
          <th>{`${getString('pipeline.duration')}:`}</th>
          <td>
            <Duration className={css.timer} durationText="" startTime={step?.startTs} endTime={step?.endTs} />
          </td>
        </tr>
        {!!timeout && (
          <tr>
            <th>{`${getString('pipelineSteps.timeoutLabel')}:`}</th>
            <td>{timeout}</td>
          </tr>
        )}
        {typeof retryInterval === 'string' && (
          <tr data-testid="retry-interval-row">
            <th>{`${getString('pipeline.customApprovalStep.retryInterval')}:`}</th>
            <td>{retryInterval}</td>
          </tr>
        )}
        {interruptHistoryData && !isEmpty(interruptHistoryData) && (
          <>
            <tr>
              <th>{`${getString('pipeline.failureStrategies.fieldLabels.failureStrategyApplied')}:`}</th>
              <td>{interruptHistoryData?.interruptType}</td>
            </tr>
            <tr>
              <th>{`${getString('pipeline.failureStrategies.appliedBy')}:`}</th>
              <td>
                {getInterruptAppliedByLabel}
                {interruptHistoryData?.tookEffectAt
                  ? ` ( ${new Date(interruptHistoryData?.tookEffectAt).toLocaleString()} ) `
                  : ''}
              </td>
            </tr>
          </>
        )}
        {ticketStatus && (
          <tr>
            <th>{`${getString('pipeline.ticketStatus')}:`}</th>
            <td>{ticketStatus}</td>
          </tr>
        )}
        {labels.map((label, index) => (
          <tr key={index}>
            <th>{`${label.label}:`}</th>
            <td>
              {isArray(label.value)
                ? label.value.map((outcome, idx) => {
                    if (!isNil(outcome) && !isEmpty(outcome)) {
                      return (
                        <>
                          {idx > 0 && ', '}
                          <span key={idx}>{outcome}</span>
                        </>
                      )
                    }
                  })
                : label.value}
            </td>
          </tr>
        ))}
        {(showDelegateRow(delegateInfoList, taskList) || step.stepDetails?.initStepV2DelegateTaskInfo) && (
          <tr className={css.delegateRow}>
            <th>
              {isExecutionCompletedWithBadState(step.status) && (
                <Icon className={css.iconLabel} size={12} name="warning-sign" color={Color.ORANGE_500} />
              )}
              {`${getString('delegate.delegates')}:`}
            </th>
            <td>
              <Layout.Vertical spacing="small">
                {delegateInfoList &&
                  delegateInfoList.length > 0 &&
                  delegateInfoList.map((item, index) => (
                    <div key={`${item.id}-${index}`}>
                      <Text font={{ size: 'small', weight: 'bold' }}>
                        <String
                          stringID="common.delegateForTask"
                          vars={{ delegate: defaultTo(item.name, ''), taskName: item.taskName }}
                          useRichText
                        />
                      </Text>{' '}
                      <IfPrivateAccess>
                        (
                        <Text
                          font={{ size: 'small' }}
                          onClick={() =>
                            openDelegateSelectionLogsModal({
                              taskId: item.taskId as string,
                              taskName: item.taskName as string,
                              delegateName: item.name as string
                            })
                          }
                          style={{ cursor: 'pointer' }}
                          color={Color.PRIMARY_7}
                        >
                          {getString('common.logs.delegateSelectionLogs')}
                        </Text>
                        )
                      </IfPrivateAccess>
                    </div>
                  ))}
                {step.stepDetails?.initStepV2DelegateTaskInfo && (
                  <div key={`${step.stepDetails?.initStepV2DelegateTaskInfo.taskID}`}>
                    <Text font={{ size: 'small', weight: 'bold' }}>
                      <String
                        stringID="common.delegateForTask"
                        vars={{ taskName: step.stepDetails?.initStepV2DelegateTaskInfo.taskName }}
                        useRichText
                      />
                    </Text>{' '}
                    <IfPrivateAccess>
                      (
                      <Text
                        font={{ size: 'small' }}
                        onClick={() =>
                          openDelegateSelectionLogsModal({
                            taskId: step.stepDetails?.initStepV2DelegateTaskInfo.taskID as unknown as string,
                            taskName: step.stepDetails?.initStepV2DelegateTaskInfo.taskName as unknown as string
                          })
                        }
                        style={{ cursor: 'pointer' }}
                        color={Color.PRIMARY_7}
                      >
                        {getString('common.logs.delegateSelectionLogs')}
                      </Text>
                      )
                    </IfPrivateAccess>
                  </div>
                )}
                {taskList &&
                  taskList.length > 0 &&
                  taskList.map((item, index) =>
                    delegateListContainsTask(delegateInfoList, item.taskId) ? null : (
                      <div key={`${item.taskId}-${index}`}>
                        {isExecutionComplete(step.status) ? (
                          <Text font={{ size: 'small', weight: 'bold' }} color={Color.ORANGE_500}>
                            <String
                              stringID="common.noDelegateForTask"
                              vars={{ taskName: item.taskName }}
                              useRichText
                            />
                          </Text>
                        ) : (
                          <Text font={{ size: 'small', weight: 'bold' }}>
                            <String
                              stringID="common.delegateForTask"
                              vars={{ delegate: defaultTo(item.name, ''), taskName: item.taskName }}
                              useRichText
                            />
                          </Text>
                        )}{' '}
                        <IfPrivateAccess>
                          (
                          <Text
                            font={{ size: 'small' }}
                            onClick={() =>
                              openDelegateSelectionLogsModal({
                                taskId: item.taskId as string,
                                taskName: item.taskName as string
                              })
                            }
                            style={{ cursor: 'pointer' }}
                            color={Color.PRIMARY_7}
                          >
                            {getString('common.logs.delegateSelectionLogs')}
                          </Text>
                          )
                        </IfPrivateAccess>
                      </div>
                    )
                  )}
                {((latestDelegateTaskId && delegateTaskName) || progressData?.latestDelegateTaskId) && (
                  <div key={latestDelegateTaskId || progressData?.latestDelegateTaskId}>
                    <Text font={{ size: 'small', weight: 'bold' }}>
                      <String
                        stringID="common.delegateForTask"
                        vars={{ taskName: progressData?.taskName || delegateTaskName }}
                        useRichText
                      />
                    </Text>{' '}
                    <IfPrivateAccess>
                      (
                      <Text
                        font={{ size: 'small' }}
                        onClick={handleSelectionLogClick}
                        style={{ cursor: 'pointer' }}
                        color={Color.PRIMARY_7}
                      >
                        {getString('common.logs.delegateSelectionLogs')}
                      </Text>
                      )
                    </IfPrivateAccess>
                  </div>
                )}
                <IfPrivateAccess>
                  <DelegateTaskLogsButton
                    startTime={startTime}
                    endTime={endTime}
                    taskIds={taskIds?.length ? taskIds : [step.stepDetails?.initStepV2DelegateTaskInfo?.taskID] || []}
                    telemetry={{
                      taskContext: TaskContext.PipelineStep,
                      hasError: isExecutionCompletedWithBadState(step.status)
                    }}
                    areLogsAvailable={delegateLogsAvailable}
                  />
                </IfPrivateAccess>
              </Layout.Vertical>
            </td>
          </tr>
        )}
        {/* TODO - this will be moved to step level once the support is added in pipeline factory */}
        {step.stepType === StepType.Verify &&
          deploymentTag &&
          serviceIdentifier &&
          step?.status !== ExecutionStatusEnum.Queued && (
            <>
              {estimatedRemainingTime && (
                <tr>
                  <th>{`${getString('pipeline.estimatedTimeRemaining')}:`}</th>
                  <td>{estimatedRemainingTime}</td>
                </tr>
              )}
              {(progressPercentage || progressPercentage === 0) && (
                <tr>
                  <th>{`${getString('pipeline.progressPercentage')}:`}</th>
                  <td>{progressPercentage}</td>
                </tr>
              )}
              <tr>
                <th>{`${getString('pipeline.verificationResult')}:`}</th>
                <td>
                  <Link
                    to={routes.toCVDeploymentPage({
                      accountId,
                      projectIdentifier,
                      orgIdentifier,
                      deploymentTag: encodeURIWithReservedChars(deploymentTag),
                      serviceIdentifier,
                      ...(activityId && { activityId })
                    })}
                    target="_blank"
                  >
                    {getString('pipeline.clickHere')}
                  </Link>
                </td>
              </tr>
            </>
          )}
      </tbody>
    </table>
  )
}
