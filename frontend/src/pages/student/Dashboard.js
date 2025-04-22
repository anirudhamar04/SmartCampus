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
  Alert,
  Badge,
  LinearProgress
} from '@mui/material';
import { 
  School as SchoolIcon, 
  Book as BookIcon, 
  Description as DescriptionIcon, 
  Event as EventIcon, 
  Notifications as NotificationsIcon,
  Timeline as TimelineIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { courseService, notificationService, attendanceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch courses
        const coursesResponse = await courseService.getMyCourses();
        setCourses(coursesResponse.data);
        
        // Fetch notifications if user is logged in
        if (currentUser?.id) {
          const notificationsResponse = await notificationService.getUnread(currentUser.id);
          setNotifications(notificationsResponse.data || []);
          
          // Fetch overall attendance
          try {
            const attendanceResponse = await attendanceService.getOverallAttendancePercentage(currentUser.id);
            setAttendanceData(attendanceResponse.data);
          } catch (err) {
            console.error('Error fetching attendance:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color based on percentage
  const getStatusColor = (percentage) => {
    if (percentage >= 75) return 'success.main';
    if (percentage >= 60) return 'warning.main';
    return 'error.main';
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

          {/* Sidebar with Recent Activity and Attendance */}
          <Grid item xs={12} md={4}>
            <Grid container direction="column" spacing={3}>
              {/* Attendance Overview */}
              <Grid item>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimelineIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Attendance Overview</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : attendanceData ? (
                    <>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Overall Attendance
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(attendanceData.percentage, 100)} 
                              color={
                                attendanceData.percentage >= 75 ? "success" : 
                                attendanceData.percentage >= 60 ? "warning" : "error"
                              }
                              sx={{ height: 10, borderRadius: 5 }}
                            />
                          </Box>
                          <Typography 
                            variant="h6" 
                            color={getStatusColor(attendanceData.percentage)}
                            sx={{ fontWeight: 'bold' }}
                          >
                            {attendanceData.percentage.toFixed(2)}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Classes Attended
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {attendanceData.attendedClasses} / {attendanceData.totalClasses}
                        </Typography>
                      </Box>
                      
                      <Button 
                        fullWidth 
                        variant="outlined" 
                        startIcon={<AccessTimeIcon />}
                        component={Link}
                        to="/student/attendance"
                        sx={{ mt: 1 }}
                      >
                        View Full Attendance
                      </Button>
                    </>
                  ) : (
                    <Alert severity="info">No attendance data available.</Alert>
                  )}
                </Paper>
              </Grid>
              
              {/* Notifications */}
              <Grid item>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Badge badgeContent={notifications.length} color="error" sx={{ mr: 1 }}>
                      <NotificationsIcon color="primary" />
                    </Badge>
                    <Typography variant="h6">Recent Notifications</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : notifications.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center">
                      No new notifications
                    </Typography>
                  ) : (
                    <List>
                      {notifications.slice(0, 3).map((notification) => (
                        <ListItem key={notification.id} alignItems="flex-start" sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar>
                              {notification.category === 'COURSE' ? <BookIcon /> : 
                               notification.category === 'EVENT' ? <EventIcon /> : 
                               <NotificationsIcon />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={notification.title}
                            secondary={notification.message}
                            secondaryTypographyProps={{ noWrap: true }}
                          />
                        </ListItem>
                      ))}
                      
                      {notifications.length > 3 && (
                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                          <Button size="small" color="primary">
                            View {notifications.length - 3} more
                          </Button>
                        </Box>
                      )}
                    </List>
                  )}
                </Paper>
              </Grid>
              
              {/* Recent Activity */}
              <Grid item>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EventIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Upcoming Events</Typography>
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
                        <Avatar><BookIcon /></Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Assignment Due Soon"
                        secondary={`Programming Assignment #3 due on ${formatDate(new Date())}`}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default StudentDashboard; 