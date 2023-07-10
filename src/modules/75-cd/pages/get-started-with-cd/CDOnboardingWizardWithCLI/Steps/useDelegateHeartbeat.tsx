import React from 'react'
import { useParams } from 'react-router-dom'
import { useGetDelegatesHeartbeatDetailsV2 } from 'services/portal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { DELEGATE_COMMAND_LINE_TIME_OUT, POLL_INTERVAL } from '@delegates/constants'
interface useDelegateHeartBeatProps {
  checkheartBeat?: boolean
  delegateName?: string
}

export function useDelegateHeartBeat({ checkheartBeat, delegateName = '' }: useDelegateHeartBeatProps): {
  error: boolean
  loading: boolean
  success: boolean
} {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [isHeartBeatVerified, setVerifyHeartBeat] = React.useState(false)
  const [hasError, setError] = React.useState(false)
  const [counter, setCounter] = React.useState(0)
  const {
    data,
    loading,
    refetch: verifyHeartBeat,
    error
  } = useGetDelegatesHeartbeatDetailsV2({
    queryParams: {
      accountId,
      projectId: projectIdentifier,
      orgId: orgIdentifier,
      delegateName
    },
    debounce: 200,
    lazy: true
  })
  React.useEffect(() => {
    if (!loading && (!data || (data && data?.resource?.numberOfConnectedDelegates === 0)) && !error && checkheartBeat) {
      const timerId = window.setTimeout(() => {
        setCounter(counter + POLL_INTERVAL)
        verifyHeartBeat()
      }, POLL_INTERVAL)

      if (counter >= DELEGATE_COMMAND_LINE_TIME_OUT) {
        window.clearTimeout(timerId)
        setVerifyHeartBeat(true)
        setError(true)
      }

      return () => {
        window.clearTimeout(timerId)
      }
    } else if (data && data?.resource && data?.resource?.numberOfConnectedDelegates !== 0) {
      setVerifyHeartBeat(true)
    }
  }, [data, verifyHeartBeat, loading, checkheartBeat])

  return { error: hasError, loading, success: isHeartBeatVerified }
}
