/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Card, Container, Icon, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Draggable } from 'react-beautiful-dnd'
import type { EnvAndEnvGroupCard } from 'services/cd-ng'
import { RenderEnv, RenderEnvType, RenderNewAddedLabel } from './CustomSequenceListContent'
import css from './CustomSequence.module.scss'

interface CustomSequenceListProps {
  index: number
  entityDetails: EnvAndEnvGroupCard
  listItemKey: string
}

export const CustomSequenceList: (props: CustomSequenceListProps) => React.ReactElement = ({
  index,
  entityDetails,
  listItemKey
}) => {
  return (
    <Draggable key={listItemKey} draggableId={listItemKey} index={index}>
      {(provided, snapshot) => {
        return (
          <Container {...snapshot} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
            <Card className={css.mainContainer}>
              <Layout.Horizontal
                background={Color.GREY_0}
                className={cx(css.customListContainer, {
                  [css.leftBorderForNewlyAdded]: entityDetails.new
                })}
                flex={{ alignItems: 'center' }}
              >
                <Container {...provided.dragHandleProps}>
                  <Icon
                    name="drag-handle-vertical"
                    margin={{
                      top: 'xsmall'
                    }}
                    size={24}
                    color={Color.GREY_300}
                  />
                </Container>
                <RenderEnv envGroup={entityDetails.envGroup} name={entityDetails.name} />
                <RenderEnvType environmentTypes={entityDetails.environmentTypes} />
                <RenderNewAddedLabel new={entityDetails.new} />
              </Layout.Horizontal>
            </Card>
          </Container>
        )
      }}
    </Draggable>
  )
}
