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
  LinearProgress,
  Chip
} from '@mui/material';
import { 
  School as SchoolIcon, 
  Book as BookIcon, 
  Description as DescriptionIcon, 
  Event as EventIcon, 
  Notifications as NotificationsIcon,
  Timeline as TimelineIcon,
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { courseService, notificationService, attendanceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Custom theme palette for consistent colors
const palette = {
  background: {
    dark: '#121214',    // Almost black
    main: '#18181b',    // Dark background
    card: '#27272a',    // Card background
  },
  divider: '#3f3f46',   // Divider color
  text: {
    primary: '#ffffff', // White text
    secondary: '#a1a1aa' // Secondary text
  },
  accent: {
    main: '#6366f1',    // Indigo accent
    light: '#818cf8'    // Light indigo
  }
};

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
    if (percentage >= 75) return '#10b981'; // green
    if (percentage >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  // Get notification icon by category
  const getNotificationIcon = (category) => {
    switch (category) {
      case 'COURSE':
        return <BookIcon fontSize="small" />;
      case 'EVENT':
        return <EventIcon fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ 
      py: 4, 
      minHeight: '100vh',
      bgcolor: palette.background.dark,
      color: palette.text.primary
    }}>
      {/* Header Section */}
      <Box sx={{ 
        bgcolor: palette.accent.main, 
        backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        color: 'white', 
        p: 4, 
        borderRadius: 3, 
        mb: 4,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Student Dashboard
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
          Welcome back, {currentUser?.name || 'Student'}!
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.7 }}>
          Here's your academic progress and latest updates
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content - Enrolled Courses */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ 
            p: 0, 
            height: '100%',
            bgcolor: 'transparent',
            color: palette.text.primary,
            borderRadius: 3,
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 3,
              px: 1 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1.5, color: palette.accent.light }} />
                <Typography variant="h5" fontWeight="medium">My Courses</Typography>
              </Box>
              <Button 
                variant="text" 
                size="small" 
                endIcon={<ArrowForwardIcon />}
                component={Link} 
                to="/student/courses"
                sx={{ 
                  color: palette.accent.light,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)' }
                }}
              >
                View all
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress sx={{ color: palette.accent.light }} />
              </Box>
            ) : error ? (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2, 
                  bgcolor: 'rgba(239, 68, 68, 0.1)', 
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 2
                }}
              >
                {error}
              </Alert>
            ) : courses.length === 0 ? (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  p: 6, 
                  bgcolor: palette.background.main,
                  borderRadius: 3,
                  border: `1px solid ${palette.divider}`
                }}
              >
                <BookIcon sx={{ fontSize: 60, color: palette.text.secondary, opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ color: palette.text.secondary }}>
                  No Enrolled Courses
                </Typography>
                <Typography variant="body2" sx={{ color: palette.text.secondary, mb: 3 }}>
                  You are not enrolled in any courses yet
                </Typography>
                <Button 
                  variant="outlined"
                  component={Link}
                  to="/student/courses/browse"
                  sx={{ 
                    borderColor: palette.accent.main,
                    color: palette.accent.main,
                    '&:hover': { borderColor: palette.accent.light, bgcolor: 'rgba(99, 102, 241, 0.08)' }
                  }}
                >
                  Browse Available Courses
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {courses.map((course) => (
                  <Grid item xs={12} sm={6} key={course.id}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      bgcolor: palette.background.main,
                      color: palette.text.primary,
                      borderRadius: 3,
                      border: `1px solid ${palette.divider}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-4px)',
                        borderColor: palette.accent.main,
                      }
                    }}>
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        {/* Course code chip */}
                        <Chip 
                          label={course.code} 
                          size="small" 
                          sx={{ 
                            mb: 2, 
                            bgcolor: 'rgba(99, 102, 241, 0.1)', 
                            color: palette.accent.light,
                            fontWeight: 'medium'
                          }} 
                        />
                        
                        <Typography variant="h6" component="div" fontWeight="bold" gutterBottom>
                          {course.name}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ color: palette.text.secondary, mb: 2 }}>
                          {course.faculty}
                        </Typography>
                        
                        {course.schedule && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: palette.text.secondary }} />
                            <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                              {course.schedule}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                      
                      <Divider sx={{ borderColor: palette.divider }} />
                      
                      <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                        <Button 
                          size="small" 
                          component={Link} 
                          to={`/student/courses/${course.id}`}
                          sx={{ 
                            color: palette.text.secondary,
                            textTransform: 'none',
                            '&:hover': {
                              color: palette.text.primary,
                            }
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          component={Link} 
                          to={`/student/courses/${course.id}/resources`}
                          startIcon={<DescriptionIcon />}
                          sx={{ 
                            bgcolor: palette.accent.main,
                            '&:hover': {
                              bgcolor: palette.accent.light,
                            },
                            textTransform: 'none',
                            boxShadow: 'none'
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

        {/* Sidebar - Attendance and Notifications */}
        <Grid item xs={12} md={4}>
          <Grid container direction="column" spacing={4}>
            {/* Attendance Overview */}
            <Grid item>
              <Paper elevation={0} sx={{ 
                p: 3,
                bgcolor: palette.background.main,
                color: palette.text.primary,
                borderRadius: 3,
                border: `1px solid ${palette.divider}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <TimelineIcon sx={{ mr: 1.5, color: palette.accent.light }} />
                  <Typography variant="h6" fontWeight="medium">Attendance</Typography>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={30} sx={{ color: palette.accent.light }} />
                  </Box>
                ) : attendanceData ? (
                  <>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexDirection: 'column',
                      mb: 3,
                      position: 'relative'
                    }}>
                      {/* Large circular progress indicator */}
                      <Box 
                        sx={{ 
                          position: 'relative', 
                          width: 120, 
                          height: 120, 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}
                      >
                        <CircularProgress 
                          variant="determinate" 
                          value={100} 
                          size={120}
                          thickness={4}
                          sx={{ 
                            color: palette.divider,
                            position: 'absolute'
                          }}
                        />
                        <CircularProgress 
                          variant="determinate" 
                          value={Math.min(attendanceData.percentage, 100)} 
                          size={120}
                          thickness={4}
                          sx={{ 
                            color: getStatusColor(attendanceData.percentage),
                            position: 'absolute'
                          }}
                        />
                        <Typography 
                          variant="h4" 
                          component="div" 
                          fontWeight="bold"
                          sx={{ color: getStatusColor(attendanceData.percentage) }}
                        >
                          {Math.round(attendanceData.percentage)}%
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: palette.text.secondary, textAlign: 'center' }}>
                        Overall Attendance Rate
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 2, 
                      bgcolor: palette.background.card,
                      borderRadius: 2,
                      mb: 3
                    }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">
                          {attendanceData.attendedClasses}
                        </Typography>
                        <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                          Classes Attended
                        </Typography>
                      </Box>
                      <Divider orientation="vertical" flexItem sx={{ borderColor: palette.divider }} />
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">
                          {attendanceData.totalClasses}
                        </Typography>
                        <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                          Total Classes
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      endIcon={<ArrowForwardIcon />}
                      component={Link}
                      to="/student/attendance"
                      sx={{ 
                        borderColor: palette.divider,
                        color: palette.text.primary,
                        borderRadius: 2,
                        py: 1,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: palette.accent.main,
                          bgcolor: 'rgba(99, 102, 241, 0.08)'
                        }
                      }}
                    >
                      View Full Attendance Details
                    </Button>
                  </>
                ) : (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      bgcolor: 'rgba(59, 130, 246, 0.1)', 
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: 2 
                    }}
                  >
                    No attendance data available yet.
                  </Alert>
                )}
              </Paper>
            </Grid>
            
            {/* Notifications */}
            <Grid item>
              <Paper elevation={0} sx={{ 
                p: 3,
                bgcolor: palette.background.main,
                color: palette.text.primary,
                borderRadius: 3,
                border: `1px solid ${palette.divider}`
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 3 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Badge 
                      badgeContent={notifications.length} 
                      color="error" 
                      sx={{ 
                        mr: 1.5,
                        '& .MuiBadge-badge': {
                          bgcolor: '#ef4444',
                          color: 'white'
                        }
                      }}
                    >
                      <NotificationsIcon sx={{ color: palette.accent.light }} />
                    </Badge>
                    <Typography variant="h6" fontWeight="medium">Notifications</Typography>
                  </Box>
                  
                  {notifications.length > 0 && (
                    <Button 
                      size="small" 
                      sx={{ 
                        color: palette.accent.light,
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)' }
                      }}
                    >
                      Mark all read
                    </Button>
                  )}
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={30} sx={{ color: palette.accent.light }} />
                  </Box>
                ) : notifications.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 4, 
                    bgcolor: palette.background.card,
                    borderRadius: 2
                  }}>
                    <NotificationsIcon sx={{ fontSize: 40, color: palette.text.secondary, opacity: 0.3, mb: 2 }} />
                    <Typography variant="body1" sx={{ color: palette.text.secondary }}>
                      You're all caught up!
                    </Typography>
                    <Typography variant="body2" sx={{ color: palette.text.secondary }}>
                      No new notifications
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <List sx={{ p: 0 }}>
                      {notifications.slice(0, 3).map((notification, index) => (
                        <React.Fragment key={notification.id}>
                          <ListItem 
                            alignItems="flex-start" 
                            sx={{ 
                              px: 0, 
                              py: 2, 
                              borderRadius: 1,
                              '&:hover': { bgcolor: palette.background.card }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ 
                                bgcolor: 'rgba(99, 102, 241, 0.1)', 
                                color: palette.accent.light 
                              }}>
                                {getNotificationIcon(notification.category)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight="medium" gutterBottom>
                                  {notification.title}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography 
                                    variant="body2" 
                                    component="span"
                                    sx={{ 
                                      color: palette.text.secondary,
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      mb: 1
                                    }}
                                  >
                                    {notification.message}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                                    {notification.date ? formatDate(notification.date) : 'Just now'}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                          {index < notifications.slice(0, 3).length - 1 && (
                            <Divider sx={{ borderColor: palette.divider }} />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                    
                    {notifications.length > 3 && (
                      <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button 
                          variant="text"
                          size="small" 
                          component={Link}
                          to="/student/notifications"
                          endIcon={<ArrowForwardIcon />}
                          sx={{ 
                            color: palette.accent.light,
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)' }
                          }}
                        >
                          View all {notifications.length} notifications
                        </Button>
                      </Box>
                    )}
                  </>
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