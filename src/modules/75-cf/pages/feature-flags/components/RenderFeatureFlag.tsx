/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect, useMemo, useRef, useState, ReactElement } from 'react'
import { Button, ButtonVariation, Container, Heading, Layout, Popover, TagsPopover, Text, Utils } from '@harness/uicore'
import { noop } from 'lodash-es'
import { Classes, Position, Switch, PopoverInteractionKind } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import type { Cell } from 'react-table'
import { useToaster } from '@common/exports'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { Feature, GitSyncErrorResponse } from 'services/cf'
import { useStrings, String } from 'framework/strings'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import type { UseToggleFeatureFlag } from '@cf/hooks/useToggleFeatureFlag'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { featureFlagHasCustomRules, getErrorMessage, isFeatureFlagOn } from '@cf/utils/CFUtils'
import SaveFlagToGitModal from '@cf/components/SaveFlagToGitModal/SaveFlagToGitModal'
import { GIT_COMMIT_MESSAGES } from '@cf/constants/GitSyncConstants'
import { GitDetails, GitSyncFormValues, GIT_SYNC_ERROR_CODE, UseGitSync } from '@cf/hooks/useGitSync'
import type { UseGovernancePayload } from '@cf/hooks/useGovernance'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import useFeatureEnabled from '@cf/hooks/useFeatureEnabled'
import css from './RenderFeatureFlag.module.scss'

export interface RenderFeatureFlagProps {
  numberOfEnvs?: number
  gitSync: UseGitSync
  cell: Cell<Feature>
  toggleFeatureFlag: UseToggleFeatureFlag
  governance: UseGovernancePayload
  refetchFlags: () => void
}

