import { renderHook } from '@testing-library/react-hooks'
import { useNetworkEvents } from '../useNetworkEvents'

describe('useNetworkEvents', () => {
  let addEventListenerSpy: ReturnType<typeof jest.spyOn>
  let removeEventListenerSpy: ReturnType<typeof jest.spyOn>

  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(window, 'addEventListener')
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  test('should add event listeners for online and offline events', () => {
    renderHook(() => useNetworkEvents())

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })

  test('should remove event listeners when unmounted', () => {
    const { unmount } = renderHook(() => useNetworkEvents())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })

  test('should log a message when online event is triggered', () => {
    const consoleLogSpy = jest.spyOn(console, 'log')

    renderHook(() => useNetworkEvents())

    window.dispatchEvent(new Event('online'))

    expect(consoleLogSpy).toHaveBeenCalledWith('The network connection has been regained.')

    consoleLogSpy.mockRestore()
  })

  test('should log a message when offline event is triggered', () => {
    const consoleLogSpy = jest.spyOn(console, 'log')

    renderHook(() => useNetworkEvents())

    window.dispatchEvent(new Event('offline'))

    expect(consoleLogSpy).toHaveBeenCalledWith('The network connection has been lost.')

    consoleLogSpy.mockRestore()
  })
})
