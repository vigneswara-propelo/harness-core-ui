import { useMemo } from 'react'
import { useFormikContext } from 'formik'
import { get } from 'lodash-es'
import { UIInputDependency } from '../types'
import { InputsFormValues } from '../InputsForm'

type InputDependencies = Record<string, unknown>

type UseInputDependencies = (dependencies: UIInputDependency[]) => InputDependencies

export const useInputDependencies: UseInputDependencies = dependencies => {
  const { values } = useFormikContext<InputsFormValues>()

  const inputDependencies = useMemo(() => {
    return dependencies.reduce<InputDependencies>((acc, current) => {
      const { isFixedValue, field_name, input_name, field_value } = current

      if (!field_name) return acc

      // if dependency is a fixed value
      if (isFixedValue) {
        acc[field_name] = field_value
        return acc
      }

      // if dependency is a runtime input
      if (!input_name) return acc
      acc[field_name] = get(values, input_name)
      return acc
    }, {})
  }, [dependencies, values])

  return inputDependencies
}
