import React from 'react'

import ListRows from './ListRows/ListRows'
import ListHeaders from './ListHeaders/ListHeaders'
import NewButtonWithSearchFilter from './NewButtonWithSearchFilter/NewButtonWithSearchFilter'
import NoServiceOverrides from './NoServiceOverrides'

import { useServiceOverridesContext } from '../context/ServiceOverrideContext'

export default function BaseServiceOverrides(): React.ReactElement {
  const { listRowItems } = useServiceOverridesContext()

  const showOverridesList = Array.isArray(listRowItems) && listRowItems.length > 0

  return (
    <React.Fragment>
      <NewButtonWithSearchFilter />
      {showOverridesList ? (
        <React.Fragment>
          <ListHeaders />
          <ListRows />
        </React.Fragment>
      ) : (
        <NoServiceOverrides />
      )}
    </React.Fragment>
  )
}
