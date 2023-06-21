import React, { useState } from 'react'
import { IMenuProps, Menu, Position } from '@blueprintjs/core'
import { Button, Popover, PopoverProps } from '@harness/uicore'
import css from './StageContextMenu.module.scss'

export interface StageContextMenuProps extends IMenuProps {
  popoverProps?: PopoverProps
}

export default function StageContextMenu({ popoverProps = {}, ...rest }: StageContextMenuProps): React.ReactElement {
  const [contextOpen, setContextOpen] = useState(false)

  return (
    <Popover
      isOpen={contextOpen}
      onInteraction={nextOpenState => {
        setContextOpen(nextOpenState)
      }}
      position={Position.RIGHT_TOP}
      isDark={true}
      {...popoverProps}
    >
      <Button
        icon="Options"
        className={css.moreOptions}
        onClick={e => {
          e.stopPropagation()
          setContextOpen(true)
        }}
      />
      <Menu {...rest} />
    </Popover>
  )
}
