import { Store } from 'redux'
import * as React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import createStore from '../state/createStore'
import PlaygroundWrapper from './PlaygroundWrapper'

export interface Props {
  config: any
  fetcher: any
}

export const store: Store<any> = createStore()

export default class ShopifyGraphiQL extends React.Component<Props, {}> {
  constructor(props) {
    super(props)

    this.playgroundWrapperWithConfig = this.playgroundWrapperWithConfig.bind(
      this,
    )
  }

  playgroundWrapperWithConfig() {
    return (
      <PlaygroundWrapper
        config={this.props.config}
        fetcher={this.props.fetcher}
      />
    )
  }

  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <Switch>
            <Route path="*" render={this.playgroundWrapperWithConfig} />
          </Switch>
        </BrowserRouter>
      </Provider>
    )
  }
}
