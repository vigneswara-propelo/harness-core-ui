/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Tag, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Prompt, PromptOption } from 'services/custom-dashboards'
import css from './AidaPromptSelection.module.scss'

export interface AidaPromptSelectionProps {
  onPromptSelected: (promptOption: PromptOption) => void
  prompts: Prompt[]
  title: string
}

const AidaPromptSelection: React.FC<AidaPromptSelectionProps> = ({ onPromptSelected, prompts, title }) => {
  return (
    <Container>
      <Text color={Color.GREY_500} font={{ variation: FontVariation.BODY2 }} margin={{ bottom: 'medium' }}>
        {title}
      </Text>
      {prompts.map((prompt, i) => (
        <Container key={`prompt-container-${i}`}>
          {prompt.title && (
            <Text
              data-testid={`prompt-title-${i}`}
              font={{ variation: FontVariation.SMALL }}
              color={Color.GREY_500}
              lineClamp={1}
            >
              {prompt.title}
            </Text>
          )}
          <Container key={`prompt-options-${i}`} className={css.promptOptionsContainer}>
            {prompt.options.map((promptOption, j) => (
              <Container key={`prompt-option-${i}-${j}`}>
                <Tag
                  className={css.promptOption}
                  data-testid={`prompt-option-${i}-${j}`}
                  onClick={() => onPromptSelected(promptOption)}
                >
                  <div className={css.promptContent}>{promptOption.content}</div>
                </Tag>
              </Container>
            ))}
          </Container>
        </Container>
      ))}
    </Container>
  )
}

export default AidaPromptSelection
