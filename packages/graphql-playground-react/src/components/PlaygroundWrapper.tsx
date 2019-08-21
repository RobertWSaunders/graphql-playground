import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'

import ProjectsSideNav from './ProjectsSideNav'
import { GraphQLConfig } from '../graphqlConfig'
import Playground, { Playground as IPlayground } from './Playground'

import {
  styled,
  ThemeProvider,
  theme as styledTheme,
  keyframes,
} from '../styled'

import {
  darkColours,
  lightColours,
  darkEditorColours,
  lightEditorColours,
  EditorColours,
} from '../styled/theme'

import { ISettings } from '../types'
import { ApolloLink } from 'apollo-link'
import { getActiveEndpoints } from './util'
import { injectTabs } from '../state/workspace/actions'
import { Session, Tab } from '../state/sessions/reducers'
import { getTheme, getSettings } from '../state/workspace/reducers'
import { buildSchema, buildClientSchema, GraphQLSchema } from 'graphql'

export interface Props {
  history?: any
  match?: any
  headers?: any

  endpoint?: string
  endpointUrl?: string
  settings?: ISettings
  fixedEndpoint?: string
  folderName?: string
  configString?: string
  showNewWorkspace?: boolean
  canSaveConfig?: boolean
  onSaveConfig?: (configString: string) => void
  onNewWorkspace?: () => void
  getRef?: (ref: any) => void
  platformToken?: string
  env?: any
  config?: GraphQLConfig
  configPath?: string
  injectedState?: any
  createApolloLink?: (
    session: Session,
    subscriptionEndpoint?: string,
  ) => ApolloLink
  tabs?: Tab[]
  schema?: { __schema: any }
  codeTheme?: EditorColours
  workspaceName?: string
}

export interface ReduxProps {
  theme: string
  injectTabs: (tabs: Tab[]) => void
}

export interface State {
  headers?: any
  endpoint?: string
  loading: boolean
  platformToken?: string
  configString?: string
  activeProjectName?: string
  activeEnv?: string
  schema?: GraphQLSchema
}

export interface ReduxProps {
  injectState: (state: any) => void
}

