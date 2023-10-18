/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Radio, RadioGroup } from '@blueprintjs/core'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import { get } from 'lodash-es'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { ModeEntityNameMap, ParentModeEntityNameMap, PipelineOrStageStatus } from './ConditionalExecutionPanelUtils'
import css from './ConditionalExecutionPanel.module.scss'

interface ConditionalExecutionStatusProps {
  path?: string
  mode: Modes
  isReadonly: boolean
  statusPath: 'pipelineStatus' | 'stageStatus'
}

export default function ConditionalExecutionStatus(props: ConditionalExecutionStatusProps): React.ReactElement {
  const { mode, isReadonly, path = 'when', statusPath } = props
  const { getString } = useStrings()
  const formik = useFormikContext()
  const statusValue = get(formik.values, `${path}.${statusPath}`)
  const strVariables = {
    entity: ModeEntityNameMap[mode],
    parentEntity: ParentModeEntityNameMap[mode]
  }

  return (
    <Layout.Vertical spacing={'medium'}>
      <Text font={{ size: 'normal', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('pipeline.conditionalExecution.executeEntity', strVariables)}
      </Text>
      <RadioGroup
        selectedValue={statusValue}
        disabled={isReadonly}
        onChange={e => {
          formik.setFieldValue(`${path}.${statusPath}`, e.currentTarget.value)
        }}
        className={cx({ [css.executionStatusLabel]: mode === Modes.STAGE })}
      >
        <Radio
          value={PipelineOrStageStatus.SUCCESS}
          label={getString('pipeline.conditionalExecution.statusOption.success', strVariables)}
          className={cx(css.blackText, { [css.active]: statusValue === PipelineOrStageStatus.SUCCESS })}
        />
        <Radio
          value={PipelineOrStageStatus.FAILURE}
          label={
            mode === Modes.STAGE
              ? getString('pipeline.conditionalExecution.statusOption.failure', strVariables)
              : getString('pipeline.conditionalExecution.statusOption.entityFailure', {
                  entity: ModeEntityNameMap[mode]
                })
          }
          className={cx(css.blackText, { [css.active]: statusValue === PipelineOrStageStatus.FAILURE })}
        />
        <Radio
          value={PipelineOrStageStatus.ALL}
          label={getString('pipelineSteps.pullAlwaysLabel')}
          className={cx(css.blackText, { [css.active]: statusValue === PipelineOrStageStatus.ALL })}
        />
      </RadioGroup>
    </Layout.Vertical>
  )
}
