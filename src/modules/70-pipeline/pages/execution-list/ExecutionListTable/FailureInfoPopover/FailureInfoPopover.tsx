/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, IconName } from '@harness/icons'
import { capitalize } from 'lodash-es'
import { Divider, Popover, PopoverInteractionKind, Position, Classes } from '@blueprintjs/core'
import { Layout, Text, Container } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Link } from 'react-router-dom'
import { ExecutionErrorInfo, PipelineExecutionSummary } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { GitQueryParams, PipelinePathProps, PipelineType } from '@modules/10-common/interfaces/RouteInterfaces'
import { getExecutionPipelineViewLink } from '../executionListUtils'
import css from './FailureInfoPopover.module.scss'

interface FailureInfoPopoverProps {
  failureInfo: FailedStagesInfoProps[]
  rowData: PipelineExecutionSummary
  pathParams: PipelineType<PipelinePathProps>
  queryParams: GitQueryParams
}

export interface FailedStagesInfoProps {
  nodeIdentifier: string
  name: string
  failureInfo: ExecutionErrorInfo
  nodeIcon?: IconName
  nodeGroup: string
}

function FailedStagesInfoContent(
  props: FailedStagesInfoProps[],
  rowData: PipelineExecutionSummary,
  pathParams: PipelineType<PipelinePathProps>,
  queryParams: GitQueryParams
): JSX.Element {
  const { getString } = useStrings()
  return (
    <>
      <Layout.Vertical spacing="medium" className={css.failedPopoverContent}>
        <Container className={css.errorCount} flex={{ justifyContent: 'space-between' }}>
          <Text
            icon={'warning-sign'}
            iconProps={{ size: 20, padding: { right: 'small' }, color: Color.RED_900 }}
            font={{ variation: FontVariation.SMALL_BOLD }}
            color={Color.RED_900}
          >
            {getString('pre-flight-check.errorFoundCounter', { errorCount: props.length })}
          </Text>
          <Icon name="code-close" className={Classes.POPOVER_DISMISS} color={Color.GREY_700} />
        </Container>
        <div className={css.contentContainer}>
          {props.map(item => {
            return (
              <Layout.Vertical key={item.nodeIdentifier} padding={{ bottom: 'small' }} spacing="small">
                <Text
                  font={{ variation: FontVariation.TINY }}
                  lineClamp={1}
                  color={Color.GREY_700}
                  rightIcon={item.nodeIcon}
                  rightIconProps={{ size: 14 }}
                  className={css.stageTypeAndName}
                >
                  <strong>{`${capitalize(item.nodeGroup)}:`}</strong>
                  {` ${item.name}`}
                </Text>
                <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_700}>
                  {item.failureInfo?.message}
                </Text>
                <Divider style={{ marginLeft: 0, marginRight: 0 }} />
              </Layout.Vertical>
            )
          })}
        </div>
      </Layout.Vertical>
      <Container padding={{ left: 'medium', right: 'medium', bottom: 'small', top: 'xsmall' }}>
        <Link to={getExecutionPipelineViewLink(rowData, pathParams, queryParams)} target="_blank">
          <Text font={{ variation: FontVariation.SMALL }} color={Color.PRIMARY_7} padding={{ bottom: 'xsmall' }}>
            {getString('pipeline.seeDetailsInExecutionView')}
          </Text>
        </Link>
      </Container>
    </>
  )
}

export function FailureInfoPopover(props: FailureInfoPopoverProps): JSX.Element {
  const { failureInfo, pathParams, queryParams, rowData } = props
  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      content={FailedStagesInfoContent(failureInfo, rowData, pathParams, queryParams)}
      position={Position.TOP}
      popoverClassName={css.failedDetailPopover}
      className={css.failureInfoSummaryText}
    >
      <Layout.Horizontal padding={{ top: 'small' }} spacing="xsmall" className={css.summaryText}>
        <Text
          color={Color.RED_900}
          font={{ variation: FontVariation.TINY_SEMI }}
          lineClamp={1}
          tooltipProps={{ disabled: true }}
        >
          <strong>{`${capitalize(failureInfo[0].nodeGroup)}:`}</strong>
          {` ${failureInfo[0].name}`}
        </Text>
        {failureInfo.length - 1 > 0 && (
          <Text color={Color.RED_900} font={{ variation: FontVariation.TINY_SEMI }}>{`+ ${
            failureInfo.length - 1
          }`}</Text>
        )}
      </Layout.Horizontal>
    </Popover>
  )
}
