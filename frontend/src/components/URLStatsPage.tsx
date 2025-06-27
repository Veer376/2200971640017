import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import Log from '../utils/logger';
import apiService from '../services/apiService';
import type { UrlStats } from '../services/apiService';

const URLStatsPage: React.FC = () => {
  const [shortcode, setShortcode] = useState<string>('');
  const [stats, setStats] = useState<UrlStats | null>(null);
  const [historicalStats, setHistoricalStats] = useState<UrlStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load historical stats from localStorage on component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('urlShortener.stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistoricalStats(parsed);
          Log('info', 'component', `Loaded ${parsed.length} historical stats from localStorage`);
        }
      }
    } catch (err) {
      Log('error', 'component', `Failed to load historical stats: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Check if a URL has expired
  const isExpired = (expiryDate: string): boolean => {
    try {
      return new Date(expiryDate) < new Date();
    } catch {
      return false;
    }
  };

  // Fetch stats for a specific shortcode
  const fetchStats = async () => {
    if (!shortcode.trim()) {
      setError('Please enter a shortcode');
      return;
    }

    setLoading(true);
    setError(null);
    setStats(null);
    
    Log('info', 'component', `Fetching stats for shortcode: ${shortcode}`);
    
    try {
      const statsData = await apiService.getUrlStats(shortcode);
      setStats(statsData);
      
      // Save to historical stats if not already present
      const exists = historicalStats.some(s => s.shortcode === statsData.shortcode);
      if (!exists) {
        const newHistoricalStats = [...historicalStats, statsData].slice(-10); // Keep last 10 only
        setHistoricalStats(newHistoricalStats);
        localStorage.setItem('urlShortener.stats', JSON.stringify(newHistoricalStats));
        Log('debug', 'component', 'Added new stats to history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch URL statistics');
      Log('error', 'component', `Error fetching stats: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        URL Shortener Statistics
      </Typography>

      {/* Search Form */}
      <Paper elevation={2} sx={{ padding: 3, mb: 4 }}>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); fetchStats(); }}>
          <Typography variant="h6" gutterBottom>
            Look up URL Statistics
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Enter Shortcode"
              variant="outlined"
              fullWidth
              value={shortcode}
              onChange={(e) => setShortcode(e.target.value)}
              placeholder="e.g., abc123"
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={fetchStats}
              disabled={loading || !shortcode.trim()}
              sx={{ height: 56 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Get Stats"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Current Stats Result */}
      {stats && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              Statistics for: {stats.shortcode}
            </Typography>
            <Chip 
              label={isExpired(stats.expiry) ? "Expired" : "Active"} 
              color={isExpired(stats.expiry) ? "error" : "success"}
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              <strong>Original URL:</strong> {stats.originalUrl}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Created:</strong> {formatDate(stats.createdAt)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Expires:</strong> {formatDate(stats.expiry)}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              <strong>Total Clicks:</strong> {stats.clicks}
            </Typography>
          </Box>

          {stats.clickData && stats.clickData.length > 0 ? (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Click Details
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Timestamp</strong></TableCell>
                      <TableCell><strong>Source</strong></TableCell>
                      <TableCell><strong>Location</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.clickData.map((click, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(click.timestamp)}</TableCell>
                        <TableCell>{click.source || 'Direct'}</TableCell>
                        <TableCell>{click.location || 'Unknown'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Typography color="text.secondary">
              No clicks recorded for this URL yet.
            </Typography>
          )}
        </Paper>
      )}

      {/* Historical Stats */}
      {historicalStats.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Recently Viewed Statistics
          </Typography>
          {historicalStats.map((stat, index) => (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <LinkIcon color="primary" />
                  <Typography sx={{ flexGrow: 1 }}>
                    {stat.shortcode}
                  </Typography>
                  <Chip 
                    label={isExpired(stat.expiry) ? "Expired" : "Active"} 
                    color={isExpired(stat.expiry) ? "error" : "success"}
                    size="small"
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {stat.clicks} click{stat.clicks !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="body2">
                    <strong>Original URL:</strong> {stat.originalUrl}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Created:</strong> {formatDate(stat.createdAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Expires:</strong> {formatDate(stat.expiry)}
                  </Typography>
                  
                  {stat.clickData && stat.clickData.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Click Details
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Timestamp</strong></TableCell>
                              <TableCell><strong>Source</strong></TableCell>
                              <TableCell><strong>Location</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stat.clickData.map((click, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{formatDate(click.timestamp)}</TableCell>
                                <TableCell>{click.source || 'Direct'}</TableCell>
                                <TableCell>{click.location || 'Unknown'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default URLStatsPage;
