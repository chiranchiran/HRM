import { PageContainer, ProCard } from '@ant-design/pro-components'
import React from 'react'
import './index.less'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="company"></div>
      <div className="menu"></div>
      <div className="social"></div>
      <div className="money"></div>
      <div className="help"></div>
      <div className="calendar"></div>
      <div className="notice"></div>
    </div>
  )
}
