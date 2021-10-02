import * as _ from 'lodash'
import YAML = require('yaml')
import * as fs from 'fs'

interface generateFcYamlFileInPut {
    aliasName: string
    region: string
    projectName: string
    logProject?: string
    logStore?: string
    actions: { 'pre-deploy': { run: string; path: string }[] }
    environmentVariables: any
    codeUri: string
    domainName?: string
}

export const generateFcYamlFile = (
    {
        aliasName,
        region,
        projectName,
        logProject,
        logStore,
        actions,
        environmentVariables,
        codeUri,
        domainName,
    }: generateFcYamlFileInPut,
    path: string,
) => {
    const baseFcYaml = {
        edition: '1.0.0',
        name: 'transform_fun',
        access: aliasName,
        vars: {
            region,
        },
        services: {},
    }
    if (logProject && logStore) {
        _.set(baseFcYaml, `services.${logProject}`, {
            component: 'devsapp/sls',
            props: {
                regionId: region,
                project: logProject,
                description: 'wss',
                logstore: [
                    {
                        name: logStore,
                        option: {
                            ttl: 333,
                            shardCount: 2,
                        },
                    },
                ],
                logstoreOption: {
                    ttl: 456,
                    shardCount: 1,
                },
            },
        })
    }
    _.set(baseFcYaml, `services.${projectName}`, {
        component: 'devsapp/fc',
        ...(!_.isEmpty(actions) ? { actions } : {}),
        props: {
            region,
            service: {
                name: projectName,
                description: 'This is FC service',
                internetAccess: true,
                ...(logProject && logStore
                    ? {
                          logConfig: {
                              project: logProject,
                              logstore: logStore,
                          },
                      }
                    : {}),
            },
            function: {
                name: projectName,
                handler: 'index.handler',
                timeout: 180,
                memorySize: 1024,
                runtime: 'custom',
                environmentVariables,
                instanceConcurrency: 5,
                codeUri,
            },
            triggers: [
                {
                    name: 'httpTrigger',
                    type: 'http',
                    config: {
                        authType: 'anonymous',
                        methods: ['GET', 'POST', 'PUT'],
                    },
                },
            ],
            ...(!_.isEmpty(domainName)
                ? {
                      customDomains: [
                          {
                              domainName,
                              protocol: 'HTTP',
                              routeConfigs: [
                                  {
                                      path: '/*',
                                  },
                              ],
                          },
                      ],
                  }
                : {}),
        },
    })
    fs.writeFileSync(path, YAML.stringify(baseFcYaml))
}
