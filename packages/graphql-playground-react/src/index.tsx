import * as ReactDOM from 'react-dom'
import * as React from 'react'

import ShopifyGraphiQL from './components/ShopifyGraphiQL'
import './index.css'

/* tslint:disable-next-line */
;(window as any)['GraphQLPlayground'] = {
  init(element: HTMLElement, options) {
    ReactDOM.render(<ShopifyGraphiQL {...options} />, element)
  },
}
