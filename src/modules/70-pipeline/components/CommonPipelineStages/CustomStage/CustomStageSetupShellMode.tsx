/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import cx from 'classnames'
import { Button, Icon, Layout, Tab, Tabs } from '@harness/uicore'
import { capitalize as _capitalize, get, isEmpty, set, toUpper } from 'lodash-es'
import { Expander } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import type { ValidationError } from 'yup'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type { StageElementConfig } from 'services/cd-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { SaveTemplateButton } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
// eslint-disable-next-line no-restricted-imports
import DeployEnvSpecifications from '@cd/components/PipelineStudio/DeployEnvSpecifications/DeployEnvSpecifications'
import { isContextTypeNotStageTemplate } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { useQueryParams } from '@common/hooks'
import { getNameAndIdentifierSchema } from '@pipeline/utils/tempates'
import ApprovalAdvancedSpecifications from '../ApprovalStage/ApprovalStageAdvanced'
import { ApprovalStageOverview } from '../ApprovalStage/ApprovalStageOverview'
import { ApprovalStageExecution } from '../ApprovalStage/ApprovalStageExecution'
import approvalStepCss from '../ApprovalStage/ApprovalStageSetupShellMode.module.scss'

enum CustomTabs {
  OVERVIEW = 'OVERVIEW',
  ENVIRONMENT = 'ENVIRONMENT',
  EXECUTION = 'EXECUTION',
  ADVANCED = 'ADVANCED'
}

function getCustomStageValidationSchema(
  getString: UseStringsReturn['getString'],
  contextType?: string
): Yup.Schema<unknown> {
  return Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, contextType),
    spec: Yup.object().shape({
      execution: Yup.object().shape({
        steps: Yup.array().required().min(1, getString('common.executionTab.stepsCount'))
      })
    })
  })
}

