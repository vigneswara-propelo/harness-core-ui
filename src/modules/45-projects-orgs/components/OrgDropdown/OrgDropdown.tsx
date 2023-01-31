/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DropDown, SelectOption } from '@harness/uicore'
import React, { useState } from 'react'
import { getOrganizations } from '@harnessio/react-ng-manager-client'
import { useStrings } from 'framework/strings'

interface OrgDropdownProps {
  onChange: (item: SelectOption) => void
  value?: SelectOption
  className?: string
}

const OrgDropdown: React.FC<OrgDropdownProps> = props => {
  const [query, setQuery] = useState<string>()
  const { getString } = useStrings()

  function orgListPromise(): Promise<SelectOption[]> {
    return new Promise<SelectOption[]>(resolve => {
      getOrganizations({ queryParams: { search_term: query, limit: 100 } })
        .then(result => {
          const selectItems = result.reduce<SelectOption[]>((selected, item) => {
            if (item.org?.name && item.org?.identifier) {
              return [...selected, { label: item.org.name, value: item.org.identifier }]
            }
            return selected
          }, [])
          resolve(selectItems || [])
        })
        .catch(() => {
          resolve([])
        })
    })
  }

  return (
    <DropDown
      className={props.className}
      buttonTestId="org-select"
      onChange={props.onChange}
      value={props.value}
      items={orgListPromise}
      usePortal={true}
      addClearBtn={true}
      query={query}
      onQueryChange={setQuery}
      placeholder={getString('orgsText')}
    />
  )
}

export default OrgDropdown
