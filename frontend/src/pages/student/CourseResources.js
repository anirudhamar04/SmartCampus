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
  Snackbar,
  Badge
} from '@mui/material';
import { 
  Download as DownloadIcon, 
  Description as DescriptionIcon, 
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { resourceService, notificationService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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
  const [notifications, setNotifications] = useState([]);
  
  const { currentUser } = useAuth();
  const { courseId } = useParams();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      const response = await notificationService.getUnread(currentUser.id);
      setNotifications(response.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [currentUser]);

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
  const handleDownload = async (resourceId, resourceTitle) => {
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
      
      showSnackbar(`Resource "${resourceTitle}" downloaded successfully`, 'success');
      
      // Refresh notifications after download
      fetchNotifications();
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
    fetchNotifications();
  }, [fetchResources, fetchNotifications]);

  const getResourceIcon = (type) => {
    return <DescriptionIcon sx={{ color: '#d4d4d8' }} />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Find course resource notifications
  const getResourceNotifications = () => {
    return notifications.filter(n => 
      n.category === 'RESOURCE' && 
      n.metadata && 
      n.metadata.courseId === courseId);
  };

  const resourceNotifications = getResourceNotifications();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        bgcolor: 'black', 
        color: 'white', 
        p: 3, 
        borderRadius: 2, 
        mb: 4,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Course Resources
          </Typography>
          
          <Badge badgeContent={resourceNotifications.length} color="error">
            <NotificationsIcon sx={{ color: '#d4d4d8' }} />
          </Badge>
        </Box>

        <Typography variant="body1" sx={{ color: '#a1a1aa', mt: 1 }}>
          Access study materials, lecture notes, and assignments
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <FormControl variant="outlined" sx={{ 
          minWidth: 200,
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': {
              borderColor: '#3f3f46',
            },
            '&:hover fieldset': {
              borderColor: '#d4d4d8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#d4d4d8',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#a1a1aa',
          },
          '& .MuiSelect-icon': {
            color: '#a1a1aa',
          },
        }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={selectedResourceType}
            onChange={(e) => setSelectedResourceType(e.target.value)}
            label="Filter by Type"
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#18181b',
                  color: 'white',
                  '& .MuiMenuItem-root': {
                    '&:hover': {
                      bgcolor: '#27272a',
                    },
                    '&.Mui-selected': {
                      bgcolor: '#3f3f46',
                    },
                  },
                }
              }
            }}
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
          <CircularProgress sx={{ color: '#d4d4d8' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ bgcolor: '#7f1d1d', color: '#fecaca', border: '1px solid #b91c1c' }}>
          {error}
        </Alert>
      ) : resources.length === 0 ? (
        <Alert severity="info" sx={{ bgcolor: '#0f172a', color: '#bfdbfe', border: '1px solid #1e3a8a' }}>
          No resources available for this course.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {resources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: '#18181b',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s ease'
                }
              }}>
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
                    variant="outlined"
                    sx={{ 
                      mb: 2,
                      bgcolor: '#27272a',
                      color: '#d4d4d8',
                      borderColor: '#3f3f46'
                    }}
                  />
                  
                  <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                    {resource.description || 'No description available'}
                  </Typography>
                  
                  <Divider sx={{ my: 2, borderColor: '#3f3f46' }} />
                  
                  <Typography variant="caption" sx={{ color: '#71717a' }}>
                    Added on {formatDate(resource.createdAt || new Date())}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(resource.id, resource.title)}
                    variant="contained"
                    size="small"
                    fullWidth
                    sx={{ 
                      bgcolor: '#27272a',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#3f3f46'
                      }
                    }}
                  >
                    Download
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CourseResources; 