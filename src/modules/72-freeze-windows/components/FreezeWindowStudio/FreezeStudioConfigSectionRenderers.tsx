/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { SelectOption } from '@wings-software/uicore'
import { FormInput } from '@harness/uicore'
import { EntityType, FIELD_KEYS, FreezeWindowLevels, ResourcesInterface } from '@freeze-windows/types'
import type { UseStringsReturn } from 'framework/strings'
import { allProjectsObj, isAllOptionSelected } from './FreezeWindowStudioUtil'

const All = 'All'
const Equals = 'Equals'
const NotEquals = 'NotEquals'
export enum EnvironmentType {
  PROD = 'PROD',
  NON_PROD = 'NON_PROD'
}

// All Environments
// Production
// Pre-Production

interface EnvTypeRendererProps {
  getString: UseStringsReturn['getString']
  name: string
}
export const EnvironmentTypeRenderer = ({ getString, name }: EnvTypeRendererProps) => {
  const [envTypes] = React.useState<SelectOption[]>([
    { label: getString('common.allEnvironments'), value: All },
    { label: getString('production'), value: EnvironmentType.PROD },
    { label: getString('common.preProduction'), value: EnvironmentType.NON_PROD }
  ])

  return <FormInput.Select name={name} items={envTypes} label={getString('envType')} style={{ width: '400px' }} />
}

interface ServiceFieldRendererPropsInterface {
  getString: UseStringsReturn['getString']
  isDisabled: boolean
  name: string
  services: SelectOption[]
}
export const ServiceFieldRenderer: React.FC<ServiceFieldRendererPropsInterface> = ({
  getString,
  isDisabled,
  name,
  services
}) => {
  const [disabledItems] = React.useState<SelectOption[]>([{ label: getString('common.allServices'), value: All }])
  if (isDisabled) {
    return (
      <FormInput.Select
        name={name}
        items={disabledItems}
        disabled={isDisabled}
        placeholder={disabledItems[0].label}
        label={getString('services')}
        style={{ width: '400px' }}
      />
    )
  }
  return (
    <FormInput.MultiSelect
      style={{ width: '400px' }}
      name={name}
      items={services}
      label={getString('services')}
      // onChange={(selected?: SelectOption[]) => {}}
    />
  )
}

const getOrgNameKeys = (namePrefix: string) => {
  const orgFieldName = `${namePrefix}.${FIELD_KEYS.Org}`
  const orgCheckBoxName = `${namePrefix}.${FIELD_KEYS.ExcludeOrgCheckbox}`
  const excludeOrgName = `${namePrefix}.${FIELD_KEYS.ExcludeOrg}`
  return { orgFieldName, orgCheckBoxName, excludeOrgName }
}

const getProjNameKeys = (namePrefix: string) => {
  const projFieldName = `${namePrefix}.${FIELD_KEYS.Proj}`
  const projCheckBoxName = `${namePrefix}.${FIELD_KEYS.ExcludeProjCheckbox}`
  const excludeProjName = `${namePrefix}.${FIELD_KEYS.ExcludeProj}`
  return { projFieldName, projCheckBoxName, excludeProjName }
}

interface OrganizationfieldPropsInterface {
  getString: UseStringsReturn['getString']
  namePrefix: string
  organizations: SelectOption[]
  values: any
  setFieldValue: any
}

export const Organizationfield: React.FC<OrganizationfieldPropsInterface> = ({
  getString,
  namePrefix,
  organizations,
  values,
  setFieldValue
}) => {
  const orgValue = values[FIELD_KEYS.Org]
  const excludeOrgCheckboxValue = values[FIELD_KEYS.ExcludeOrgCheckbox]
  const isCheckBoxEnabled = isAllOptionSelected(orgValue) && orgValue?.length === 1
  const { orgFieldName, orgCheckBoxName, excludeOrgName } = getOrgNameKeys(namePrefix)
  const { projFieldName, projCheckBoxName, excludeProjName } = getProjNameKeys(namePrefix)

  const [allOrgs, setAllOrgs] = React.useState<SelectOption[]>([])
  React.useEffect(() => {
    if (organizations.length) {
      setAllOrgs([{ label: 'All Organizations', value: All }, ...organizations])
    }
  }, [organizations])
  return (
    <>
      <FormInput.MultiSelect
        name={orgFieldName}
        items={allOrgs}
        label={getString('orgLabel')}
        onChange={(selected?: SelectOption[]) => {
          const isAllSelected = isAllOptionSelected(selected)
          const isMultiSelected = (selected || []).length > 1
          if (!isAllSelected) {
            setFieldValue(orgCheckBoxName, false)
            // todo: clear exclude Orgs
          }
          if (isAllSelected || isMultiSelected) {
            setFieldValue(projFieldName, All)
            setFieldValue(projCheckBoxName, false)
            setFieldValue(excludeProjName, undefined)
          }
        }}
      />

      <FormInput.CheckBox
        name={orgCheckBoxName}
        label={getString('freezeWindows.freezeStudio.excludeOrgs')}
        disabled={!isCheckBoxEnabled}
        onChange={() => {
          setFieldValue(excludeOrgName, undefined)
        }}
      />

      {isCheckBoxEnabled && excludeOrgCheckboxValue ? (
        <FormInput.MultiSelect name={excludeOrgName} items={organizations} style={{ marginLeft: '24px' }} />
      ) : null}
    </>
  )
}

