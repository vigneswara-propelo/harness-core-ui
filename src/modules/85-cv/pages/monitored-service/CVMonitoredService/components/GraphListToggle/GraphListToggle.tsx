/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useCallback } from 'react'
import cx from 'classnames'
import { Icon, Container, Layout, Text, Views } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { DefaultView } from './GraphListToggle.constants'
import { getViewLabelAndIcon } from './GraphListToggle.utils'
import css from './GraphListToggle.module.scss'

export default function GraphListToggle({
  initialView,
  selectedView,
  loading,
  onSwitch
}: {
  initialView?: Views
  selectedView?: Views
  loading?: boolean
  onSwitch: (value: Views) => void
}): JSX.Element {
  const { getString } = useStrings()
  const [view, setView] = useState<Views>(initialView || DefaultView)
  const viewValue = view === Views.LIST ? Views.GRID : Views.LIST
  const toggleIconClassName = view !== Views.GRID ? css.graphIcon : css.listIcon
  const viewData = getViewLabelAndIcon({ view: viewValue, getString })

  useEffect(() => {
    if (selectedView && view !== selectedView) {
      setView(selectedView)
    }
  }, [selectedView])

  const onViewToggle = useCallback(() => {
    setView(viewValue)
    onSwitch(viewValue)
  }, [viewValue])

  return (
    <Container
      data-testid="GraphListToggleSwitch"
      className={cx(css.viewContainer, { [css.disabled]: loading })}
      onClick={onViewToggle}
    >
      <Layout.Horizontal spacing="small" margin="small">
        <Icon
          data-testid="GraphListToggleIcon"
          name={viewData.icon}
          className={cx(css.toggleIcon, toggleIconClassName)}
        />
        <Text data-testid="GraphListToggleLabel" className={css.togglelabel} font={{ weight: 'semi-bold' }}>
          {viewData.label}
        </Text>
      </Layout.Horizontal>
    </Container>
  )
}