export const RenderFeatureFlag: FC<RenderFeatureFlagProps> = ({
  numberOfEnvs,
  gitSync,
  toggleFeatureFlag,
  governance,
  cell: { row },
  refetchFlags
}) => {
  const { FFM_8184_FEATURE_FLAG_TAGGING } = useFeatureFlags()

  const data = row.original
  const [status, setStatus] = useState(isFeatureFlagOn(data))
  const [flagNameTextSize, setFlagNameTextSize] = useState(300)
  const [isSaveToggleModalOpen, setIsSaveToggleModalOpen] = useState(false)

  const { getString } = useStrings()
  const { showError } = useToaster()
  const ref = useRef<HTMLDivElement>(null)
  const { activeEnvironment } = useActiveEnvironment()
  const { handleError: handleGovernanceError, isGovernanceError } = governance

  const { gitSyncInitialValues, gitSyncValidationSchema } = gitSync.getGitSyncFormMeta(GIT_COMMIT_MESSAGES.TOGGLED_FLAG)

  const flagTags = useMemo(() => data.tags?.map(tag => tag.identifier), [data.tags])

  const { canToggle } = useFeatureEnabled(flagTags)

  const handleFlagToggle = async (gitSyncFormValues?: GitSyncFormValues): Promise<void> => {
    let gitDetails: GitDetails | undefined

    if (gitSync.isAutoCommitEnabled) {
      gitDetails = gitSyncInitialValues.gitDetails
    } else if (gitSyncFormValues) {
      gitDetails = gitSyncFormValues.gitDetails
    }

    try {
      let response
      if (status) {
        response = await toggleFeatureFlag.off(data.identifier, gitDetails)
      } else {
        response = await toggleFeatureFlag.on(data.identifier, gitDetails)
      }

      if (isGovernanceError(response)) {
        handleGovernanceError(response)
      }

      if (gitSyncFormValues?.autoCommit) {
        gitSync.handleAutoCommit(gitSyncFormValues.autoCommit)
      }

      setStatus(!status)
      refetchFlags()
    } catch (error: any) {
      if (error.status === GIT_SYNC_ERROR_CODE) {
        gitSync.handleError(error.data as GitSyncErrorResponse)
      } else {
        if (isGovernanceError(error?.data)) {
          handleGovernanceError(error.data)
        } else {
          showError(getErrorMessage(error), 0, 'cf.toggle.ff.status.error')
        }
      }
    }
  }

  const NoEnvironmentWarningTooltip = (): ReactElement => (
    <Popover interactionKind={PopoverInteractionKind.HOVER} popoverClassName={Classes.DARK}>
      <Layout.Vertical padding="medium" className={css.tooltip}>
        <Text font={{ weight: 'bold' }} color={Color.WHITE} padding={{ bottom: 'large' }}>
          {getString('cf.noEnvironment.title')}
        </Text>
        <Text color={Color.GREY_200}>
          <String stringID={'cf.noEnvironment.message'} useRichText />
        </Text>
      </Layout.Vertical>
    </Popover>
  )

  const switchTooltip = (
    <Container width="350px" padding="xxxlarge" className={css.switchTooltip}>
      <Heading level={2} color={Color.GREY_800} font={{ variation: FontVariation.H3 }}>
        {getString(status ? 'cf.featureFlags.turnOffHeading' : 'cf.featureFlags.turnOnHeading')}
      </Heading>
      <Text className={css.tooltipText} color={Color.GREY_700} margin={{ top: 'medium', bottom: 'small' }}>
        <String
          stringID={status ? 'cf.featureFlags.turnOffMessage' : 'cf.featureFlags.turnOnMessage'}
          vars={{ name: data.name, env: activeEnvironment || '' }}
          useRichText
        />
      </Text>
      <Text className={css.tooltipText} color={Color.GREY_700} margin={{ top: 'xsmall', bottom: 'xlarge' }}>
        {(!featureFlagHasCustomRules(data) && (
          <String
            stringID={'cf.featureFlags.defaultWillBeServed'}
            useRichText
            vars={{ defaultVariation: status ? data.defaultOffVariation : data.defaultOnVariation }}
          />
        )) ||
          getString('cf.featureFlags.customRuleMessage')}
      </Text>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
        <Button
          intent="primary"
          variation={ButtonVariation.PRIMARY}
          text={getString('confirm')}
          className={Classes.POPOVER_DISMISS}
          disabled={toggleFeatureFlag.loading}
          onClick={() => {
            if (gitSync.isGitSyncEnabled && !gitSync.isAutoCommitEnabled) {
              setIsSaveToggleModalOpen(true)
            } else {
              handleFlagToggle()
            }
          }}
        />
        <Button
          text={getString('cancel')}
          className={Classes.POPOVER_DISMISS}
          disabled={toggleFeatureFlag.loading}
          variation={ButtonVariation.TERTIARY}
        />
      </Layout.Horizontal>
      <span />
    </Container>
  )

  const onResize = (): void => {
    if (ref.current) {
      setFlagNameTextSize((ref.current.closest('div[role="cell"]') as HTMLDivElement)?.offsetWidth - 100)
    }
  }

  useEffect(() => {
    onResize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const { isPlanEnforcementEnabled, isFreePlan } = usePlanEnforcement()

  const { enabled } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.MAUS
    }
  })

  const switchDisabled = isPlanEnforcementEnabled && !enabled && isFreePlan

  const getTooltip = (): ReactElement | undefined => {
    if (!canToggle) {
      return (
        <RBACTooltip permission={PermissionIdentifier.TOGGLE_FF_FEATUREFLAG} resourceType={ResourceType.ENVIRONMENT} />
      )
    } else if (switchDisabled) {
      return <FeatureWarningTooltip featureName={FeatureIdentifier.MAUS} />
    } else if (!numberOfEnvs) {
      return <NoEnvironmentWarningTooltip />
    } else if (data.archived) {
      return undefined
    } else {
      return switchTooltip
    }
  }

  return (
    <Container flex>
      <Container onClick={Utils.stopEvent}>
        <Button
          noStyling
          tooltip={getTooltip()}
          tooltipProps={{
            interactionKind:
              switchDisabled || !numberOfEnvs ? PopoverInteractionKind.HOVER : PopoverInteractionKind.CLICK,
            hasBackdrop: !(switchDisabled || !numberOfEnvs),
            position: switchDisabled || !numberOfEnvs ? Position.BOTTOM_LEFT : Position.TOP_LEFT
          }}
          className={css.toggleFlagButton}
          disabled={data.archived || !canToggle || switchDisabled || !numberOfEnvs}
        >
          <Switch
            style={{ alignSelf: 'baseline', marginLeft: '-10px' }}
            alignIndicator="right"
            className={Classes.LARGE}
            checked={status}
            onChange={noop}
            disabled={data.archived || !canToggle || !numberOfEnvs}
          />
        </Button>
      </Container>
      <Layout.Horizontal spacing="small" style={{ flexGrow: 1, paddingLeft: 'var(--spacing-medium)' }}>
        <Layout.Vertical flex className={css.generalInfo} ref={ref}>
          <Text
            style={{
              fontWeight: 500,
              fontSize: '13px',
              lineHeight: '16px'
            }}
            color={Color.GREY_800}
            margin={{ right: 'xsmall' }}
            width={flagNameTextSize}
            lineClamp={2}
          >
            {data.name}
            {data.archived && (
              <Text inline color={Color.GREY_400} padding={{ left: 'xsmall' }} font={{ size: 'small' }}>
                ({getString('cf.shared.archived')})
              </Text>
            )}
            {FFM_8184_FEATURE_FLAG_TAGGING && !!data?.tags?.length && (
              <TagsPopover
                className={css.tagsPopover}
                iconProps={{ size: 12, color: Color.GREY_600 }}
                tags={data.tags.reduce((tagsObj, currentTag) => {
                  return Object.assign(tagsObj, { [currentTag.name]: '' })
                }, {})}
              />
            )}
          </Text>
          {data.identifier && (
            <Text
              padding={{ top: 'xsmall' }}
              lineClamp={1}
              color={Color.GREY_400}
              font={{ variation: FontVariation.TINY }}
            >
              {data.identifier}
            </Text>
          )}
          {data.description && (
            <Text
              style={{
                fontSize: '12px',
                lineHeight: '24px'
              }}
              color={Color.GREY_800}
              width={flagNameTextSize}
              lineClamp={1}
            >
              {data.description}
            </Text>
          )}
        </Layout.Vertical>
      </Layout.Horizontal>

      <Container onClick={event => event.stopPropagation()}>
        {isSaveToggleModalOpen && (
          <SaveFlagToGitModal
            flagName={data.name}
            flagIdentifier={data.identifier}
            gitSyncInitialValues={gitSyncInitialValues}
            gitSyncValidationSchema={gitSyncValidationSchema}
            onSubmit={handleFlagToggle}
            onClose={() => {
              setIsSaveToggleModalOpen(false)
            }}
          />
        )}
      </Container>
    </Container>
  )
}

export default RenderFeatureFlag
