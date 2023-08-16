/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import cx from 'classnames'
import { Checkbox, Container, Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { isInputSetInvalid } from '@pipeline/utils/inputSetUtils'
import { Badge } from '@pipeline/pages/utils/Badge/Badge'
import { useStrings } from 'framework/strings'
import { OutOfSyncErrorStrip } from '@pipeline/components/InputSetErrorHandling/OutOfSyncErrorStrip/OutOfSyncErrorStrip'
import type { EntityGitDetails, InputSetErrorWrapper, InputSetSummaryResponse } from 'services/pipeline-ng'
import { StoreMetadata } from '@common/constants/GitSyncTypes'
import { getIconByType } from './utils'
import { InputSetGitDetails } from './InputSetGitDetails'
import css from './InputSetSelector.module.scss'

interface MultipleInputSetListProps {
  inputSet: InputSetSummaryResponse
  onCheckBoxHandler: (
    checked: boolean,
    label: string,
    val: string,
    type: InputSetSummaryResponse['inputSetType'],
    inputSetGitDetails: EntityGitDetails | null,
    inputSetErrorDetails?: InputSetErrorWrapper,
    overlaySetErrorDetails?: { [key: string]: string },
    storeType?: StoreMetadata['storeType']
  ) => void
  checked: boolean
  isInputSetLoading: boolean
  showInputSetError: boolean
  refetch: () => Promise<void>
  showReconcile: boolean
  pipelineGitDetails?: EntityGitDetails
  hideInputSetButton?: boolean
  onReconcile?: (identifier: string) => void
  reRunInputSetYaml?: string
  inputSetBranch?: string
}

export function MultipleInputSetList(props: MultipleInputSetListProps): JSX.Element {
  const {
    inputSet,
    onCheckBoxHandler,
    checked,
    pipelineGitDetails,
    refetch,
    hideInputSetButton,
    showReconcile,
    onReconcile,
    reRunInputSetYaml,
    isInputSetLoading,
    showInputSetError,
    inputSetBranch
  } = props
  const { getString } = useStrings()

  const getInputSetIconTextColor = (color: Color): Color => (showInputSetError ? Color.GREY_400 : color)
  const handleInputSetClick = (ticked: boolean): void => {
    if (showInputSetError || isInputSetInvalid(inputSet) || showReconcile) {
      return
    }
    onCheckBoxHandler(
      ticked,
      defaultTo(inputSet.name, ''),
      defaultTo(inputSet.identifier, ''),
      defaultTo(inputSet.inputSetType, 'INPUT_SET'),
      defaultTo(inputSet.gitDetails, null),
      inputSet.inputSetErrorDetails,
      inputSet.overlaySetErrorDetails,
      defaultTo(inputSet.storeType, 'INLINE')
    )
  }

  return (
    <li className={cx(css.item)} data-testid={`popover-list-${inputSet.name}`}>
      <Layout.Horizontal flex={{ distribution: 'space-between' }}>
        <Layout.Horizontal flex={{ alignItems: 'center' }}>
          <Checkbox
            className={css.checkbox}
            disabled={showInputSetError || isInputSetInvalid(inputSet) || showReconcile}
            labelElement={
              <Layout.Horizontal flex={{ alignItems: 'center' }} padding={{ left: true }} style={{ maxWidth: '85%' }}>
                <Icon
                  name={getIconByType(inputSet.inputSetType)}
                  color={getInputSetIconTextColor(Color.GREY_500)}
                ></Icon>
                <Container margin={{ left: true }} className={css.nameIdContainer}>
                  <Text
                    data-testid={`checkbox-${inputSet.name}`}
                    lineClamp={1}
                    font={{ weight: 'bold' }}
                    color={getInputSetIconTextColor(Color.GREY_800)}
                  >
                    {inputSet.name}
                  </Text>
                  <Text
                    font="small"
                    lineClamp={1}
                    margin={{ top: 'xsmall' }}
                    color={getInputSetIconTextColor(Color.GREY_450)}
                  >
                    {getString('idLabel', { id: inputSet.identifier })}
                  </Text>
                </Container>
              </Layout.Horizontal>
            }
            checked={checked}
            onChange={ev => handleInputSetClick(ev.currentTarget.checked)}
          />
          {(isInputSetInvalid(inputSet) || showReconcile) && !reRunInputSetYaml && (
            <Container padding={{ left: 'large' }} className={css.invalidEntity}>
              <Badge
                text={'common.invalid'}
                iconName="error-outline"
                showTooltip={false}
                entityName={inputSet.name}
                entityType={inputSet.inputSetType === 'INPUT_SET' ? 'Input Set' : 'Overlay Input Set'}
                uuidToErrorResponseMap={inputSet.inputSetErrorDetails?.uuidToErrorResponseMap}
                overlaySetErrorDetails={inputSet.overlaySetErrorDetails}
              />
              <OutOfSyncErrorStrip
                inputSet={inputSet}
                pipelineGitDetails={pipelineGitDetails}
                onlyReconcileButton={true}
                refetch={refetch}
                hideInputSetButton={hideInputSetButton}
                isOverlayInputSet={inputSet.inputSetType === 'OVERLAY_INPUT_SET'}
                onReconcile={onReconcile}
              />
            </Container>
          )}
        </Layout.Horizontal>
        {isInputSetLoading && (
          <Container padding={'medium'} width={'12%'}>
            <Icon name="steps-spinner" size={20} color={Color.GREY_300} />
          </Container>
        )}
        {showInputSetError && (
          <div className={css.inputSetErrorWrapper}>
            <Container
              background={Color.RED_100}
              padding={{ top: 'small', bottom: 'small', left: 'medium', right: 'medium' }}
              className={css.inputSetErrorContainer}
            >
              <Text font={{ weight: 'bold' }} color={Color.RED_700} className={css.inputSetErrorText} lineClamp={2}>
                {getString('pipeline.inputSets.inputSetNotFoundInBranch', { branch: inputSetBranch })}
              </Text>
            </Container>
          </div>
        )}
        {inputSet.gitDetails?.repoIdentifier ? (
          <div onClick={() => handleInputSetClick(!checked)} className={css.inputSetGitDetailsWrapper}>
            <InputSetGitDetails gitDetails={inputSet.gitDetails} />
          </div>
        ) : null}
      </Layout.Horizontal>
    </li>
  )
}