interface ProjectFieldPropsInterface {
  getString: UseStringsReturn['getString']
  namePrefix: string
  resources: ResourcesInterface
  values: any
  setFieldValue: any
}
export const ProjectField: React.FC<ProjectFieldPropsInterface> = ({
  getString,
  namePrefix,
  resources,
  values,
  setFieldValue
}) => {
  const { projects, freezeWindowLevel } = resources
  const isOrgValueAll =
    freezeWindowLevel === FreezeWindowLevels.ORG ? isAllOptionSelected(values[FIELD_KEYS.Org]) : false
  const projValue = values[FIELD_KEYS.Proj]
  const excludeProjValue = values[FIELD_KEYS.ExcludeProjCheckbox]
  const isCheckBoxEnabled = isAllOptionSelected(projValue) && projValue?.length === 1
  const { projFieldName, projCheckBoxName, excludeProjName } = getProjNameKeys(namePrefix)
  const [allProj, setAllProj] = React.useState<SelectOption[]>([])

  React.useEffect(() => {
    if (isOrgValueAll) {
      setAllProj([allProjectsObj(getString)])
    } else if (projects.length) {
      setAllProj([allProjectsObj(getString), ...projects])
    }
  }, [projects, isOrgValueAll])
  return (
    <>
      <FormInput.MultiSelect
        name={projFieldName}
        items={allProj}
        label={getString('projectsText')}
        disabled={isOrgValueAll}
        // placeholder="All Projects"
        onChange={(selected?: SelectOption[]) => {
          const isAllSelected = isAllOptionSelected(selected)
          const isMultiSelected = (selected || []).length > 1
          if (!isAllSelected || isMultiSelected) {
            setFieldValue(projCheckBoxName, false)
            setFieldValue(excludeProjName, undefined)
          }
        }}
      />

      <FormInput.CheckBox
        name={projCheckBoxName}
        label={getString('freezeWindows.freezeStudio.excludeProjects')}
        disabled={!isCheckBoxEnabled || isOrgValueAll}
        onChange={() => {
          setFieldValue(excludeProjName, undefined)
        }}
      />

      {isCheckBoxEnabled && excludeProjValue ? (
        <FormInput.MultiSelect
          disabled={isOrgValueAll}
          name={excludeProjName}
          items={projects}
          style={{ marginLeft: '24px' }}
        />
      ) : null}
    </>
  )
}

const renderKeyValue = (key: string, value?: string) => {
  return (
    <div>
      <span>{key}</span>: <span>{value}</span>
    </div>
  )
}

interface OrgFieldViewModePropsInterface {
  data?: EntityType
  getString: UseStringsReturn['getString']
}
export const OrgFieldViewMode: React.FC<OrgFieldViewModePropsInterface> = ({ data, getString }) => {
  if (!data) return null
  const { filterType, entityRefs } = data
  let value = 'All Organizations'
  if (filterType === All) {
    value = 'All Organizations'
  } else if (filterType === Equals) {
    value = (entityRefs as string[])?.join(', ')
  } else if (filterType === NotEquals) {
    value = `All Organizations except ${entityRefs?.join(', ')}`
  }
  return renderKeyValue(getString('orgLabel'), value)
}

interface ProjectFieldViewModePropsInterface {
  data?: EntityType
  getString: UseStringsReturn['getString']
}
export const ProjectFieldViewMode: React.FC<ProjectFieldViewModePropsInterface> = ({ data, getString }) => {
  if (!data) return null
  const { filterType, entityRefs } = data
  let value = 'All Projects'
  if (filterType === All) {
    value = 'All Projects'
  } else if (filterType === Equals) {
    value = (entityRefs as string[])?.join(', ')
  } else if (filterType === NotEquals) {
    value = `All Projects except ${entityRefs?.join(', ')}`
  }
  return renderKeyValue(getString('projectsText'), value)
}

/***
 *
 *

 <Button icon="edit" minimal withoutCurrentColor className={css.editButton} />
 <Button icon="trash" minimal withoutCurrentColor />

 entityConfigs:
   - name: "rule1"
     entities:
       - filterType: "All"
         type: "Service"
       - filterType: "Equals"
         type: "Project"
       entityRefs:
         - "pip1"
         - "pip2"
       - filterType: "Equals"
         type: "Org"
         entityRefs:
           - "pip1"
           - "pip2"
       - filterType: "Equals"
         type: "EnvType"
         entityRefs:
           - PROD
       - filterType: "Equals"
         type: "Environment"
         entityRefs:
         - "pip1"
         - "pip2"
         - name: "rule2"
     entities:
       - filterType: "All"
         type: "Service"
       -filterType: "All"
         type: "EnvType"
 *
 */
