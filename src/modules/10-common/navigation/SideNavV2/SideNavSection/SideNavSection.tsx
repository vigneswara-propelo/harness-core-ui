import React from 'react'
import cx from 'classnames'
import { Layout } from '@harness/uicore'
import css from '../SideNavV2.module.scss'

export interface SideNavSectionComponentProps {
  className?: string
}

const SideNavSectionComponent: React.FC<React.PropsWithChildren<SideNavSectionComponentProps>> = props => {
  return (
    <Layout.Vertical className={cx(css.section, props.className)}>
      {props.children}
      <div data-name="nav-border" />
    </Layout.Vertical>
  )
}

export default SideNavSectionComponent
