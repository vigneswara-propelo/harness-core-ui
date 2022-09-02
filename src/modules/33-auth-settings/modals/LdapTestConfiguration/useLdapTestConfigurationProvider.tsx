/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useRef } from 'react'
import {
  Container,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  Text,
  Button,
  Dialog,
  ButtonVariation,
  useToaster
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { useModalHook } from '@harness/use-modal'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { EmailSchema } from '@common/utils/Validation'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { usePostLdapAuthenticationTest, useUpdateAuthMechanism } from 'services/cd-ng'
import { AuthenticationMechanisms } from '@rbac/utils/utils'
import css from './useLdapTestConfiguration.module.scss'

export interface useLdapTestConfigurationModalReturn {
  openLdapTestModal: () => void
  closeLdapTestModal: () => void
}

interface LDAPConnectionTestConfig {
  email: string
  password: string
}

export interface useLdapTestConfigurationModalProps {
  onSuccess: () => void
}

const useLdapTestConfigurationProvider = ({
  onSuccess
}: useLdapTestConfigurationModalProps): useLdapTestConfigurationModalReturn => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess, showError } = useToaster()
  const formRef = useRef<FormikProps<LDAPConnectionTestConfig>>(null)
  const validationSchema = Yup.object().shape({
    email: EmailSchema(),
    password: Yup.string().min(6).required(getString('password'))
  })

  const { mutate: ldapLoginTest, loading: isTestLoading } = usePostLdapAuthenticationTest({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { mutate: updateAuthMechanism, loading: isAuthUpdateLoading } = useUpdateAuthMechanism({})

  const testLdapConfig = async ({ email, password }: LDAPConnectionTestConfig): Promise<void> => {
    try {
      const formData = new FormData()
      formData.set('email', email)
      formData.set('password', password)
      const { resource } = await ldapLoginTest(formData as any)
      if (resource?.status != 'SUCCESS') {
        showError(resource?.message, 5000)
      } else {
        showSuccess(getString('authSettings.ldap.ldapTestSuccessful'), 5000)
      }
    } catch (e) {
      /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
    }
  }
  const testAndEnableLdap = async (): Promise<void> => {
    try {
      /* istanbul ignore else */
      if (!formRef.current) {
        return
      }
      const formValidation = await formRef.current.validateForm()
      /* istanbul ignore else */
      if (!isEmpty(formValidation) || !formRef.current) {
        return
      }
      const { email, password } = formRef.current.values as LDAPConnectionTestConfig
      const formData = new FormData()
      formData.set('email', email as string)
      formData.set('password', password as string)

      const { resource: ldapTestResource } = await ldapLoginTest(formData as any)
      if (ldapTestResource?.status != 'SUCCESS') {
        showError(ldapTestResource?.message, 5000)
        return
      }
      const { resource: updateAuthResource, responseMessages } = await updateAuthMechanism(undefined, {
        queryParams: {
          accountIdentifier: accountId,
          authenticationMechanism: AuthenticationMechanisms.LDAP
        }
      })

      if (!updateAuthResource) {
        showError(responseMessages?.[0].message, 5000)
      } else {
        hideModal()
        showSuccess(getString('authSettings.ldap.authChangeSuccessful'), 5000)
        onSuccess()
      }
    } catch (e) {
      /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
    }
  }
  const [showModal, hideModal] = useModalHook(() => {
    const isDisabled = isTestLoading || isAuthUpdateLoading
    return (
      <Dialog isOpen={true} enforceFocus={false} className={css.dialog} onClose={hideModal}>
        <Container>
          <Text font={{ variation: FontVariation.H5 }} margin={{ bottom: 'xlarge' }}>
            {getString('authSettings.ldap.verifyAndEnableConfig')}
          </Text>
          <Formik<LDAPConnectionTestConfig>
            innerRef={formRef}
            validationSchema={validationSchema}
            formName="ldapConfigTestForm"
            initialValues={{ email: '', password: '' }}
            onSubmit={formData => {
              testLdapConfig(formData)
            }}
          >
            <FormikForm>
              <Layout.Vertical>
                <FormInput.Text name="email" label={getString('signUp.form.emailLabel')} disabled={isDisabled} />
                <FormInput.Text
                  name="password"
                  label={getString('password')}
                  inputGroup={{ type: 'password' }}
                  disabled={isDisabled}
                />
                <Layout.Horizontal margin={{ top: 'large', bottom: 'large' }}>
                  <Button
                    intent="primary"
                    loading={isTestLoading || isAuthUpdateLoading}
                    disabled={isDisabled}
                    margin={{ right: 'medium' }}
                    data-testid="enable-ldap-config"
                    onClick={() => testAndEnableLdap()}
                  >
                    {getString('enable')}
                  </Button>
                  <Button
                    type="submit"
                    variation={ButtonVariation.SECONDARY}
                    loading={isTestLoading}
                    disabled={isDisabled}
                    data-testid="test-ldap-config"
                  >
                    {getString('test')}
                  </Button>
                </Layout.Horizontal>
              </Layout.Vertical>
            </FormikForm>
          </Formik>
        </Container>
      </Dialog>
    )
  }, [isTestLoading, isAuthUpdateLoading])

  return {
    openLdapTestModal: () => {
      showModal()
    },
    closeLdapTestModal: hideModal
  }
}

export default useLdapTestConfigurationProvider
