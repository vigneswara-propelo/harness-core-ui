/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { IPopoverProps, Position } from '@blueprintjs/core'
import {
  Button,
  ButtonVariation,
  FormInput,
  Formik,
  FormikForm,
  Layout,
  MultiTypeInputType,
  Popover,
  SelectOption,
  Text
} from '@harness/uicore'
import { Color, FontVariation, Intent } from '@harness/design-system'
import * as Yup from 'yup'
import React from 'react'
import { useStrings } from 'framework/strings'
import {
  ApiCreateNetworkMapRequest,
  DatabaseConnection,
  DatabaseConnectionType,
  DatabaseNetworkMapEntity
} from 'services/servicediscovery'
import MultiTypeMapInputSet from '@modules/70-pipeline/components/InputSetView/MultiTypeMapInputSet/MultiTypeMapInputSet'

export interface RelationPopoverProps {
  children: React.ReactElement
  networkMap: ApiCreateNetworkMapRequest
  updateNetworkMap: (networkMap: ApiCreateNetworkMapRequest) => Promise<void>
  isOpen: boolean
  open: () => void
  close: () => void
  popoverProps?: IPopoverProps
  initialValues?: ServiceRelationFormType
}

export interface ServiceRelationFormType {
  source: string
  target: string
  properties: Record<string, string>
}

export default function RelationPopover({
  children,
  networkMap,
  updateNetworkMap,
  isOpen,
  open,
  close,
  popoverProps,
  initialValues = { source: '', target: '', properties: { type: 'TCP', port: '' } }
}: RelationPopoverProps): React.ReactElement {
  const { getString } = useStrings()

  const servicesSelectOptions = React.useMemo(
    () => networkMap.resources?.map(s => ({ label: s.name, value: s.id } as SelectOption)) ?? [],
    [networkMap]
  )

  return (
    <Popover
      isOpen={isOpen}
      onInteraction={nextOpenState => {
        if (nextOpenState) open()
        else close()
      }}
      position={Position.RIGHT_TOP}
      modifiers={{ preventOverflow: { escapeWithReference: true } }}
      canEscapeKeyClose={false}
      minimal
      {...popoverProps}
    >
      {children}
      <Formik<ServiceRelationFormType>
        formName="newServiceRelationForm"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          source: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: getString('discovery.sourceService')
            })
          ),
          target: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: getString('discovery.targetService')
            })
          ),
          properties: Yup.object()
            .shape({
              type: Yup.string()
                .equals(['TCP', 'UDP'])
                .required(
                  getString('common.validation.fieldIsRequired', {
                    name: getString('typeLabel')
                  })
                ),
              port: Yup.number().required(
                getString('common.validation.fieldIsRequired', {
                  name: getString('common.smtp.port')
                })
              )
            })
            .required(
              getString('common.validation.fieldIsRequired', {
                name: getString('discovery.relationProperties')
              })
            )
        })}
        onSubmit={async values => {
          let source: DatabaseNetworkMapEntity | undefined
          let destination: DatabaseNetworkMapEntity | undefined
          networkMap.resources.map(service => {
            if (service.id === values.source) source = service
            if (service.id === values.target) destination = service
          })

          const modifiedConnections = networkMap.connections?.filter(
            conn => values.source !== conn.from?.id || values.target !== conn.to?.id
          )
          const { type, port, ...params } = values.properties

          const newConnection: DatabaseConnection = {
            from: source,
            to: destination,
            type: type as DatabaseConnectionType,
            manual: true, // because this is only used for custom connections
            port,
            params
          }

          modifiedConnections?.push(newConnection)

          const newNetworkMap: ApiCreateNetworkMapRequest = {
            ...networkMap,
            connections: modifiedConnections
          }
          await updateNetworkMap(newNetworkMap)
          close()
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <Layout.Vertical spacing="medium" padding="medium">
                <Text font={{ variation: FontVariation.CARD_TITLE }}>
                  {getString('discovery.serviceRelationshipDetails')}
                </Text>
                <Layout.Horizontal spacing="medium">
                  <FormInput.Select
                    name="source"
                    items={servicesSelectOptions}
                    label={getString('discovery.sourceService')}
                  />
                  <FormInput.Select
                    name="target"
                    items={servicesSelectOptions}
                    label={getString('discovery.targetService')}
                  />
                </Layout.Horizontal>
                <div>
                  <MultiTypeMapInputSet
                    appearance={'minimal'}
                    cardStyle={{ width: '50%' }}
                    name="properties"
                    valueMultiTextInputProps={{
                      allowableTypes: [MultiTypeInputType.FIXED]
                    }}
                    multiTypeFieldSelectorProps={{
                      label: (
                        <Text font={{ variation: FontVariation.SMALL_BOLD }}>
                          {getString('discovery.relationProperties')}
                        </Text>
                      ),
                      disableTypeSelection: true,
                      allowedTypes: [MultiTypeInputType.FIXED],
                      hideError: false
                    }}
                    formik={formik}
                  />
                  {Object.entries(formik.errors.properties ?? {}).map(([key, error]) => (
                    <Text
                      key={key}
                      intent={Intent.DANGER}
                      icon="circle-cross"
                      iconProps={{ size: 12, color: Color.RED_600 }}
                    >
                      {error}
                    </Text>
                  ))}
                </div>
                <Layout.Horizontal spacing="medium">
                  <Button type="submit" variation={ButtonVariation.PRIMARY} text={getString('saveChanges')} />
                  <Button
                    variation={ButtonVariation.TERTIARY}
                    text={getString('cancel')}
                    onClick={async () => {
                      await updateNetworkMap({ ...networkMap })
                      close()
                    }}
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Popover>
  )
}
