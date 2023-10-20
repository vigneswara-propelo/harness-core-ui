/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode } from 'react'
import { debounce } from 'lodash-es'
import SplitPane from 'react-split-pane'

interface LogsContentWrapperProps {
  mode: 'step-details' | 'console-view'
  hasError: boolean
  splitPanel: ReactNode
  children: JSX.Element | null
}

export default function LogsContentWrapper(props: LogsContentWrapperProps): JSX.Element {
  const { mode, children, splitPanel, hasError } = props
  const [splitPaneSize, setSplitPaneSize] = React.useState(132)
  const setSplitPaneSizeDeb = React.useRef(debounce(setSplitPaneSize, 200))
  const handleStageResize = (size: number): void => {
    setSplitPaneSizeDeb.current(size)
  }
  const resizerStyle = navigator.userAgent.match(/firefox/i)
    ? { display: 'flow-root list-item' }
    : { display: 'inline-table' }

  if (mode === 'step-details' || !hasError) {
    return (
      <>
        {splitPanel}
        {children}
      </>
    )
  }
  return (
    <SplitPane
      size={splitPaneSize}
      split="horizontal"
      primary="second"
      minSize={132}
      maxSize={300}
      style={{ zIndex: 2, position: 'relative' }}
      resizerStyle={resizerStyle}
      onChange={handleStageResize}
    >
      {splitPanel}
      {children}
    </SplitPane>
  )
}
