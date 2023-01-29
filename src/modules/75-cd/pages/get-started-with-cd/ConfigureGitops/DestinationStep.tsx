/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import classnames from 'classnames'
import { noop } from 'lodash-es'
import {
  Accordion,
  HarnessDocTooltip,
  Text,
  Formik,
  FormikForm,
  Layout,
  Container,
  Icon,
  CardSelect,
  FormInput,
  Button,
  IconName
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { AuthTypeForm, CREDENTIALS_TYPE } from './AuthTypeForm'
import moduleCss from '@cd/pages/get-started-with-cd/DeployProvisioningWizard/DeployProvisioningWizard.module.scss'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'

export const DestinationStep = () => {
  const { getString } = useStrings()
  const clustersTypes = [
    {
      label: getString('cd.getStartedWithCD.harnessHosted'),
      icon: 'harness',
      value: CIBuildInfrastructureType.Cloud
    },
    {
      label: getString('cd.getStartedWithCD.selfManaged'),
      icon: 'service-kubernetes',
      value: CIBuildInfrastructureType.KubernetesDirect
    }
  ]

  return (
    <Accordion collapseProps={{ keepChildrenMounted: false }}>
      <Accordion.Panel
        details={
          <Formik
            initialValues={{ clusterType: clustersTypes[0].value, authType: CREDENTIALS_TYPE.USERNAME_PASSWORD }}
            formName="application-repo-destination-step"
            onSubmit={noop}
          >
            {formikProps => {
              const selectedCluster = formikProps.values.clusterType
              const authType = formikProps.values.authType
              return (
                <FormikForm>
                  <Layout.Vertical>
                    <Container padding={{ bottom: 'xxlarge' }}>
                      <CardSelect
                        data={clustersTypes}
                        cornerSelected={true}
                        className={moduleCss.icons}
                        cardClassName={moduleCss.serviceDeploymentTypeCard}
                        renderItem={item => (
                          <>
                            <Layout.Vertical flex>
                              <Icon
                                name={item.icon as IconName}
                                size={48}
                                flex
                                className={moduleCss.serviceDeploymentTypeIcon}
                              />
                              <Text font={{ variation: FontVariation.BODY2 }} className={moduleCss.text1}>
                                {item.label}
                              </Text>
                            </Layout.Vertical>
                          </>
                        )}
                        selected={clustersTypes.find(c => c.value === selectedCluster)}
                        onChange={item => {
                          formikProps.setFieldValue('clusterType', item.value)
                        }}
                      />
                    </Container>
                    {selectedCluster === CIBuildInfrastructureType.KubernetesDirect ? (
                      <Container>
                        <div className={moduleCss.accordianForm}>
                          <div className={moduleCss.width50}>
                            <NameId nameLabel={getString('cd.getStartedWithCD.nameYourCluster')} />
                            <FormInput.Text
                              name="server"
                              label={getString('connectors.k8.masterUrlLabel')}
                              placeholder={getString('UrlLabel')}
                            />
                          </div>
                          <Text tooltipProps={{ dataTooltipId: 'clusterAuthentication' }} margin={{ bottom: 'small' }}>
                            Select Authentication Type
                          </Text>
                          <div className={moduleCss.marginBottom25}>
                            <Button
                              onClick={() => formikProps.setFieldValue('authType', CREDENTIALS_TYPE.USERNAME_PASSWORD)}
                              className={classnames(
                                css.kubernetes,
                                authType === CREDENTIALS_TYPE.USERNAME_PASSWORD ? css.active : undefined
                              )}
                            >
                              {getString('usernamePassword')}
                            </Button>
                            <Button
                              onClick={() => formikProps.setFieldValue('authType', CREDENTIALS_TYPE.SERVICE_ACCOUNT)}
                              className={classnames(
                                css.docker,
                                authType === CREDENTIALS_TYPE.SERVICE_ACCOUNT ? css.active : undefined
                              )}
                            >
                              {getString('serviceAccount')}
                            </Button>
                            <Button
                              onClick={() =>
                                formikProps.setFieldValue('authType', CREDENTIALS_TYPE.CLIENT_KEY_CERTIFICATE)
                              }
                              className={classnames(
                                css.docker,
                                authType === CREDENTIALS_TYPE.CLIENT_KEY_CERTIFICATE ? css.active : undefined
                              )}
                            >
                              {getString('connectors.k8.clientKey')}
                            </Button>
                          </div>
                          <AuthTypeForm authType={authType} />
                          {/*Add NAMESPACE Field*/}
                        </div>
                      </Container>
                    ) : null}
                  </Layout.Vertical>
                </FormikForm>
              )
            }}
          </Formik>
        }
        id={'application-repo-destination-step'}
        summary={
          <Text
            font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
            margin={{ bottom: 'small' }}
            color={Color.GREY_600}
          >
            {getString('cd.getStartedWithCD.gitopsOnboardingDestination')}
            <HarnessDocTooltip tooltipId="gitopsOnboardingDestination" useStandAlone={true} />
          </Text>
        }
      />
    </Accordion>
  )
}
