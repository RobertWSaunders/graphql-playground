import { Store } from 'redux'
import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import createStore from '../state/createStore'
import PlaygroundWrapper from './PlaygroundWrapper'

const config = {
  projects: {
    Admin: {
      extensions: {
        endpoints: {
          '2019-04': {
            url: 'https://eu1.prisma.sh/public-asdf/session65/dev',
          },
          '2019-07': {
            url: 'https://eu1.prisma.sh/public-asdf/session65/dev',
          },
          '2019-10': {
            url: 'https://eu1.prisma.sh/public-asdf/session65/dev',
          },
          unstable: {
            url: 'https://eu1.prisma.sh/public-asdf/session65/dev',
          },
        },
      },
    },
    Storefront: {
      extensions: {
        endpoints: {
          '2019-04': {
            url: 'https://eu1.prisma.sh/public-asdf/session65/dev',
          },
          '2019-07': {
            url: 'https://eu1.prisma.sh/public-asdf/session65/dev',
          },
          '2019-10': {
            url: 'https://eu1.prisma.sh/public-asdf/session65/dev',
          },
          unstable: {
            url: 'https://eu1.prisma.sh/public-asdf/session65/dev',
          },
        },
      },
    },
  },
}

export const store: Store<any> = createStore()

const PlaygroundWrapperWithConfig = () => <PlaygroundWrapper config={config} />

export default class ShopifyGraphiQL extends React.Component<{}, {}> {
  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <Switch>
            <Route path="*" render={PlaygroundWrapperWithConfig} />
          </Switch>
        </BrowserRouter>
      </Provider>
    )
  }
}
