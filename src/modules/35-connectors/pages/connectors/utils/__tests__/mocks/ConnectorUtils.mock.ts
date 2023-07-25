export const prometheusConectorFormData = {
  name: 'prometheus-connector',
  identifier: 'prometheusconnector',
  accountIdentifier: 'acc',
  projectIdentifier: 'project',
  orgIdentifier: 'org',
  type: 'Prometheus',
  spec: {
    url: 'http://testurl.com',
    username: 'testUserName',
    passwordRef: 'account.secret',
    headers: [],
    delegateSelectors: []
  },
  url: 'http://testurl.com',
  username: 'testUserName',
  passwordRef: {
    identifier: 'secret_name',
    name: 'secret_name',
    referenceString: 'account.secret.reference',
    accountIdentifier: 'acc'
  },
  headers: [
    {
      key: '',
      value: {
        textField: '',
        fieldType: 'TEXT'
      }
    }
  ],
  delegateSelectors: []
}

export const expectedPrometheusConnector = {
  connector: {
    identifier: 'prometheusconnector',
    name: 'prometheus-connector',
    orgIdentifier: 'org',
    projectIdentifier: 'project',
    spec: {
      accountId: undefined,
      delegateSelectors: [],
      headers: [],
      passwordRef: 'account.secret.reference',
      url: 'http://testurl.com',
      username: 'testUserName'
    },
    type: 'Prometheus'
  }
}