export function CustomStageSetupShellMode(): React.ReactElement {
  const { getString } = useStrings()
  const { CDS_CUSTOM_STAGE_WITH_ENV_INFRA: isEnvInfraEnabledForCustomStage } = useFeatureFlags()
  const tabHeadingsMap = {
    [CustomTabs.OVERVIEW]: getString('overview'),
    [CustomTabs.ENVIRONMENT]: getString('environment'),
    [CustomTabs.EXECUTION]: getString('executionText'),
    [CustomTabs.ADVANCED]: getString('advancedTitle')
  }
  const layoutRef = useRef<HTMLDivElement>(null)
  const [selectedTabId, setSelectedTabId] = React.useState<string>(tabHeadingsMap[CustomTabs.EXECUTION])
  const pipelineContext = usePipelineContext()
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId = '', selectedStepId, selectedSectionId },
      gitDetails,
      storeMetadata
    },
    contextType,
    getStageFromPipeline,
    updatePipeline,
    setSelectedSectionId
  } = pipelineContext
  const query = useQueryParams()

  const { stage: selectedStage } = getStageFromPipeline<StageElementConfig>(selectedStageId)
  const [incompleteTabs, setIncompleteTabs] = React.useState<{ [key in CustomTabs]?: boolean }>({})

  React.useEffect(() => {
    const sectionId = (query as any).sectionId || ''
    if (sectionId?.length && Object.values(tabHeadingsMap).includes(_capitalize(sectionId))) {
      setSelectedTabId(_capitalize(sectionId))
    } else {
      setSelectedSectionId(toUpper(tabHeadingsMap[CustomTabs.EXECUTION]), true)
    }
  }, [selectedSectionId])

  React.useEffect(() => {
    if (selectedStepId) {
      setSelectedTabId(tabHeadingsMap[CustomTabs.EXECUTION])
    }
  }, [selectedStepId])

  function ActionButton(): React.ReactElement {
    return (
      <Layout.Horizontal spacing="medium" padding="medium" className={approvalStepCss.footer}>
        <Button
          text={getString('next')}
          intent="primary"
          rightIcon="chevron-right"
          onClick={() => {
            updatePipeline(pipeline)
            setSelectedTabId(
              isEnvInfraEnabledForCustomStage
                ? tabHeadingsMap[CustomTabs.ENVIRONMENT]
                : tabHeadingsMap[CustomTabs.EXECUTION]
            )
          }}
        />
      </Layout.Horizontal>
    )
  }

  React.useLayoutEffect(() => {
    // To drag and drop the canvas
    if (layoutRef.current) {
      /* istanbul ignore next */
      layoutRef.current.scrollTo?.(0, 0)
    }
  }, [selectedTabId])

  const validate = React.useCallback(() => {
    try {
      getCustomStageValidationSchema(getString, contextType).validateSync(selectedStage?.stage, {
        abortEarly: false,
        context: selectedStage?.stage
      })
      setIncompleteTabs({})
    } catch (error) {
      if (error.name !== 'ValidationError') {
        return
      }
      const response = error.inner.reduce((errors: ValidationError, currentError: ValidationError) => {
        errors = set(errors, currentError.path, currentError.message)
        return errors
      }, {})
      const newIncompleteTabs: { [key in CustomTabs]?: boolean } = {}
      if (!isEmpty(response.name) || !isEmpty(response.identifier)) {
        newIncompleteTabs[CustomTabs.OVERVIEW] = true
      }

      if (!isEmpty(get(response.spec, 'execution'))) {
        newIncompleteTabs[CustomTabs.EXECUTION] = true
      }

      setIncompleteTabs(newIncompleteTabs)
    }
  }, [setIncompleteTabs, selectedStage?.stage])

  React.useEffect(() => {
    validate()
  }, [JSON.stringify(selectedStage)])

  return (
    <section ref={layoutRef} key={selectedStageId} className={approvalStepCss.approvalStageSetupShellWrapper}>
      <Tabs
        id="approvalStageSetupShell"
        onChange={(tabId: string) => {
          setSelectedTabId(tabId)
          setSelectedSectionId(toUpper(tabId))
        }}
        selectedTabId={selectedTabId}
        data-tabId={selectedTabId}
      >
        <Tab
          id={tabHeadingsMap[CustomTabs.OVERVIEW]}
          panel={
            <ApprovalStageOverview>
              <ActionButton />
            </ApprovalStageOverview>
          }
          title={
            <span className={approvalStepCss.tab}>
              <Icon name="tick" height={20} size={20} color={Color.GREEN_800} />
              {tabHeadingsMap[CustomTabs.OVERVIEW]}
            </span>
          }
          data-testid={tabHeadingsMap[CustomTabs.OVERVIEW]}
        />
        {isEnvInfraEnabledForCustomStage && (
          <Icon
            name="chevron-right"
            height={20}
            size={20}
            margin={{ right: 'small', left: 'small' }}
            color={'grey400'}
            style={{ alignSelf: 'center' }}
          />
        )}
        {isEnvInfraEnabledForCustomStage && (
          <Tab
            id={tabHeadingsMap[CustomTabs.ENVIRONMENT]}
            title={
              <span data-completed={!incompleteTabs[CustomTabs.ENVIRONMENT]}>
                <Icon name={'infrastructure'} size={16} />
                {tabHeadingsMap[CustomTabs.ENVIRONMENT]}
              </span>
            }
            panel={<DeployEnvSpecifications />}
            data-testid={tabHeadingsMap[CustomTabs.ENVIRONMENT]}
            className={cx(approvalStepCss.fullHeight, approvalStepCss.stepGroup)}
          />
        )}
        <Icon
          name="chevron-right"
          height={20}
          size={20}
          margin={{ right: 'small', left: 'small' }}
          color={'grey400'}
          style={{ alignSelf: 'center' }}
        />
        <Tab
          id={tabHeadingsMap[CustomTabs.EXECUTION]}
          title={
            <span data-completed={!incompleteTabs[CustomTabs.EXECUTION]}>
              <Icon name={incompleteTabs[CustomTabs.EXECUTION] ? 'execution' : 'tick'} size={16} />
              {tabHeadingsMap[CustomTabs.EXECUTION]}
            </span>
          }
          panel={<ApprovalStageExecution />}
          data-testid={tabHeadingsMap[CustomTabs.EXECUTION]}
          className={cx(approvalStepCss.fullHeight, approvalStepCss.stepGroup)}
        />
        <Icon
          name="chevron-right"
          height={20}
          size={20}
          margin={{ right: 'small', left: 'small' }}
          color={'grey400'}
          style={{ alignSelf: 'center' }}
        />
        <Tab
          id={tabHeadingsMap[CustomTabs.ADVANCED]}
          title={
            <span className={approvalStepCss.tab}>
              <Icon name="advanced" height={20} size={20} />
              {tabHeadingsMap[CustomTabs.ADVANCED]}
            </span>
          }
          panel={
            <ApprovalAdvancedSpecifications
              conditionalExecutionTooltipId="conditionalExecutionCustomStage"
              failureStrategyTooltipId="failureStrategyCustomStage"
            />
          }
          data-testid={tabHeadingsMap[CustomTabs.ADVANCED]}
        />
        {/* istanbul ignore next */}
        {isContextTypeNotStageTemplate(contextType) && /* istanbul ignore next */ selectedStage?.stage && (
          <>
            <Expander />
            <SaveTemplateButton
              data={selectedStage.stage}
              type={'Stage'}
              gitDetails={gitDetails}
              storeMetadata={storeMetadata}
            />
          </>
        )}
      </Tabs>
    </section>
  )
}
