/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, ReactNode, useMemo, useRef, useState } from 'react'
import {
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  ModalDialog,
  MultiSelectOption,
  SelectOption
} from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import type { Variation } from 'services/cf'
import { renderMultiSelectListItem } from '@cf/components/MultiSelectListItem/MultiSelectListItem'

interface ItemVariationDialogFormValues {
  variation: Variation['identifier']
  items: SelectOption[]
}

interface Item {
  identifier: string
  name: string
  [key: string]: any
}

export interface ItemVariationDialogProps {
  title: ReactNode
  itemPlaceholder: string
  itemLabel: string
  isOpen: boolean
  closeDialog: () => void
  selectedItems: Item[]
  selectedVariation?: Variation
  items: Item[]
  variations: Variation[]
  onChange: (selectedItems: Item[], selectedVariation: Variation) => void
}

const ItemVariationDialog: FC<ItemVariationDialogProps> = ({
  title,
  itemPlaceholder,
  itemLabel,
  isOpen,
  closeDialog,
  selectedItems,
  selectedVariation,
  items,
  variations,
  onChange
}) => {
  const [formValid, setFormValid] = useState(false)
  const { getString } = useStrings()
  const formRef = useRef<FormikProps<ItemVariationDialogFormValues>>()

  const initialItems = useMemo<ItemVariationDialogFormValues['items']>(
    () => selectedItems.map(({ name, identifier }) => ({ label: name, value: identifier })),
    [selectedItems]
  )

  const itemOptions = useMemo<MultiSelectOption[]>(
    () => items.map<MultiSelectOption>(({ name, identifier }) => ({ label: name, value: identifier })),
    [items]
  )

  const variationOptions = useMemo<SelectOption[]>(
    () => variations.map<SelectOption>(({ name, identifier }) => ({ label: name || identifier, value: identifier })),
    [variations]
  )

  const handleSubmit = (values: ItemVariationDialogFormValues): void => {
    onChange(
      items.filter(({ identifier }) => !!values.items.find(({ value }) => value === identifier)),
      variations.find(({ identifier }) => values.variation === identifier) as Variation
    )
    closeDialog()
  }

  const handleSubmitButtonClicked = (): void => {
    formRef.current?.submitForm()
  }

  return (
    <ModalDialog
      enforceFocus={false}
      isOpen={isOpen}
      title={title}
      onClose={closeDialog}
      height={400}
      footer={
        <Layout.Horizontal spacing="small">
          <Button
            variation={ButtonVariation.PRIMARY}
            text={getString('done')}
            onClick={handleSubmitButtonClicked}
            disabled={!formValid}
          />
          <Button variation={ButtonVariation.SECONDARY} text={getString('cancel')} onClick={closeDialog} />
        </Layout.Horizontal>
      }
    >
      <Formik<ItemVariationDialogFormValues>
        formName="ItemVariation"
        initialValues={{ items: initialItems, variation: selectedVariation?.identifier || '' }}
        enableReinitialize
        onSubmit={handleSubmit}
        validationSchema={Yup.object().shape({
          items: Yup.array()
            .of(
              Yup.object().shape({
                value: Yup.string().oneOf(itemOptions.map(({ value }) => value as string)),
                label: Yup.string()
              })
            )
            .required(),
          variation: Yup.string()
            .oneOf(variations.map(({ identifier }) => identifier))
            .required()
        })}
      >
        {formikProps => {
          formRef.current = formikProps

          setFormValid(formikProps.isValid)
          const availableItems = itemOptions.filter(
            ({ value }) => !formikProps.values.items.find(item => item.value === value)
          )

          return (
            <FormikForm>
              <FormInput.MultiSelect
                placeholder={itemPlaceholder}
                usePortal
                name="items"
                items={availableItems}
                multiSelectProps={{
                  allowCreatingNewItems: false,
                  itemRender: renderMultiSelectListItem
                }}
                label={itemLabel}
              />
              <FormInput.Select
                placeholder={getString('cf.pipeline.flagConfiguration.selectVariation')}
                usePortal
                name="variation"
                items={variationOptions}
                label={getString('cf.pipeline.flagConfiguration.variationServed')}
              />
            </FormikForm>
          )
        }}
      </Formik>
    </ModalDialog>
  )
}

export default ItemVariationDialog
