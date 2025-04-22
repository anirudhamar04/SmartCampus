import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  CircularProgress, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  IconButton,
  Chip,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { Download as DownloadIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { resourceService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useParams } from 'react-router-dom';

const CourseResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState('');
  const [resourceTypes, setResourceTypes] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  const { currentUser } = useAuth();
  const { courseId } = useParams();

  // Fetch resources based on filters
  const fetchResources = useCallback(async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      let response;
      if (selectedResourceType) {
        response = await resourceService.getByType(courseId, selectedResourceType);
      } else {
        response = await resourceService.getByCourse(courseId);
      }
      setResources(response.data);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to fetch resources');
      showSnackbar('Error loading resources', 'error');
    } finally {
      setLoading(false);
    }
  }, [courseId, selectedResourceType]);

  // Fetch resource types
  const fetchResourceTypes = async () => {
    try {
      const response = await resourceService.getResourceTypes();
      setResourceTypes(response.data);
    } catch (err) {
      console.error('Error fetching resource types:', err);
    }
  };

  // Handle resource download
  const handleDownload = async (resourceId) => {
    try {
      const response = await resourceService.download(resourceId);
      
      // Create a blob from the response data
      const blob = new Blob([response.data]);
      
      // Get the filename from the content-disposition header or use a default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) filename = filenameMatch[1];
      }
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSnackbar('Resource downloaded successfully', 'success');
    } catch (err) {
      console.error('Error downloading resource:', err);
      showSnackbar('Failed to download resource', 'error');
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  useEffect(() => {
    fetchResources();
    fetchResourceTypes();
  }, [fetchResources]);

  const getResourceIcon = (type) => {
    return <DescriptionIcon />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Course Resources
        </Typography>
        
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={selectedResourceType}
              onChange={(e) => setSelectedResourceType(e.target.value)}
              label="Filter by Type"
            >
              <MenuItem value="">
                <em>All Types</em>
              </MenuItem>
              {resourceTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : resources.length === 0 ? (
          <Alert severity="info">No resources available for this course.</Alert>
        ) : (
          <Grid container spacing={3}>
            {resources.map((resource) => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {getResourceIcon(resource.type)}
                      <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                        {resource.title}
                      </Typography>
                    </Box>
                    
                    <Chip 
                      label={resource.type} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary">
                      {resource.description || 'No description available'}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="caption" color="text.secondary">
                      Added on {formatDate(resource.createdAt || new Date())}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(resource.id)}
                      variant="contained"
                      size="small"
                      fullWidth
                    >
                      Download
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CourseResources; 