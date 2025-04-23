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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        bgcolor: 'black', 
        color: 'white', 
        p: 3, 
        borderRadius: 2, 
        mb: 4,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Student Dashboard
        </Typography>
        
        <Typography variant="h5" gutterBottom>
          Welcome, {currentUser?.name || 'Student'}!
        </Typography>
        <Typography variant="body1" sx={{ color: 'zinc.400' }}>
          Here's an overview of your academic information and resources.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Enrolled Courses Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ 
            p: 3, 
            height: '100%',
            bgcolor: '#18181b', // zinc-900
            color: 'white',
            borderRadius: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon sx={{ mr: 1, color: '#d4d4d8' /* zinc-300 */ }} />
              <Typography variant="h6">My Enrolled Courses</Typography>
            </Box>
            <Divider sx={{ mb: 2, borderColor: '#3f3f46' /* zinc-700 */ }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress sx={{ color: '#d4d4d8' /* zinc-300 */ }} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            ) : courses.length === 0 ? (
              <Alert severity="info">You are not enrolled in any courses yet.</Alert>
            ) : (
              <Grid container spacing={2}>
                {courses.map((course) => (
                  <Grid item xs={12} sm={6} key={course.id}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      bgcolor: '#27272a', // zinc-800
                      color: 'white',
                      borderRadius: 2,
                      '&:hover': {
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                        transform: 'translateY(-4px)',
                        transition: 'all 0.3s ease'
                      }
                    }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div">
                          {course.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#a1a1aa' /* zinc-400 */ }} sx={{ mb: 1 }}>
                          {course.code} • {course.faculty}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mb: 1, color: '#a1a1aa' /* zinc-400 */ }}>
                          {course.schedule || 'Schedule not available'}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          component={Link} 
                          to={`/student/courses/${course.id}/resources`}
                          startIcon={<DescriptionIcon />}
                          sx={{ 
                            color: '#d4d4d8', // zinc-300
                            '&:hover': {
                              backgroundColor: 'rgba(212, 212, 216, 0.1)'
                            }
                          }}
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
              <Paper elevation={3} sx={{ 
                p: 3,
                bgcolor: '#18181b', // zinc-900
                color: 'white',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimelineIcon sx={{ mr: 1, color: '#d4d4d8' /* zinc-300 */ }} />
                  <Typography variant="h6">Attendance Overview</Typography>
                </Box>
                <Divider sx={{ mb: 2, borderColor: '#3f3f46' /* zinc-700 */ }} />
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                    <CircularProgress size={24} sx={{ color: '#d4d4d8' /* zinc-300 */ }} />
                  </Box>
                ) : attendanceData ? (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#a1a1aa' /* zinc-400 */ }} gutterBottom>
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
                            sx={{ 
                              height: 10, 
                              borderRadius: 5,
                              backgroundColor: '#3f3f46' // zinc-700 as background
                            }}
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
                      <Typography variant="body2" sx={{ color: '#a1a1aa' /* zinc-400 */ }}>
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
                      sx={{ 
                        mt: 1, 
                        borderColor: '#d4d4d8', // zinc-300
                        color: '#d4d4d8', // zinc-300
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(212, 212, 216, 0.1)'
                        }
                      }}
                    >
                      View Full Attendance
                    </Button>
                  </>
                ) : (
                  <Alert severity="info" sx={{ bgcolor: '#383838', color: '#d4d4d8' }}>
                    No attendance data available.
                  </Alert>
                )}
              </Paper>
            </Grid>
            
            {/* Notifications */}
            <Grid item>
              <Paper elevation={3} sx={{ 
                p: 3,
                bgcolor: '#18181b', // zinc-900
                color: 'white',
                borderRadius: 2 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Badge badgeContent={notifications.length} color="error" sx={{ mr: 1 }}>
                    <NotificationsIcon sx={{ color: '#d4d4d8' /* zinc-300 */ }} />
                  </Badge>
                  <Typography variant="h6">Recent Notifications</Typography>
                </Box>
                <Divider sx={{ mb: 2, borderColor: '#3f3f46' /* zinc-700 */ }} />
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                    <CircularProgress size={24} sx={{ color: '#d4d4d8' /* zinc-300 */ }} />
                  </Box>
                ) : notifications.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#a1a1aa' /* zinc-400 */ }} align="center">
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
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard; 