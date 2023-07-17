/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { PopoverInteractionKind, Classes } from '@blueprintjs/core'
import { Icon, Popover, useToaster, Text, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStopSRMAnalysisStep } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import css from './StopAnalysisButton.module.scss'

interface StopAnalysisButtonInterface {
  eventId: string
  refetch: () => Promise<void>
}
export const StopAnalysisButton = ({ eventId, refetch }: StopAnalysisButtonInterface): JSX.Element => {
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps>()
  const { showSuccess, showError } = useToaster()
  const { mutate } = useStopSRMAnalysisStep({
    executionDetailId: eventId,
    queryParams: { accountId }
  })

  const stopExecution = async (): Promise<void> => {
    try {
      const data = await mutate()
      showSuccess(getErrorMessage(data))
    } catch (error) {
      showError(getErrorMessage(error))
    }
    refetch()
  }

  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      popoverClassName={Classes.DARK}
      position={'bottom'}
      content={
        <Text padding={'medium'} color={Color.WHITE}>
          {getString('cv.analyzeDeploymentImpact.stopAnalysis')}
        </Text>
      }
    >
      <Layout.Horizontal spacing={'small'} flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Icon data-testid="stopBtn" className={css.stopButton} name="circle-stop" onClick={() => stopExecution()} />
      </Layout.Horizontal>
    </Popover>
  )
}
