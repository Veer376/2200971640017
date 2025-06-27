import { useState, useEffect } from 'react';
import { 
  CssBaseline, 
  ThemeProvider, 
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box
} from '@mui/material';
import './App.css';
import theme from './theme/theme';
import URLShortenerPage from './components/URLShortenerPage';
import URLStatsPage from './components/URLStatsPage';
import Navigation from './components/Navigation';
import Log from './utils/logger';

function App() {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Log application startup
    Log('info', 'page', 'URL Shortener application started');
    
    // Return cleanup function
    return () => {
      Log('info', 'page', 'URL Shortener application closing');
    };
  }, []);

  const handleTabChange = (newTab: number) => {
    setActiveTab(newTab);
    Log('info', 'page', `Navigated to tab ${newTab}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
          
          {activeTab === 0 && <URLShortenerPage />}
          {activeTab === 1 && <URLStatsPage />}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App
