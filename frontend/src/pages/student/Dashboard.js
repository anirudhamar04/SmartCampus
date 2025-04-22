import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Divider, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  School as SchoolIcon, 
  Book as BookIcon, 
  Description as DescriptionIcon, 
  Event as EventIcon, 
  Notifications as NotificationsIcon 
} from '@mui/icons-material';
import { courseService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseService.getEnrolledCourses();
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Format date for display
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
          Student Dashboard
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Welcome, {currentUser?.name || 'Student'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's an overview of your academic information and resources.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Enrolled Courses Section */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">My Enrolled Courses</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              ) : courses.length === 0 ? (
                <Alert severity="info">You are not enrolled in any courses yet.</Alert>
              ) : (
                <Grid container spacing={2}>
                  {courses.map((course) => (
                    <Grid item xs={12} sm={6} key={course.id}>
                      <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="div">
                            {course.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {course.code} • {course.faculty}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                            {course.schedule || 'Schedule not available'}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            component={Link} 
                            to={`/student/courses/${course.id}/resources`}
                            startIcon={<DescriptionIcon />}
                          >
                            Resources
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>

          {/* Sidebar with Recent Activity */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Activity</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar><EventIcon /></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Upcoming Exam: Data Structures"
                    secondary={`Scheduled for ${formatDate(new Date())}`}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar><DescriptionIcon /></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="New Course Resource Added"
                    secondary="Lecture notes for Database Systems"
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar><BookIcon /></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Assignment Due Soon"
                    secondary={`Programming Assignment #3 due on ${formatDate(new Date())}`}
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button variant="text" color="primary">
                  View All Activities
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default StudentDashboard; 