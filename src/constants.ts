import { List, Map } from 'immutable'
import * as cuid from 'cuid'

import { getQueryTypes } from './components/Playground/util/getQueryTypes'

export const columnWidth = 300

export const introspectionQuery = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`

export const defaultQuery = `
  # Welcome to Shopify's GraphiQL
  #
  # GraphiQL is an in -browser IDE for writing, validating, and
  # testing GraphQL queries.
  #
  # ########## 📣 IMPORTANT NOTE 📣 ##########
  # GraphiQL in Shopify Services Internal has been modified to let you perform your
  # queries with a particular schema, app and - in some cases - user selected.
  #
  # Apps are filtered per schema and users are filtered per app.
  # See more: https://github.com/Shopify/graphql/blob/master/SHOPIFY_GRAPHIQL.md
  # #########################################
  #
  # Type queries into this side of the screen, and you will
  # see intelligent typeaheads aware of the current GraphQL type schema and
  # live syntax and validation errors highlighted within the text.
  #
  # To bring up the auto - complete at any point, just press Ctrl - Space.
  #
  # Press the run button above, or Cmd - Enter to execute the query, and the result
  # will appear in the pane to the right.
  #
  # As always, don't forget Spiderman! 🕷
`

export const modalStyle = {
  overlay: {
    zIndex: 99999,
    backgroundColor: 'rgba(15,32,46,.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'relative',
    width: 976,
    height: 'auto',
    top: 'initial',
    left: 'initial',
    right: 'initial',
    bottom: 'initial',
    borderRadius: 2,
    padding: 0,
    border: 'none',
    background: 'none',
    boxShadow: '0 1px 7px rgba(0,0,0,.2)',
  },
}

export function getDefaultSession(endpoint: string) {
  return {
    id: cuid(),
    query: defaultQuery,
    variables: '',
    responses: List([]),
    endpoint,
    operationName: undefined,
    hasMutation: false,
    hasSubscription: false,
    hasQuery: false,
    queryTypes: getQueryTypes(defaultQuery),
    subscriptionActive: false,
    date: new Date(),
    starred: false,
    queryRunning: false,
    operations: List([]),
    isReloadingSchema: false,
    isSchemaPendingUpdate: false,
    responseExtensions: {},
    queryVariablesActive: false,
    endpointUnreachable: false,
    editorFlex: 1,
    variableEditorOpen: false,
    variableEditorHeight: 200,
    responseTracingOpen: false,
    responseTracingHeight: 300,
    docExplorerWidth: 350,
    variableToType: Map({}),
    headers: '',
    file: undefined,
    isFile: false,
    name: undefined,
    filePath: undefined,
    selectedUserToken: undefined,
    hasChanged: undefined,
    absolutePath: undefined,
    isSettingsTab: undefined,
    isConfigTab: undefined,
    currentQueryStartTime: undefined,
    currentQueryEndTime: undefined,
    nextQueryStartTime: undefined,
    tracingSupported: undefined,
    changed: undefined,
    scrollTop: undefined,
  } as any
}