function getParameterByName(name: string, uri?: string): string | null {
  const url = uri || window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  const regexa = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regexa.exec(url)
  if (!results || !results[2]) {
    return null
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

class PlaygroundWrapper extends React.Component<Props & ReduxProps, State> {
  playground: IPlayground

  constructor(props: Props & ReduxProps) {
    super(props)

    this.state = this.mapPropsToState(props)
    this.removeLoader()
  }

  mapPropsToState(props: Props): State {
    // this.state = {
    //   endpoint: props.endpoint,
    //   loading: false,
    //   headers: props.headers || {},
    // }

    const { activeEnv, projectName } = this.getInitialActiveEnv(props.config)

    let endpoint =
      props.endpoint ||
      props.endpointUrl ||
      getParameterByName('endpoint') ||
      location.href

    const result = this.extractEndpointAndHeaders(endpoint)
    endpoint = result.endpoint
    let headers = result.headers

    if (props.configString && props.config && activeEnv) {
      const endpoints = getActiveEndpoints(props.config, activeEnv, projectName)
      endpoint = endpoints.endpoint
      headers = endpoints.headers
    }

    return {
      loading: false,
      endpoint: this.absolutizeUrl(endpoint),
      platformToken:
        props.platformToken ||
        localStorage.getItem('platform-token') ||
        undefined,
      configString: props.configString,
      activeEnv,
      activeProjectName: projectName,
      headers,
    }
  }

  componentWillMount() {
    const platformToken = getParameterByName('platform-token')
    if (platformToken && platformToken.length > 0) {
      localStorage.setItem('platform-token', platformToken)
      window.location.replace(window.location.origin + window.location.pathname)
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.removePlaygroundInClass()
    }, 5000)
    this.setInitialWorkspace()

    if (this.props.tabs) {
      this.props.injectTabs(this.props.tabs)
    } else {
      const query = getParameterByName('query')
      if (query) {
        // const endpoint = getParameterByName('endpoint') || this.state.endpoint
        // this.props.injectTabs([{ query, endpoint }])
      } else {
        const tabsString = getParameterByName('tabs')
        if (tabsString) {
          try {
            const tabs = JSON.parse(tabsString)
            this.props.injectTabs(tabs)
          } catch (e) {}
        }
      }
    }

    if (this.props.schema) {
      // in this case it's sdl
      if (typeof this.props.schema === 'string') {
        this.setState({ schema: buildSchema(this.props.schema) })
        // if it's an object, it must be an introspection query
      } else {
        this.setState({ schema: buildClientSchema(this.props.schema) })
      }
    }
  }

  componentWillReceiveProps(nextProps: Props & ReduxProps) {
    if (
      nextProps.endpoint !== this.props.endpoint ||
      nextProps.endpointUrl !== this.props.endpointUrl ||
      nextProps.configString !== this.props.configString ||
      nextProps.platformToken !== this.props.platformToken ||
      nextProps.config !== this.props.config
    ) {
      this.setState(this.mapPropsToState(nextProps))
      this.setInitialWorkspace(nextProps)
    }
  }

  extractEndpointAndHeaders(endpoint) {
    const splitted = endpoint.split('?')
    if (splitted.length === 1) {
      return { endpoint }
    }
    try {
      const headers = getParameterByName('headers', endpoint)
      if (headers) {
        return { headers: JSON.parse(headers), endpoint: splitted[0] }
      }
    } catch (e) {
      //
    }

    return { endpoint: splitted[0] }
  }

  getInitialActiveEnv(
    config?: GraphQLConfig,
  ): { projectName?: string; activeEnv?: string } {
    if (config && config.projects) {
      const projectName = Object.keys(config.projects)[0]
      const project = config.projects[projectName]

      if (project.extensions && project.extensions.endpoints) {
        return {
          activeEnv: Object.keys(project.extensions.endpoints)[0],
          projectName,
        }
      }
    }

    return {}
  }

  setInitialWorkspace(props = this.props) {
    if (props.config) {
      const activeEnv = this.getInitialActiveEnv(props.config)

      const endpoints = getActiveEndpoints(
        props.config,
        activeEnv.activeEnv!,
        activeEnv.projectName,
      )

      const endpoint = endpoints.endpoint
      const headers = endpoints.headers

      this.setState({
        headers,
        endpoint,
        activeEnv: activeEnv.activeEnv,
        activeProjectName: activeEnv.projectName,
      })
    }
  }

  handleUpdateSessionCount = () => {
    this.forceUpdate()
  }

  getPlaygroundRef = ref => {
    this.playground = ref
    if (typeof this.props.getRef === 'function') {
      this.props.getRef(ref)
    }
  }

  handleChangeConfig = (configString: string) => {
    this.setState({ configString })
  }

  handleSaveConfig = () => {
    /* tslint:disable-next-line */
    if (typeof this.props.onSaveConfig === 'function') {
      /* tslint:disable-next-line */
      this.props.onSaveConfig(this.state.configString!)
    }
  }

  handleSelectEnv = (env: string, projectName?: string) => {
    const { endpoint, headers } = getActiveEndpoints(
      this.props.config!,
      env,
      projectName,
    )!
    this.setState({
      activeEnv: env,
      endpoint,
      headers,
      activeProjectName: projectName,
    })
  }

  removeLoader() {
    const loadingWrapper = document.getElementById('loading-wrapper')

    if (loadingWrapper) {
      loadingWrapper.remove()
    }
  }

  removePlaygroundInClass() {
    const root = document.getElementById('root')

    if (root) {
      root.classList.remove('playgroundIn')
    }
  }

  absolutizeUrl(url) {
    if (url.startsWith('/')) {
      return location.origin + url
    }

    return url
  }

  render() {
    const stateHeaders = this.state.headers || {}
    const defaultHeaders = this.props.headers || {}
    const combinedHeaders = { ...defaultHeaders, ...stateHeaders }

    const { theme } = this.props

    return (
      <Wrapper>
        <div>
          <Helmet>
            <title>{this.getTitle()}</title>
          </Helmet>
          <ThemeProvider
            theme={{
              ...styledTheme,
              mode: theme,
              colours: theme === 'dark' ? darkColours : lightColours,
              editorColours: {
                ...(theme === 'dark' ? darkEditorColours : lightEditorColours),
                ...this.props.codeTheme,
              },
              settings: this.props.settings,
            }}
          >
            <App>
              <ProjectsSideNav
                config={this.props.config}
                theme={theme}
                activeEnv={this.state.activeEnv}
                onSelectEnv={this.handleSelectEnv}
                onNewWorkspace={this.props.onNewWorkspace}
                showNewWorkspace={Boolean(this.props.showNewWorkspace)}
                activeProjectName={this.state.activeProjectName}
                configPath={this.props.configPath}
              />
              <Playground
                endpoint={this.state.endpoint}
                onChangeEndpoint={this.handleChangeEndpoint}
                adminAuthToken={this.state.platformToken}
                getRef={this.getPlaygroundRef}
                config={this.props.config!}
                configString={this.state.configString!}
                canSaveConfig={Boolean(this.props.canSaveConfig)}
                onChangeConfig={this.handleChangeConfig}
                onSaveConfig={this.handleSaveConfig}
                onUpdateSessionCount={this.handleUpdateSessionCount}
                fixedEndpoints={Boolean(this.state.configString)}
                fixedEndpoint={this.props.fixedEndpoint}
                headers={combinedHeaders}
                configPath={this.props.configPath}
                workspaceName={
                  this.props.workspaceName || this.state.activeProjectName
                }
                createApolloLink={this.props.createApolloLink}
                schema={this.state.schema}
              />
            </App>
          </ThemeProvider>
        </div>
      </Wrapper>
    )
  }

  private handleChangeEndpoint = endpoint => {
    this.setState({ endpoint })
  }

  private getTitle() {
    return `Hey Title`
  }
}

const mapStateToProps = (state, ownProps) => {
  const theme = ownProps.theme || getTheme(state, ownProps.settings)
  const settings = getSettings(state)
  return { theme, settings }
}

export default connect(
  mapStateToProps,
  { injectTabs },
)(PlaygroundWrapper)

const appearIn = keyframes`
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`

const App = styled.div`
  display: flex;
  width: 100%;
  opacity: 0;
  transform: translateY(10px);
  animation: ${appearIn} 0.5s ease-out forwards 0.2s;
`
