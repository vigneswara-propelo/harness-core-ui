/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { Text, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import { ExpressionEvaluation } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import CopyToClipBoard from '../CopyToClipBoard/CopyToClipBoard'
import css from './TextWithExpressions.module.scss'

export interface MetadataMapObject {
  [key: string]: ExpressionEvaluation
}

interface TextWithExpressionsProps {
  inputString: string
  metadataMap: MetadataMapObject
  fqnPath: string
  customClassName?: string
}

interface ResolvedValueComponentProps {
  metadataMap: MetadataMapObject
  word: string
  fqnPath: string
}

interface ExpressionTooltipContentProps {
  hasError: boolean
  isUnresolvedExpression: boolean
  resolvedValueObject: ExpressionEvaluation
  word: string
}

const VAR_REGEX = /(<\+[a-zA-z0-9_.]+?>)/g

const ExpressionTooltipContent = ({
  hasError,
  isUnresolvedExpression,
  resolvedValueObject,
  word
}: ExpressionTooltipContentProps): JSX.Element => {
  const { getString } = useStrings()
  if (hasError) {
    return (
      <Layout.Vertical padding="medium" flex={{ alignItems: 'flex-start' }} className={css.popoverMaxWidth}>
        <Text
          icon="expression-input"
          color={Color.RED_200}
          iconProps={{ className: css.expressionIcon }}
          margin={{ bottom: 'small' }}
          padding={{ bottom: 'small' }}
          lineClamp={1}
          font={{ mono: true }}
          border={{ bottom: true, color: Color.GREY_500 }}
          width="100%"
        >
          {defaultTo(resolvedValueObject?.originalExpression, word)}
        </Text>
        <Text icon="error-outline" color={Color.WHITE} iconProps={{ className: css.errorIcon }} lineClamp={1}>
          {resolvedValueObject?.error}
        </Text>
      </Layout.Vertical>
    )
  }
  if (isUnresolvedExpression) {
    return (
      <Layout.Vertical padding="medium" flex={{ alignItems: 'flex-start' }} className={css.popoverMaxWidth}>
        <Layout.Horizontal padding={{ bottom: 'small' }} border={{ bottom: true, color: Color.GREY_500 }} width="100%">
          <Text
            icon="expression-input"
            color={Color.WHITE}
            iconProps={{ className: css.expressionIcon }}
            margin={{ right: 'small' }}
            font={{ mono: true }}
            lineClamp={1}
          >
            {defaultTo(resolvedValueObject?.originalExpression, word)}
          </Text>
          <CopyToClipBoard
            content={defaultTo(resolvedValueObject?.originalExpression, word)}
            showFeedback
            hidePopover
          />
        </Layout.Horizontal>
        <Text
          icon="warning-icon"
          color={Color.WHITE}
          iconProps={{ className: css.expressionIcon }}
          flex={{ alignItems: 'flex-start' }}
          padding={{ top: 'small' }}
        >
          {getString('common.expressionDefaultError')}
        </Text>
      </Layout.Vertical>
    )
  }
  return (
    <Layout.Horizontal padding="medium" className={css.popoverMaxWidth}>
      <Text
        color={Color.WHITE}
        icon="expression-input"
        margin={{ right: 'small' }}
        iconProps={{ className: css.expressionIcon }}
        lineClamp={1}
        font={{ mono: true }}
      >
        {defaultTo(resolvedValueObject?.originalExpression, word)}
      </Text>
      <CopyToClipBoard content={defaultTo(resolvedValueObject?.originalExpression, word)} showFeedback hidePopover />
    </Layout.Horizontal>
  )
}

const ResolvedValueComponent = ({ metadataMap, word, fqnPath }: ResolvedValueComponentProps): JSX.Element => {
  const valueObject = metadataMap?.[`${fqnPath}+${word}`]

  const hasError = !!valueObject?.error?.length

  const isUnresolvedExpression = !valueObject?.resolvedValue?.length

  return (
    <Text
      key={`${fqnPath}+${word}`}
      tooltip={
        <ExpressionTooltipContent
          hasError={hasError}
          isUnresolvedExpression={isUnresolvedExpression}
          resolvedValueObject={valueObject}
          word={word}
        />
      }
      tooltipProps={{
        isDark: true,
        interactionKind: PopoverInteractionKind.HOVER,
        position: Position.TOP
      }}
      background={hasError ? Color.RED_100 : isUnresolvedExpression ? Color.YELLOW_100 : Color.GREEN_50}
      color={hasError ? Color.RED_900 : Color.BLACK}
      font={{ weight: 'semi-bold' }}
      inline
      lineClamp={1}
      alwaysShowTooltip
      className={css.expressionValue}
    >
      {defaultTo(valueObject?.resolvedValue, word)}
    </Text>
  )
}

const TextWithExpressions = (props: TextWithExpressionsProps): JSX.Element => {
  const { inputString, metadataMap, fqnPath, customClassName } = props

  const [isHovered, setIsHovered] = React.useState<boolean>(false)

  const replacedString =
    typeof inputString === 'string'
      ? inputString.split(VAR_REGEX).map(word => {
          if (VAR_REGEX.test(word)) {
            // Word matches the regex, render the Popover component
            return <ResolvedValueComponent metadataMap={metadataMap} word={word} fqnPath={fqnPath} />
          } else {
            // Word doesn't match the regex, render it as is
            return `${word} `
          }
        })
      : inputString

  function getReplacementWord(match: string): string {
    const valueObject = metadataMap?.[`${fqnPath}+${match}`]
    return defaultTo(valueObject?.resolvedValue, match)
  }

  function getCopyContent(): string {
    const stringToCopy = inputString

    return typeof stringToCopy === 'string' ? stringToCopy.replace(VAR_REGEX, getReplacementWord) : stringToCopy
  }

  return (
    <div className={css.wrapper} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Text inline className={cx(customClassName, css.expressionWrapper)} style={{ display: 'flex' }}>
        {replacedString}
      </Text>
      <div style={{ width: '24px' }}>{isHovered && <CopyToClipBoard content={getCopyContent()} />}</div>
    </div>
  )
}

export default TextWithExpressions
