// src/components/Sidebar.tsx
import React from 'react';
import { Sidenav, Nav } from 'rsuite';
import DashboardIcon from '@rsuite/icons/legacy/Dashboard';
import GroupIcon from '@rsuite/icons/legacy/Group';
import MagicIcon from '@rsuite/icons/legacy/Magic';
import GearCircleIcon from '@rsuite/icons/legacy/GearCircle';

const styles = {
  width: 240,
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  position: 'fixed',
  top: 0,
  left: 0,
  borderRight: '1px solid #ddd',
};



interface SidebarProps {
  activeKey: string;
  openKeys: string[];
  expanded: boolean;
  onExpand: (expand: boolean) => void;
  onOpenChange: (openKeys: string[]) => void;
  onSelect: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeKey, openKeys, expanded, onExpand, onOpenChange, onSelect }) => {
  return (
    <div style={styles}>
      <Sidenav expanded={expanded} openKeys={openKeys} onOpenChange={onOpenChange}>
  {/* Body will take top space */}
  <div>
    <Sidenav.Body>
      <Nav activeKey={activeKey} onSelect={onSelect}>
        <Nav.Item eventKey="dashboard" icon={<DashboardIcon />}>Dashboard</Nav.Item>
        <Nav.Item eventKey="project" icon={<GroupIcon />}>Project</Nav.Item>
        <Nav.Item eventKey="task" icon={<MagicIcon />}>Task</Nav.Item>
        <Nav.Menu eventKey="settings" title="Settings" icon={<GearCircleIcon />}>
          <Nav.Item eventKey="settings-1">Applications</Nav.Item>
          <Nav.Item eventKey="settings-2">Channels</Nav.Item>
        </Nav.Menu>
      </Nav>
    </Sidenav.Body>
  </div>

  {/* Toggle will stay at bottom */}
  <div>
    <Sidenav.Toggle onToggle={onExpand} />
  </div>
</Sidenav>

    </div>
  );
};

export default Sidebar;
