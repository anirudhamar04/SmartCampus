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
  // LinearProgress, // LinearProgress was imported but not used, can be removed if not needed elsewhere
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
import { courseService, notificationService, attendanceService } from '../../services/api'; // Assuming these paths are correct
import { useAuth } from '../../context/AuthContext'; // Assuming this path is correct

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
        setError(''); // Reset error on new fetch

        // Fetch courses
        const coursesResponse = await courseService.getMyCourses();
        setCourses(coursesResponse.data || []); // Ensure courses is always an array

        // Fetch notifications and attendance if user is logged in
        if (currentUser?.id) {
          try {
            const notificationsResponse = await notificationService.getUnread(currentUser.id);
            setNotifications(notificationsResponse.data || []); // Ensure notifications is always an array
          } catch (err) {
             console.error('Error fetching notifications:', err);
             // Optionally set a specific error for notifications
             // setError(prev => prev + ' Failed to load notifications.');
          }

          try {
            const attendanceResponse = await attendanceService.getOverallAttendancePercentage(currentUser.id);
            setAttendanceData(attendanceResponse.data);
          } catch (err) {
            console.error('Error fetching attendance:', err);
             // Optionally set a specific error for attendance
            // setError(prev => prev + ' Failed to load attendance.');
            setAttendanceData(null); // Ensure attendanceData is null on error
          }
        } else {
          // Handle case where user is not logged in but component mounts
          setNotifications([]);
          setAttendanceData(null);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setCourses([]); // Reset data on error
        setNotifications([]);
        setAttendanceData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]); // Dependency array includes currentUser

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Date unavailable';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid date';
    }
  };

  // Get status color based on percentage
  const getStatusColor = (percentage) => {
    if (percentage == null || isNaN(percentage)) return palette.text.secondary; // Default color if no data
    if (percentage >= 75) return '#10b981'; // green
    if (percentage >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  // Get notification icon by category
  const getNotificationIcon = (category) => {
    switch (String(category).toUpperCase()) { // Normalize category
      case 'COURSE':
        return <BookIcon fontSize="small" />;
      case 'EVENT':
        return <EventIcon fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  // Helper function to format the schedule
  const formatSchedule = (scheduleData) => {
    if (!scheduleData) {
      return null; // No schedule provided
    }

    let parsedSchedule = scheduleData;

    // Attempt to parse if it's a string that looks like JSON
    if (typeof parsedSchedule === 'string') {
      try {
        // Basic check if it looks like JSON object
        if (parsedSchedule.trim().startsWith('{') && parsedSchedule.trim().endsWith('}')) {
           parsedSchedule = JSON.parse(parsedSchedule);
        } else {
            // If it's a plain string, return it as is
            return parsedSchedule;
        }
      } catch (e) {
        console.warn("Failed to parse schedule string:", scheduleData, e);
        // If parsing fails, return the original string as a fallback
        return scheduleData;
      }
    }

    // Check if we have the expected object structure
    if (typeof parsedSchedule === 'object' && parsedSchedule !== null && Array.isArray(parsedSchedule.days) && typeof parsedSchedule.time === 'string') {
      const daysString = parsedSchedule.days.join(', ');
      return `${daysString} ${parsedSchedule.time}`;
    }

    // If it's some other format we don't recognize, try converting to string
    if (typeof parsedSchedule === 'object' && parsedSchedule !== null) {
        try {
            return JSON.stringify(parsedSchedule); // Fallback for unexpected objects
        } catch (e) {
             return 'Invalid schedule format';
        }
    }

    // If it's already a non-JSON string or something else, return it
    return String(scheduleData);
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
            p: 0, // Padding is applied inside the elements
            height: '100%',
            bgcolor: 'transparent', // Inherit background from parent grid container if needed
            color: palette.text.primary,
            borderRadius: 3,
            overflow: 'hidden' // Prevent content spillover
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
              px: 1 // Add some horizontal padding for the header
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
                to="/student/courses" // Make sure this route exists in your router setup
                sx={{
                  color: palette.accent.light,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)' }
                }}
              >
                View all
              </Button>
            </Box>

            {loading && !error ? ( // Show loader only if loading and no error
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress sx={{ color: palette.accent.light }} />
              </Box>
            ) : error ? (
              <Alert
                severity="error"
                sx={{
                  m: 1, // Add margin instead of padding 0 on parent
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
                  p: { xs: 3, sm: 6 }, // Responsive padding
                  m: 1, // Add margin
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
                  You are not enrolled in any courses yet.
                </Typography>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/student/courses/browse" // Make sure this route exists
                  sx={{
                    borderColor: palette.accent.main,
                    color: palette.accent.main,
                    textTransform: 'none',
                    '&:hover': { borderColor: palette.accent.light, bgcolor: 'rgba(99, 102, 241, 0.08)' }
                  }}
                >
                  Browse Available Courses
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3} sx={{ px: 1 }}> {/* Add padding to grid container */}
                {courses.map((course) => {
                   // Format the schedule for display *inside* the map
                   const displaySchedule = formatSchedule(course.schedule);

                   return (
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
                          boxShadow: `0 8px 25px -5px ${palette.accent.main}33`, // Subtle glow
                          transform: 'translateY(-4px)',
                          borderColor: palette.accent.main,
                        }
                      }}>
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          {/* Course code chip */}
                          <Chip
                            label={course.code || 'N/A'} // Fallback for code
                            size="small"
                            sx={{
                              mb: 2,
                              bgcolor: 'rgba(99, 102, 241, 0.1)',
                              color: palette.accent.light,
                              fontWeight: 'medium'
                            }}
                          />

                          <Typography variant="h6" component="div" fontWeight="bold" gutterBottom noWrap title={course.name}>
                            {course.name || 'Unnamed Course'} {/* Fallback for name */}
                          </Typography>

                          <Typography variant="body2" sx={{ color: palette.text.secondary, mb: 2 }}>
                            {course.faculty || 'Faculty not specified'} {/* Fallback for faculty */}
                          </Typography>

                          {/* MODIFIED SCHEDULE DISPLAY */}
                          {displaySchedule && ( // Only render if displaySchedule is not null/empty
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: palette.text.secondary }} />
                              <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                                {displaySchedule}
                              </Typography>
                            </Box>
                          )}
                          {/* END MODIFIED SCHEDULE DISPLAY */}

                        </CardContent>

                        <Divider sx={{ borderColor: palette.divider }} />

                        <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                          <Button
                            size="small"
                            component={Link}
                            to={`/student/courses/${course.id}`} // Make sure this route exists
                            sx={{
                              color: palette.text.secondary,
                              textTransform: 'none',
                              '&:hover': {
                                color: palette.text.primary,
                                bgcolor: 'rgba(255, 255, 255, 0.05)' // Slight background on hover
                              }
                            }}
                          >
                            View Details
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            component={Link}
                            to={`/student/courses/${course.id}/resources`} // Make sure this route exists
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
                   );
                })}
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
                            color: palette.divider, // Background track
                            position: 'absolute'
                          }}
                        />
                        <CircularProgress
                          variant="determinate"
                           // Ensure value is between 0 and 100
                          value={Math.max(0, Math.min(attendanceData.percentage || 0, 100))}
                          size={120}
                          thickness={4}
                          sx={{
                            color: getStatusColor(attendanceData.percentage),
                            position: 'absolute',
                            transition: 'color 0.3s ease, transform 0.5s ease-out' // Smooth animation
                          }}
                        />
                        <Typography
                          variant="h4"
                          component="div"
                          fontWeight="bold"
                          sx={{ color: getStatusColor(attendanceData.percentage) }}
                        >
                          {/* Handle potential NaN or null */}
                          {attendanceData.percentage != null ? `${Math.round(attendanceData.percentage)}%` : 'N/A'}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ color: palette.text.secondary, textAlign: 'center' }}>
                        Overall Attendance Rate
                      </Typography>
                    </Box>

                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-around', // Better spacing
                      p: 2,
                      bgcolor: palette.background.card,
                      borderRadius: 2,
                      mb: 3
                    }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">
                          {attendanceData.attendedClasses ?? '0'} {/* Nullish coalescing */}
                        </Typography>
                        <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                          Classes Attended
                        </Typography>
                      </Box>
                      <Divider orientation="vertical" flexItem sx={{ borderColor: palette.divider, mx: 1 }} />
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">
                          {attendanceData.totalClasses ?? '0'} {/* Nullish coalescing */}
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
                      to="/student/attendance" // Make sure this route exists
                      sx={{
                        borderColor: palette.divider,
                        color: palette.text.primary,
                        borderRadius: 2,
                        py: 1,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: palette.accent.main,
                          bgcolor: 'rgba(99, 102, 241, 0.08)',
                          color: palette.accent.light // Change text color on hover too
                        }
                      }}
                    >
                      View Full Attendance Details
                    </Button>
                  </>
                ) : (
                  <Alert
                    severity="info"
                    icon={<TimelineIcon fontSize="inherit" />} // Use the section icon
                    sx={{
                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                      color: '#60a5fa', // Lighter blue for info
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
                      max={99} // Set a max count for the badge
                      sx={{
                        mr: 1.5,
                        '& .MuiBadge-badge': {
                          bgcolor: '#ef4444', // Red badge background
                          color: 'white'
                        }
                      }}
                    >
                      <NotificationsIcon sx={{ color: palette.accent.light }} />
                    </Badge>
                    <Typography variant="h6" fontWeight="medium">Notifications</Typography>
                  </Box>

                  {/* Consider adding functionality to this button later */}
                  {notifications.length > 0 && (
                    <Button
                      size="small"
                      disabled // Disable for now if no functionality
                      sx={{
                        color: palette.accent.light,
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)' },
                        '&.Mui-disabled': { color: palette.text.secondary } // Style for disabled
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
                      No new notifications.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <List sx={{ p: 0, maxHeight: 300, overflowY: 'auto' }}> {/* Limit height and allow scroll */}
                      {notifications.slice(0, 3).map((notification, index) => (
                        <React.Fragment key={notification.id || index}> {/* Fallback key */}
                          <ListItem
                            alignItems="flex-start"
                            button // Make list item interactive (optional)
                            // component={Link} // Optionally link the notification
                            // to={`/notifications/${notification.id}`} // Example link target
                            sx={{
                              px: 0,
                              py: 2,
                              borderRadius: 1,
                              transition: 'background-color 0.2s ease',
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
                                <Typography variant="body1" fontWeight="medium" component="span"> {/* Use span */}
                                  {notification.title || 'Notification'} {/* Fallback title */}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography
                                    variant="body2"
                                    component="span" // Use span
                                    sx={{
                                      color: palette.text.secondary,
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2, // Limit to 2 lines
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis', // Add ellipsis
                                      mb: 1,
                                      lineHeight: 1.4 // Adjust line height
                                    }}
                                  >
                                    {notification.message || 'No details provided.'} {/* Fallback message */}
                                  </Typography>
                                  <Typography variant="caption" display="block" sx={{ color: palette.text.secondary, mt: 0.5 }}> {/* Ensure block display */}
                                    {formatDate(notification.date || notification.createdAt)} {/* Use createdAt if date unavailable */}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                          {/* Divider only between items, not after the last one */}
                          {index < Math.min(notifications.length, 3) - 1 && (
                             <Divider component="li" sx={{ borderColor: palette.divider, mx: 1 }} /> // Indent divider slightly
                          )}
                        </React.Fragment>
                      ))}
                    </List>

                    {notifications.length > 3 && (
                      <Box sx={{ textAlign: 'center', mt: 2, pt: 1, borderTop: `1px solid ${palette.divider}` }}> {/* Add separator */}
                        <Button
                          variant="text"
                          size="small"
                          component={Link}
                          to="/student/notifications" // Make sure this route exists
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