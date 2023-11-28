/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Layout,
  Text,
  Formik,
  Button,
  ButtonVariation,
  StepProps,
  FormInput,
  useToaster,
  SelectOption,
  PageSpinner
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import React from 'react'
import { Form } from 'formik'
import { useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { useCreateZendeskTicket } from 'services/resourcegroups'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { DEFAULT_MODULES_ORDER, moduleInfoMap } from '@common/hooks/useNavModuleInfo'
import { String, useStrings } from 'framework/strings'
import { Category, SupportTicketActions } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useCreateCannyPost, useGetCannyBoards } from 'services/cd-ng'
import { getBrowserName, getOsVersion, IssueType, issueTypes, priorityItems, PriorityType, SubmitTicket } from './Utils'
import css from './SubmitTicketModalSteps.module.scss'

interface SubmitTicketModalStepTwoProps {
  name: string
  stepName: string
  onCloseHandler: () => void
}

export const SubmitTicketModalStepTwo = (props: StepProps<any> & SubmitTicketModalStepTwoProps): JSX.Element => {
  const { stepName, onCloseHandler, prevStepData, previousStep } = props
  const { module } = useModuleInfo()
  const { currentUserInfo } = useAppStore()
  const { email, name } = currentUserInfo
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()

  const {
    data: cannyModulesList,
    loading: loadingCannyBoards,
    refetch: refetchCannyBoards,
    error: errorCannyBoards
  } = useGetCannyBoards({
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  const backBtnHandler = (): void => {
    previousStep?.()
  }

  const { mutate: createZendeskTicket, loading: loadingCreateZendeskTicket } = useCreateZendeskTicket({})
  const { mutate: createCannyPost, loading: loadingCreateCannyTicket } = useCreateCannyPost({
    queryParams: { accountIdentifier: accountId }
  })

  const createFormData = (data: SubmitTicket): FormData => {
    const formData = new FormData()
    if (data.issueType === IssueType.FEATURE_REQUEST) {
      formData.set('email', email as string)
      formData.set('name', name as string)
      formData.set('title', data.subject)
      formData.set('details', data.ticketDetails)
      formData.set('boardId', data.boardID)
    } else {
      formData.set('message', data.ticketDetails)
      formData.set('url', window.location.href)
      formData.set('userBrowser', getBrowserName(navigator.userAgent))
      formData.set('userOS', getOsVersion())
      formData.set('userAgent', navigator.userAgent)
      formData.set('userName', email as string)
      formData.set('accountId', accountId)
      formData.set('module', data.module)
      formData.set(
        'browserResolution',
        JSON.stringify({
          height: window.innerHeight,
          width: window.innerWidth
        })
      )
      const file = (data as any)?.['fileData']
      file && formData.set('file', file)
    }
    return formData
  }

  const handleSubmit = async (val: SubmitTicket): Promise<void> => {
    try {
      const formData = createFormData(val)
      const response =
        val.issueType === IssueType.FEATURE_REQUEST
          ? await createCannyPost(formData as any)
          : await createZendeskTicket(formData as any, {
              queryParams: {
                emailId: email as string,
                ticketType: val.issueType,
                priority: val.priority,
                subject: val.subject
              }
            })
      if (prevStepData.prevStep === 'AIDA') {
        trackEvent(SupportTicketActions.SubmitZendeskSupportTicketAfterAIDA, {
          category: Category.SUPPORT_TICKET_DEFLECTION,
          ticketDetails: formData
        })
      } else {
        trackEvent(SupportTicketActions.SubmitZendeskSupportTicket, {
          category: Category.SUPPORT_TICKET_DEFLECTION,
          ticketDetails: formData
        })
      }
      if (val.issueType === IssueType.FEATURE_REQUEST) {
        if (response) {
          showSuccess(
            <Text className={css.link}>
              <a href={get(response, 'data.postURL')} target="_blank" rel="noreferrer">
                Ticket
              </a>{' '}
              has been created successfully
            </Text>
          )
          onCloseHandler()
        } else {
          showError(getString('somethingWentWrong'))
        }
      } else {
        if (response) {
          if (get(response, 'data.code') === 201) {
            try {
              const zendeskResponse = JSON.parse(response.data?.message as string)
              const ticketURL = `${new URL(zendeskResponse.ticket.url).origin}/agent/tickets/${
                zendeskResponse.ticket.id
              }`
              showSuccess(
                <Text className={css.link}>
                  Ticket{' '}
                  <a href={ticketURL} target="_blank" rel="noreferrer">
                    {zendeskResponse.ticket.id}
                  </a>{' '}
                  has been created successfully
                </Text>
              )
            } catch (_) {
              showSuccess(getString('common.resourceCenter.ticketmenu.ticketSuccess'))
            }

            onCloseHandler()
          } else {
            showError(getString('somethingWentWrong'))
          }
        }
      }
    } catch (_) {
      showError(getString('somethingWentWrong'))
    }
  }

  const moduleOptions: { label: string; value: string }[] = DEFAULT_MODULES_ORDER.map(moduleName => {
    return {
      label: getString(moduleInfoMap[moduleName].label),
      value: moduleName
    }
  })
  moduleOptions.push({
    label: getString('common.resourceCenter.ticketmenu.platform'),
    value: 'platform'
  })

  const cannyModules = React.useMemo(() => {
    return defaultTo(
      cannyModulesList?.data?.boards?.map(board => ({ label: board.name, value: board.id })),
      []
    )
  }, [cannyModulesList?.data?.boards, moduleOptions])

  React.useEffect(() => {
    if (prevStepData.prevStep === 'AIDA') {
      trackEvent(SupportTicketActions.SubmitTicketModalStepTwoAfterAIDA, {
        category: Category.SUPPORT_TICKET_DEFLECTION,
        ticketSubject: prevStepData.subject
      })
    } else {
      trackEvent(SupportTicketActions.SubmitTicketModalStepTwo, {
        category: Category.SUPPORT_TICKET_DEFLECTION,
        ticketSubject: prevStepData.subject
      })
    }
  }, [])

  React.useEffect(() => {
    if (errorCannyBoards) {
      showError(errorCannyBoards.message)
    }
  }, [errorCannyBoards, showError])

  return (
    <Layout.Vertical spacing="small" style={{ minHeight: '752px' }}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      {(loadingCreateZendeskTicket || loadingCreateCannyTicket) && <PageSpinner />}
      <Formik<SubmitTicket>
        initialValues={{
          subject: prevStepData.subject,
          module: module ? module : 'platform',
          issueType: IssueType.PROBLEM,
          priority: PriorityType.HIGH,
          ticketDetails: '',
          fileData: '',
          boardID: ''
        }}
        formName="ticketDetailsForm"
        validationSchema={Yup.object().shape({
          issueType: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: getString('common.resourceCenter.ticketmenu.issueType')
            })
          ),
          priority: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: getString('common.resourceCenter.ticketmenu.priority')
            })
          ),
          ticketDetails: Yup.mixed().when('issueType', {
            is: val => val !== IssueType.FEATURE_REQUEST,
            then: Yup.string().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('common.resourceCenter.ticketmenu.ticketDescription')
              })
            )
          }),
          boardID: Yup.mixed().when('issueType', {
            is: IssueType.FEATURE_REQUEST,
            then: Yup.string().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('common.moduleLabel')
              })
            )
          })
        })}
        onSubmit={values => {
          handleSubmit(values)
        }}
      >
        {formik => {
          return (
            <Form>
              <Layout.Vertical flex={{ alignItems: 'flex-start' }}>
                <FormInput.Text
                  name="subject"
                  label={getString('common.resourceCenter.ticketmenu.ticketSubject')}
                  className={css.inputWidth}
                  disabled
                />
                <FormInput.Select
                  name="issueType"
                  className={css.fieldWidth}
                  items={issueTypes}
                  placeholder={getString('common.resourceCenter.ticketmenu.issueType')}
                  label={getString('common.resourceCenter.ticketmenu.issueType')}
                  onChange={val => {
                    if (val.value === IssueType.FEATURE_REQUEST && cannyModules.length === 0) {
                      refetchCannyBoards()
                    }
                  }}
                />
                {get(formik.values, 'issueType', IssueType.PROBLEM) !== IssueType.FEATURE_REQUEST && (
                  <FormInput.Select
                    name="priority"
                    className={css.fieldWidth}
                    items={priorityItems}
                    placeholder={getString('common.resourceCenter.ticketmenu.priority')}
                    label={getString('common.resourceCenter.ticketmenu.priority')}
                  />
                )}
                {get(formik.values, 'issueType') === IssueType.FEATURE_REQUEST ? (
                  <FormInput.Select
                    name="boardID"
                    key={'boardID'}
                    label={getString('common.moduleLabel')}
                    className={css.fieldWidth}
                    placeholder={loadingCannyBoards ? getString('loading') : getString('common.moduleLabel')}
                    items={cannyModules as SelectOption[]}
                  />
                ) : (
                  <FormInput.Select
                    name="module"
                    key={'module'}
                    label={getString('common.moduleLabel')}
                    className={css.fieldWidth}
                    placeholder={getString('common.moduleLabel')}
                    items={moduleOptions}
                  />
                )}
                <FormInput.TextArea
                  name="ticketDetails"
                  label={getString('common.resourceCenter.ticketmenu.ticketDescription')}
                  className={css.inputWidth}
                  placeholder={getString('common.resourceCenter.ticketmenu.ticketDescriptionPlaceholder')}
                />
                {get(formik.values, 'issueType') !== IssueType.FEATURE_REQUEST && (
                  <FormInput.FileInput
                    name="fileData"
                    label={getString('common.resourceCenter.ticketmenu.attachments')}
                    buttonText={getString('upload')}
                    placeholder={getString('common.resourceCenter.ticketmenu.chooseAFile')}
                    className={css.fieldWidth}
                  />
                )}
                {get(formik.values, 'issueType') === IssueType.FEATURE_REQUEST && (
                  <Layout.Vertical className={css.cannyText}>
                    <String stringID="common.resourceCenter.ticketmenu.cannyText" useRichText />
                    <String stringID="common.resourceCenter.ticketmenu.cannyPosts" />
                  </Layout.Vertical>
                )}
                <Layout.Horizontal>
                  <Button
                    variation={ButtonVariation.SECONDARY}
                    text={getString('back')}
                    icon="chevron-left"
                    className={css.backBtn}
                    onClick={backBtnHandler}
                  />
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('submit')}
                    rightIcon="chevron-right"
                    className={css.saveBtn}
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
