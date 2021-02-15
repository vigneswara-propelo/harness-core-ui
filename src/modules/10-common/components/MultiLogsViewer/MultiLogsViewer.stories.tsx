/* eslint-disable no-console */
import React from 'react'
import type { Meta, Story } from '@storybook/react'

import { MultiLogsViewer, MultiLogsViewerProps } from './MultiLogsViewer'

export default {
  title: 'Components / MultiLogsViewer',
  component: MultiLogsViewer
} as Meta

const data = `Initializing..

[1;97m[40m
[1;97m[40mRendering manifest files using go template#==#
[1;97m[40mOnly manifest files with [.yaml] or [.yml] extension will be processed#==#
[1;97m[40m
[1;97m[40mManifests [Post template rendering] :
[1;97m[40m#==#
---

apiVersion: v1
kind: Namespace
metadata:
  name: rohan-dev
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: todolist-config
data:
  key: value
---
apiVersion: v1
kind: Service
metadata:
  name: todolist-svc
spec:
  type: LoadBalancer
  loadBalancerIP: 130.211.229.35
  ports:
  - port: 80
    targetPort: todolist
    protocol: TCP
  selector:
    app: todolist
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todolist-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: todolist
  template:
    metadata:
      labels:
        app: todolist
    spec:
      containers:
      - name: todolist
        image: bluebbb/godemo:24
        envFrom:
        - configMapRef:
            name: todolist-config
        resources:
          limits:
            memory: 512Mi
            cpu: 100m
          requests:
            memory: 512Mi
            cpu: 100m
        ports:
        - name: todolist
          containerPort: 8080
          protocol: "TCP"

[1;97m[40m
[1;97m[40mValidating manifests with Dry Run#==#

kubectl --kubeconfig=config apply --filename=manifests-dry-run.yaml --dry-run

namespace/rohan-dev configured (dry run)
configmap/todolist-config created (dry run)
service/todolist-svc configured (dry run)
deployment.apps/todolist-deployment configured (dry run)

Done.`

export const Basic: Story<MultiLogsViewerProps> = args => (
  <div style={{ height: '600px' }}>
    <MultiLogsViewer {...args} onSectionClick={(id, status) => console.log({ id, status })} />
  </div>
)

Basic.args = {
  data: [
    {
      title: 'Entry 1',
      data,
      id: 'entry-1',
      status: 'success'
    },
    {
      title: 'Entry 2',
      data,
      id: 'entry-2',
      status: 'error'
    },
    {
      title: 'Entry 3',
      data,
      id: 'entry-3',
      status: 'loading'
    },
    {
      title: 'Entry 4',
      data,
      id: 'entry-4'
    }
  ]
}
