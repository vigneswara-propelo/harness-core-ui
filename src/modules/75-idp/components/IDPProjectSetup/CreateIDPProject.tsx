/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Formik,
  Layout,
  FormikForm,
  Heading,
  FormInput,
  SelectOption,
  Button,
  ButtonVariation,
  useToaster
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { defaultTo, get, pick } from 'lodash-es'
import type { Project } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { DescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useGetOrganizationList, usePostProject } from 'services/cd-ng'
import { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import Collaborators from '@projects-orgs/modals/ProjectModal/views/Collaborators'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import routes from '@common/RouteDefinitions'

function CreateIDPProject(): React.ReactElement {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess } = useToaster()
  const { updateAppStore } = useAppStore()
  const history = useHistory()
  const module = 'idp-admin'

  const { data: orgData } = useGetOrganizationList({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: createProject } = usePostProject({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: ''
    }
  })

  let defaultOrg = ''

  /* istanbul ignore next */
  const organizations: SelectOption[] =
    orgData?.data?.content?.map(org => {
      if (org.harnessManaged) defaultOrg = org.organization.identifier
      return {
        label: org.organization.name,
        value: org.organization.identifier
      }
    }) || []

  async function handleSubmit(values: Project): Promise<void> {
    const dataToSubmit: Project = pick<Project, keyof Project>(values, [
      'name',
      'orgIdentifier',
      'color',
      'description',
      'identifier',
      'tags'
    ])

    dataToSubmit.modules = values.modules || []
    const response = await createProject(
      { project: dataToSubmit },
      {
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier: values.orgIdentifier
        }
      }
    )
    showSuccess(getString('projectsOrgs.projectCreateSuccess'))
    updateAppStore({ selectedProject: response?.data?.project })
    history.push(
      routes.toPipelines({
        accountId: accountId,
        orgIdentifier: defaultTo(get(response, 'data.project.orgIdentifier'), ''),
        module,
        projectIdentifier: defaultTo(get(response, 'data.project.identifier'), '')
      })
    )
  }

  return (
    <>
      <Formik
        initialValues={{ identifier: '', name: '', orgIdentifier: defaultOrg }}
        formName="idp-projectsForm"
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <FormikForm>
            <Layout.Vertical width={500} margin={{ bottom: 'medium' }}>
              <Heading level={3} font={{ variation: FontVariation.H3 }}>
                {getString('projectsOrgs.aboutProject')}
              </Heading>
              <FormInput.InputWithIdentifier isIdentifierEditable={true} />
              <Layout.Horizontal spacing="small" margin={{ bottom: 'xsmall' }}>
                <FormInput.ColorPicker label={getString('color')} name="color" height={38} />
                <FormInput.Select label={getString('orgLabel')} name="orgIdentifier" items={organizations} />
              </Layout.Horizontal>
              <DescriptionTags formikProps={formikProps} />
            </Layout.Vertical>
            <Layout.Vertical>
              <Collaborators
                projectIdentifier={formikProps.values.identifier}
                orgIdentifier={formikProps.values.orgIdentifier}
                showManage={false}
              />
            </Layout.Vertical>

            <Button type="submit" variation={ButtonVariation.PRIMARY} text={getString('saveAndContinue')} />
          </FormikForm>
        )}
      </Formik>
    </>
  )
}

export default CreateIDPProject
