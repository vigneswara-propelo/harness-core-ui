interface YamlVersionSwitchProps {
  yamlVersion: '0' | '1' | undefined
  loading: JSX.Element
  v0: JSX.Element
  v1: JSX.Element
}

export function YamlVersionSwitch({ yamlVersion, v0, v1, loading }: YamlVersionSwitchProps): JSX.Element {
  return yamlVersion === '0' ? v0 : yamlVersion === '1' ? v1 : loading
}
