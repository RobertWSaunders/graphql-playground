import * as React from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { GraphQLConfig, GraphQLConfigEnpointsMapData } from '../graphqlConfig'
import { getWorkspaceId } from './Playground/util/getWorkspaceId'
import { getSessionCounts } from '../state/workspace/reducers'
import ProjectsSideNavItem from './ProjectsSideNavItem'
import { getEndpointFromEndpointConfig } from './util'
import { styled } from '../styled/index'

export interface Props {
  theme: string
  activeEnv: string
  configPath?: string
  config: GraphQLConfig
  activeProjectName?: string
  onSelectEnv: (endpoint: string, projectName?: string) => void
}

export interface ReduxProps {
  counts: Map<string, number>
}

class ProjectsSideNav extends React.Component<Props & ReduxProps, {}> {
  render() {
    const { config } = this.props
    const projects = config.projects

    return (
      <SideNav>
        <List>
          <TitleRow>
            <Title>Shopify GraphiQL</Title>
          </TitleRow>

          {projects && this.renderProjects(projects)}
        </List>
      </SideNav>
    )
  }

  private renderProjects(projects) {
    return Object.keys(projects).map(projectName => {
      const project = projects[projectName]
      const projectEndpoints =
        project.extensions && project.extensions.endpoints

      if (!projectEndpoints) {
        return null
      }

      return (
        <Project key={projectName}>
          <ProjectName>{projectName}</ProjectName>
          {this.renderEndpoints(projectEndpoints, projectName)}
        </Project>
      )
    })
  }

  private renderEndpoints(
    endpoints: GraphQLConfigEnpointsMapData,
    projectName?: string,
  ) {
    return Object.keys(endpoints).map(env => {
      const { endpoint } = getEndpointFromEndpointConfig(endpoints[env])
      const count =
        this.props.counts.get(
          getWorkspaceId({
            endpoint,
            configPath: this.props.configPath,
            workspaceName: projectName,
          }),
        ) || 1
      return (
        <ProjectsSideNavItem
          key={env}
          env={env}
          onSelectEnv={this.props.onSelectEnv}
          activeEnv={this.props.activeEnv}
          count={count}
          deep={Boolean(projectName)}
          projectName={projectName}
          activeProjectName={this.props.activeProjectName}
        />
      )
    })
  }
}

const mapStateToProps = createStructuredSelector({
  counts: getSessionCounts,
})

export default connect(mapStateToProps)(ProjectsSideNav)

const SideNav = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: ${p => p.theme.editorColours.sidebar};
  flex-basis: 222px;
  color: ${p => p.theme.editorColours.text};
  border-right: 6px solid ${p => p.theme.editorColours.background};
`

const List = styled.div`
  -webkit-app-region: drag;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  background: ${p => p.theme.editorColours.sidebarTop};
`

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${p => p.theme.editorColours.text};
  word-break: break-word;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  margin: 0 15px 20px 15px;
  svg {
    -webkit-app-region: no-drag;
    min-width: 18px;
    min-height: 18px;
    cursor: pointer;
    fill: ${p => p.theme.editorColours.icon};
    transition: 0.1s linear fill;
  }
  &:hover {
    svg {
      fill: ${p => p.theme.editorColours.iconHover};
    }
  }
`

const Project = styled.div`
  display: flex;
  flex-direction: column;
  & + & {
    margin-top: 12px;
  }
  &:last-child {
    margin-bottom: 32px;
  }
`

const ProjectName = styled.div`
  font-size: 14px;
  color: ${p => p.theme.editorColours.text};
  font-weight: 600;
  letter-spacing: 0.53px;
  margin: 0 10px 6px 30px;
  word-break: break-word;
`
