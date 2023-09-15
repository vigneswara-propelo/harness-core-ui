import React from 'react'
import { SideNavContext, SideNavContextProps } from './SideNavV2Context'

export const useSideNavV2 = (): SideNavContextProps => {
  const { updateAvailableLinks, availableLinks, activeLink } = React.useContext(SideNavContext)

  return {
    updateAvailableLinks,
    availableLinks,
    activeLink
  }
}
