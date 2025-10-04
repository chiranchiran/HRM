import React, { useState, useEffect } from 'react';
import { ScheduleOutlined } from '@ant-design/icons';
import { Space, Typography } from 'antd';
import 'antd/dist/reset.css';

const { Text } = Typography;

const NavDateTime = ({ onClick }) => {
  // 存储当前日期时间
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // 每秒更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // 组件卸载时清除定时器
    return () => clearInterval(timer);
  }, []);

  // 格式化日期 (例：2023-10-05 周四)
  const formatDate = (date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    }).replace(/\//g, '-');
  };

  // 格式化时间 (例：14:30:45)
  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <Space size="middle" align="center">
      {/* 时钟图标 */}
      <ScheduleOutlined onClick={onClick} size="26" style={{ color: '#1890ff' }} />

      {/* 日期显示 */}
      <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
        {formatDate(currentDateTime)}
      </Text>

      {/* 时间显示（加粗突出） */}
      <Text strong style={{ whiteSpace: 'nowrap' }}>
        {formatTime(currentDateTime)}
      </Text>
    </Space>
  );
};

export default NavDateTime;
