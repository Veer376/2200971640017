import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Stack,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  Link,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Log from '../utils/logger';
import apiService from '../services/apiService';
import type { CreateUrlRequest } from '../services/apiService';

interface ShortUrlResult {
  originalUrl: string;
  shortLink: string;
  expiry: string;
}

const URLShortenerPage: React.FC = () => {
  // State for URL form fields (up to 5)
  const [urlFields, setUrlFields] = useState<CreateUrlRequest[]>([{ url: '' }]);
  const [results, setResults] = useState<ShortUrlResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add a new URL field (up to 5)
  const addUrlField = () => {
    if (urlFields.length < 5) {
      Log('debug', 'component', 'Adding new URL field');
      setUrlFields([...urlFields, { url: '' }]);
    } else {
      setError('Maximum 5 URLs allowed');
      Log('warn', 'component', 'Maximum URL fields reached (5)');
    }
  };

  // Remove a URL field
  const removeUrlField = (index: number) => {
    Log('debug', 'component', `Removing URL field at index ${index}`);
    const newFields = [...urlFields];
    newFields.splice(index, 1);
    setUrlFields(newFields);
  };

  // Handle input change
  const handleInputChange = (
    index: number, 
    field: keyof CreateUrlRequest, 
    value: string | number
  ) => {
    const newFields = [...urlFields];
    if (field === 'validity' && typeof value === 'string') {
      // Convert validity string to number or undefined if empty
      newFields[index] = { 
        ...newFields[index],
        [field]: value ? parseInt(value) : undefined 
      };
    } else if (field === 'url' || field === 'shortcode') {
      // Handle string fields
      newFields[index] = { 
        ...newFields[index],
        [field]: value as string 
      };
    }
    setUrlFields(newFields);
    Log('debug', 'component', `Updated ${field} for URL at index ${index}`);
  };

  // Validate URL 
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSuccessMsg('Copied to clipboard!');
        Log('info', 'component', 'URL copied to clipboard');
        setTimeout(() => setSuccessMsg(null), 3000);
      })
      .catch(err => {
        setError('Failed to copy: ' + err.message);
        Log('error', 'component', `Failed to copy to clipboard: ${err.message}`);
      });
  };

  // Submit the form to create shortened URLs
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);
    
    Log('info', 'component', 'Submitting URL shortener form');
    
    // Validate all URLs
    const invalidUrls = urlFields.filter(field => !isValidUrl(field.url));
    if (invalidUrls.length > 0) {
      setError('Please enter valid URLs');
      setIsLoading(false);
      Log('warn', 'component', 'Form submission failed: Invalid URLs');
      return;
    }
    
    try {
      const newResults: ShortUrlResult[] = [];
      
      // Process each URL sequentially
      for (const field of urlFields) {
        if (!field.url.trim()) continue;
        
        const response = await apiService.createShortUrl(field);
        
        newResults.push({
          originalUrl: field.url,
          shortLink: response.shortLink,
          expiry: response.expiry
        });
      }
      
      setResults(newResults);
      if (newResults.length > 0) {
        setSuccessMsg(`Successfully created ${newResults.length} shortened URL(s)`);
        setTimeout(() => setSuccessMsg(null), 5000);
      }
      Log('info', 'component', `Successfully created ${newResults.length} shortened URLs`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shortened URL(s)');
      Log('error', 'component', `Form submission error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        URL Shortener
      </Typography>
      <Typography variant="body1" paragraph align="center" color="text.secondary">
        Shorten up to 5 URLs at once. Custom shortcodes and validity durations are optional.
      </Typography>

      <Paper elevation={2} sx={{ padding: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          {urlFields.map((field, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                  <TextField
                    fullWidth
                    label="URL to shorten"
                    variant="outlined"
                    required
                    value={field.url}
                    onChange={(e) => handleInputChange(index, 'url', e.target.value)}
                    placeholder="https://example.com"
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '20%' } }}>
                  <TextField
                    fullWidth
                    label="Validity (minutes)"
                    variant="outlined"
                    type="number"
                    value={field.validity || ''}
                    onChange={(e) => handleInputChange(index, 'validity', e.target.value)}
                    placeholder="30"
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
                  <TextField
                    fullWidth
                    label="Custom shortcode (optional)"
                    variant="outlined"
                    value={field.shortcode || ''}
                    onChange={(e) => handleInputChange(index, 'shortcode', e.target.value)}
                    placeholder="abc123"
                  />
                </Box>
                {urlFields.length > 1 && (
                  <Box sx={{ width: { xs: '100%', sm: '5%' }, display: 'flex', justifyContent: 'center' }}>
                    <IconButton 
                      aria-label="delete" 
                      onClick={() => removeUrlField(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Stack>
              {index < urlFields.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addUrlField}
              disabled={urlFields.length >= 5}
              color="primary"
            >
              Add URL
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || urlFields.length === 0 || urlFields.every(f => !f.url.trim())}
            >
              {isLoading ? 'Processing...' : 'Shorten URLs'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Results Section */}
      {results.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Your Shortened URLs
          </Typography>
          <Stack spacing={2}>
            {results.map((result, index) => (
              <Card variant="outlined" key={index}>
                <CardContent>
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: 'bold' }}>
                    Original: {result.originalUrl}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      <Link href={result.shortLink} target="_blank" rel="noopener">
                        {result.shortLink}
                      </Link>
                    </Typography>
                    <Tooltip title="Copy to clipboard">
                      <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(result.shortLink)}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Expires: {new Date(result.expiry).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {/* Notifications */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!successMsg} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMsg(null)}
      >
        <Alert onClose={() => setSuccessMsg(null)} severity="success" sx={{ width: '100%' }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default URLShortenerPage;
