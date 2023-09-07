import { useEffect } from 'react'

export const useNetworkEvents = (): void => {
  useEffect(() => {
    const onOnline = (): void => console.log('The network connection has been regained.') // eslint-disable-line no-console
    const onOffline = (): void => console.log('The network connection has been lost.') // eslint-disable-line no-console

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])
}
