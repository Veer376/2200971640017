import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import BarChartIcon from '@mui/icons-material/BarChart';
import Log from '../utils/logger';

interface NavigationProps {
  activeTab: number;
  onTabChange: (newTab: number) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    Log('debug', 'component', `Navigation tab changed to ${newValue}`);
    onTabChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        aria-label="URL Shortener Navigation"
        centered
      >
        <Tab icon={<LinkIcon />} label="Shorten URLs" />
        <Tab icon={<BarChartIcon />} label="URL Statistics" />
      </Tabs>
    </Box>
  );
};

export default Navigation;
