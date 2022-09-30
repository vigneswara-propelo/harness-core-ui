/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, ReactNode, useContext, ReactElement, useState, useCallback } from 'react'

interface FreezeWindowListContext {
  toggleRowSelect: (id: string, select: boolean) => void
  selectedItems: string[]
}

const FreezeWindowListContext = createContext({} as FreezeWindowListContext)

export function FreezeWindowListProvider({ children }: { children: ReactNode }): ReactElement {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const toggleRowSelect = useCallback(
    (id: string, select: boolean) => {
      if (select) {
        setSelectedItems([...selectedItems, id])
      } else {
        const filteredItems = selectedItems.filter(selected => selected !== id)
        setSelectedItems(filteredItems)
      }
    },
    [selectedItems]
  )

  return (
    <FreezeWindowListContext.Provider value={{ toggleRowSelect, selectedItems }}>
      {children}
    </FreezeWindowListContext.Provider>
  )
}

export const useFreezeWindowListContext = () => useContext(FreezeWindowListContext)
