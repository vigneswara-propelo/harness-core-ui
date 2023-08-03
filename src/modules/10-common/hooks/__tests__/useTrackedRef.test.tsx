import React, { MutableRefObject, useCallback } from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTrackedRef } from '../useTrackedRef'

const ComponentUsingHook = ({
  data,
  callback
}: {
  data: string
  callback: (data: MutableRefObject<string>) => void
}): JSX.Element => {
  const dataRef = useTrackedRef(data)

  const onClick = useCallback(() => {
    callback(dataRef)
  }, [dataRef, callback])

  return <button onClick={onClick}>Button</button>
}

describe('useTrackedRef', () => {
  test('should return a reference that tracks the last value rendered', async () => {
    const callback = jest.fn()
    const { rerender, getByText } = render(<ComponentUsingHook data="firstValue" callback={callback} />)

    await userEvent.click(getByText('Button'))
    expect(callback).toBeCalled()

    const ref = callback.mock.calls[0][0]
    expect(ref.current).toBe('firstValue')

    callback.mockReset()

    rerender(<ComponentUsingHook data="secondValue" callback={callback} />)

    await userEvent.click(getByText('Button'))

    expect(callback).toBeCalledWith(ref)
    expect(ref.current).toBe('secondValue')
  })
})
