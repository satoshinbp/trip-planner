import React from 'react'
import withAuth from '../src/withAuth'
import SidePage from '../src/components/SidePage'
import DashboardPage from '../src/components/DashboardPage'

export default withAuth((props) => {
  if (props.status === 'signed out') {
    return <SidePage />
  } else if (props.status === 'signed in') {
    return <DashboardPage {...props} />
  }
})
