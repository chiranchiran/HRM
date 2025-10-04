import React, { useEffect, useState } from 'react';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  FileDoneOutlined,
  DollarOutlined,
  InsuranceOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Breadcrumb, Button, Layout, Menu, Space, theme } from 'antd';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './index.less'
import { logger } from '../../utils/logger';
import { useSelector } from 'react-redux';
import NavDateTime from '../common/NavDateTime';
import NavCalendar from '../common/NavCalendar';

const { Header, Content, Footer, Sider } = Layout;
const siderStyle = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

const items = [
  { key: '/dashboard', icon: React.createElement(HomeOutlined), label: '首页' },
  { key: '/department', icon: React.createElement(TeamOutlined), label: '部门', },
  { key: '/role', icon: React.createElement(UserSwitchOutlined), label: '角色', },
  { key: '/emploee', icon: React.createElement(UserOutlined), label: '员工', },
  { key: '/permission', icon: React.createElement(SafetyCertificateOutlined), label: '权限', },
  { key: '/attendance', icon: React.createElement(ScheduleOutlined), label: '考勤', },
  { key: '/approval', icon: React.createElement(FileDoneOutlined), label: '审批', },
  { key: '/salary', icon: React.createElement(DollarOutlined), label: '工资', },
  { key: '/social', icon: React.createElement(InsuranceOutlined), label: '社保', }
]

const Main = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [calendar, setCalendar] = useState(false)
  const { id, username } = useSelector(state => state.auth)
  const [breadList, setBreadList] = useState(["首页"])
  const path = useLocation().pathname
  const navigate = useNavigate()
  const bread = breadList.map((i) => {
    if (i === "首页") {
      return { title: '首页' }
    }
    return { title: <NavLink to={findKey(i)}>{i}</NavLink> }
  })
  //根据路径找label
  const findLabel = i => {
    const item = items.find((path) => path.key === "/" + i)
    if (!item) {
      return 0
    }
    return item.label
  }
  //根据label找key
  const findKey = i => {
    const item = items.find(path => path.label === i)
    return item.key
  }

  useEffect(() => {
    logger.debug("当前路径是", path)
    const arr = ["首页"]
    path.split("/").forEach(item => {
      const label = findLabel(item)
      if (label && label !== "首页") arr.push(label)
    })
    setBreadList(arr)
  }, [path])

  const changeTab = ({ item, key, keyPath, domEvent }) => {
    navigate(key)
  }

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout hasSider>
      <Sider trigger={null} collapsible collapsed={collapsed} style={siderStyle}>
        <div className="demo-logo-vertical">HRM</div>
        <Menu className="tab-item" theme="dark" mode="inline" onClick={changeTab} defaultSelectedKeys={['1']} items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Breadcrumb
            className='bread'
            items={bread}
          />
          <span className="user">
            <Space size={16} wrap>
              <NavDateTime onClick={() => setCalendar(!calendar)} />
              <Badge size="small" count={78} overflowCount={99}>
                <Avatar size="middle" icon={<MessageOutlined />} />
              </Badge>
              <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
            </Space>
            <span>{username}</span>
          </span>
          {calendar && <NavCalendar />}
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          {/* <div
            style={{
              padding: 24,
              textAlign: 'center',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
           
          </div> */}
          <Outlet />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};
export default Main;