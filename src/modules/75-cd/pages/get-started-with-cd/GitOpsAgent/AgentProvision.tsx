import React from 'react'
import { noop } from 'lodash-es'
import { Icon } from '@harness/uicore'
import type { IconName } from '@harness/icons'
import { useAgentServiceForServerGet, V1Agent } from 'services/gitops'
import { useStrings } from 'framework/strings'
import css from './GitOpsAgentCard.module.scss'

const maxRetryCount = 12
const pollingInterval = 10000
export const depSuccessLegacy = 'deployment-success-legacy'

export const AgentProvision = ({ agent }: { agent: V1Agent }) => {
  const { getString } = useStrings()

  const [retryCount, setRetryCount] = React.useState(0)
  const [unhealthyIcon, setUnhealthyIcon] = React.useState<IconName>('steps-spinner') // stepSpinner
  const { data, loading, refetch } = useAgentServiceForServerGet({
    identifier: agent.identifier || '',
    queryParams: {
      accountIdentifier: agent.accountIdentifier || ''
      // projectIdentifier: projectIdentifier,
      // orgIdentifier: orgIdentifier
    }
  })

  React.useEffect(() => {
    let id: number | null

    if (retryCount >= maxRetryCount) {
      setUnhealthyIcon('danger-icon')
      return () => noop
    }

    if (!loading) {
      setRetryCount(retryCount + 1)
      id = window.setTimeout(() => refetch(), pollingInterval)
    }
    return () => {
      if (id) {
        window.clearTimeout(id)
      }
    }
  }, [loading, data])

  return (
    <div>
      <div className={css.verificationStep}>
        <Icon name={data?.health?.harnessGitopsAgent?.status === 'HEALTHY' ? depSuccessLegacy : unhealthyIcon} />
        <span className={css.stepDesc}>{getString('cd.getStartedWithCD.checkAgentStatus')}</span>
      </div>
      <hr className={css.divider} />
      <div className={css.verificationStep}>
        <Icon name={data?.health?.lastHeartbeat ? depSuccessLegacy : unhealthyIcon} />
        <span className={css.stepDesc}> {getString('delegate.successVerification.heartbeatReceived')}</span>
      </div>
      <div className={css.verificationStep}>
        <Icon name={data?.health?.harnessGitopsAgent?.status === 'HEALTHY' ? depSuccessLegacy : unhealthyIcon} />
        <span className={css.stepDesc}> {getString('cd.getStartedWithCD.agentInstalled')}</span>
      </div>
      <div className={css.verificationStep}>
        <Icon name={data?.health?.argoRepoServer?.status === 'HEALTHY' ? depSuccessLegacy : unhealthyIcon} />
        <span className={css.stepDesc}> {getString('cd.getStartedWithCD.repoServerInstalled')}</span>
      </div>
      <div className={css.verificationStep}>
        <Icon name={data?.health?.argoRedisServer?.status === 'HEALTHY' ? depSuccessLegacy : unhealthyIcon} />
        <span className={css.stepDesc}> {getString('cd.getStartedWithCD.redisCacheInstalled')}</span>
      </div>
      <div className={css.verificationStep}>
        <Icon name={data?.health?.argoAppController?.status === 'HEALTHY' ? depSuccessLegacy : unhealthyIcon} />
        <span className={css.stepDesc}> {getString('cd.getStartedWithCD.redisCacheInstalled')}</span>
      </div>
    </div>
  )
}
