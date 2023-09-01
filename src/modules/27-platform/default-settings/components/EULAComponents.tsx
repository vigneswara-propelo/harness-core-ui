/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { Intent, FontVariation } from '@harness/design-system'
import { Container, FormError, Icon, Layout, Text, Toggle, useConfirmationDialog } from '@harness/uicore'

import { signEula, validateEulaSign } from '@harnessio/react-ng-manager-client'
import { useParams } from 'react-router-dom'
import { getHTMLFromMarkdown } from '@common/utils/MarkdownUtils'
import { SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'
import { useStrings } from 'framework/strings'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference.types'
import { Scope } from '@common/interfaces/SecretsInterface'
import { AidaAgreementType } from '../utils/utils'
import css from '@default-settings/components/SettingsCategorySection.module.scss'

export const AIDASettingsRenderer = (props: SettingRendererProps): React.ReactElement => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const scope = getScopeFromDTO({
    accountIdentifier: accountId,
    projectIdentifier: projectIdentifier,
    orgIdentifier: orgIdentifier
  })
  const { getString } = useStrings()
  const [isEulaValidating, setIsEulaValidating] = React.useState<boolean>(false)
  const { onSettingSelectionChange, settingValue, errorMessage, identifier } = props
  const dialogProps = {
    className: css.aidaDialog,
    children: (
      <div>
        <Text margin={{ bottom: 'medium' }} font={{ variation: FontVariation.BODY2 }}>
          {getString('platform.defaultSettings.aida.ifTermsAccepted')}
        </Text>
        <div
          className={css.aidaTerms}
          dangerouslySetInnerHTML={{
            __html: getHTMLFromMarkdown(getString('platform.defaultSettings.aida.aidaEULAText'))
          }}
        />
      </div>
    ),
    titleText: getString('platform.defaultSettings.aida.terms'),
    contentText: undefined, // need to pass undefined as "contentText" is a required field
    cancelButtonText: getString('platform.defaultSettings.aida.reject'),
    confirmButtonText: getString('platform.defaultSettings.aida.accept'),
    intent: Intent.PRIMARY
  }
  const { openDialog } = useConfirmationDialog({
    ...dialogProps,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        await signEula({
          body: {
            agreement_type: AidaAgreementType
          }
        })
        onSettingSelectionChange('true')
      }
    }
  })

  return (
    <>
      <Layout.Vertical flex={{ alignItems: 'flex-start' }} className={css.settingCheckBoxContainer}>
        {isEulaValidating ? (
          <Container>
            <Icon name="spinner" color="primary7" />
          </Container>
        ) : (
          <Toggle
            label=""
            data-testid="aidaToggleStatus"
            checked={settingValue?.value === 'true'}
            onToggle={async checked => {
              if (checked) {
                setIsEulaValidating(true)
                const {
                  content: { signed: isSigned }
                } = await validateEulaSign({
                  queryParams: {
                    agreement_type: AidaAgreementType
                  }
                })
                if (!isSigned && scope === Scope.ACCOUNT) {
                  openDialog()
                } else {
                  onSettingSelectionChange('true')
                }
                setIsEulaValidating(false)
              } else {
                onSettingSelectionChange('false')
              }
            }}
          />
        )}
        {errorMessage ? <FormError name={identifier} errorMessage={errorMessage} /> : undefined}
      </Layout.Vertical>
    </>
  )
}
