import React, { useState, useEffect } from 'react';
import { userService, courseService, facilityService } from '../../services/api';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    users: { total: 0, students: 0, teachers: 0, admins: 0, activeLastWeek: 0 },
    courses: { total: 0, active: 0, upcoming: 0, completed: 0, avgEnrollment: 0 },
    facilities: { total: 0, available: 0, booked: 0, maintenance: 0, avgUsage: 0 },
    enrollments: { total: 0, thisMonth: 0, lastMonth: 0 },
    bookings: { total: 0, thisMonth: 0, lastMonth: 0 }
  });
  const [timeframe, setTimeframe] = useState('MONTH');
  const [courseDistribution, setCourseDistribution] = useState([]);
  const [facilityUsage, setFacilityUsage] = useState([]);
  const [enrollmentTrends, setEnrollmentTrends] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch user statistics
      const usersResponse = await userService.getAll();
      const users = usersResponse.data || [];
      
      const studentCount = users.filter(user => user.role === 'STUDENT').length;
      const teacherCount = users.filter(user => user.role === 'TEACHER').length;
      const adminCount = users.filter(user => user.role === 'ADMIN').length;
      
      // Fetch course statistics
      const coursesResponse = await courseService.getAll();
      const courses = coursesResponse.data || [];
      
      const now = new Date();
      const activeCount = courses.filter(course => {
        const startDate = new Date(course.startDate);
        const endDate = new Date(course.endDate);
        return startDate <= now && endDate >= now;
      }).length;
      
      const upcomingCount = courses.filter(course => {
        const startDate = new Date(course.startDate);
        return startDate > now;
      }).length;
      
      const completedCount = courses.filter(course => {
        const endDate = new Date(course.endDate);
        return endDate < now;
      }).length;
      
      // Calculate average enrollment per course
      let totalEnrollment = 0;
      courses.forEach(course => {
        totalEnrollment += course.enrollmentCount || 0;
      });
      const avgEnrollment = courses.length ? (totalEnrollment / courses.length).toFixed(1) : 0;
      
      // Fetch facility statistics
      const facilitiesResponse = await facilityService.getAllFacilities();
      const facilities = facilitiesResponse.data || [];
      
      const availableCount = facilities.filter(f => f.status === 'AVAILABLE').length;
      const bookedCount = facilities.filter(f => f.status === 'BOOKED').length;
      const maintenanceCount = facilities.filter(f => f.status === 'MAINTENANCE').length;
      
      // Fetch booking statistics
      const bookingsResponse = await facilityService.getBookings();
      const bookings = bookingsResponse.data || [];
      
      // Calculate facility usage
      const facilityUsageData = facilities
        .filter(f => f.id) // Ensure we have valid facilities
        .map(facility => {
          const facilityBookings = bookings.filter(b => b.facilityId === facility.id).length;
          return {
            name: facility.name,
            bookings: facilityBookings,
            utilization: facilityBookings > 0 ? (facilityBookings / bookings.length * 100).toFixed(1) : 0
          };
        })
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5); // Top 5 facilities by usage
      
      // Calculate course distribution by department
      const departments = {};
      courses.forEach(course => {
        const dept = course.department || 'Uncategorized';
        if (!departments[dept]) {
          departments[dept] = 0;
        }
        departments[dept]++;
      });
      
      const courseDistributionData = Object.entries(departments)
        .map(([name, count]) => ({
          name,
          count,
          percentage: (count / courses.length * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count);
      
      // Mock enrollment trends data (would be replaced with real API data)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      
      const enrollmentTrendsData = months.map((month, index) => {
        // Simulate a trend with higher enrollments during semester starts (Jan, Aug)
        let baseValue = Math.floor(Math.random() * 50) + 20;
        if (index === 0 || index === 7) {
          baseValue += 100; // Boost January and August
        }
        
        return {
          month,
          enrollments: baseValue,
          isCurrentMonth: index === currentMonth
        };
      });
      
      // Get this month's and last month's statistics
      const thisMonth = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
      const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      
      const thisMonthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        return bookingDate >= thisMonthStart;
      }).length;
      
      const lastMonthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        return bookingDate >= lastMonthStart && bookingDate < thisMonthStart;
      }).length;
      
      // Mock enrollment counts by month (would be replaced with real API data)
      const thisMonthEnrollments = enrollmentTrendsData[currentMonth].enrollments;
      const lastMonthEnrollments = enrollmentTrendsData[currentMonth === 0 ? 11 : currentMonth - 1].enrollments;
      
      // Calculate active users in the last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      // This would ideally be an API call, but we're simulating it
      const activeLastWeek = Math.floor(users.length * 0.6); // Assuming 60% of users were active in the last week
      
      // Update state with all the data
      setStats({
        users: {
          total: users.length,
          students: studentCount,
          teachers: teacherCount,
          admins: adminCount,
          activeLastWeek
        },
        courses: {
          total: courses.length,
          active: activeCount,
          upcoming: upcomingCount,
          completed: completedCount,
          avgEnrollment
        },
        facilities: {
          total: facilities.length,
          available: availableCount,
          booked: bookedCount,
          maintenance: maintenanceCount,
          avgUsage: bookings.length > 0 ? (bookings.length / facilities.length).toFixed(1) : 0
        },
        enrollments: {
          total: totalEnrollment,
          thisMonth: thisMonthEnrollments,
          lastMonth: lastMonthEnrollments
        },
        bookings: {
          total: bookings.length,
          thisMonth: thisMonthBookings,
          lastMonth: lastMonthBookings
        }
      });
      
      setCourseDistribution(courseDistributionData);
      setFacilityUsage(facilityUsageData);
      setEnrollmentTrends(enrollmentTrendsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again later.');
      setLoading(false);
    }
  };

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  const renderBarChart = (data, valueKey, labelKey, colorClass = "bg-blue-500") => {
    const maxValue = Math.max(...data.map(item => parseFloat(item[valueKey])));
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-primary-300">{item[labelKey]}</span>
              <span className="text-primary-300">{item[valueKey]}</span>
            </div>
            <div className="w-full bg-primary-900 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${colorClass}`}
                style={{ width: `${(parseFloat(item[valueKey]) / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTrendChart = (data) => {
    const maxValue = Math.max(...data.map(item => item.enrollments));
    const chartHeight = 150;
    
    return (
      <div className="relative h-[200px]">
        <div className="flex h-[150px] items-end space-x-2">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center flex-1"
            >
              <div 
                className={`w-full ${item.isCurrentMonth ? 'bg-green-600' : 'bg-blue-600'} rounded-t`}
                style={{ 
                  height: `${(item.enrollments / maxValue) * chartHeight}px`
                }}
              ></div>
              <span className="text-primary-400 text-xs mt-2">{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, subtitle, icon, trend, trendValue, trendUp }) => (
    <div className="card p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-primary-400 text-sm font-medium mb-1">{title}</h3>
          <p className="text-3xl font-semibold text-primary-100">{value}</p>
          {subtitle && <p className="text-primary-300 text-sm mt-1">{subtitle}</p>}
          
          {trend && (
            <div className="flex items-center mt-2">
              {trendUp ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.69a.75.75 0 001.5 0v-5.69l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.53 14.03a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V8.25a.75.75 0 00-1.5 0v5.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3z" clipRule="evenodd" />
                </svg>
              )}
              <span className={`text-xs ml-1 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {trendValue}% from last month
              </span>
            </div>
          )}
        </div>
        
        <div className="rounded-full p-3 bg-primary-700/50 text-primary-200">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary-100">Campus Analytics</h1>
        
        <div className="flex space-x-2">
          <select
            className="p-2 bg-primary-800 border border-primary-700 rounded-lg"
            value={timeframe}
            onChange={handleTimeframeChange}
          >
            <option value="WEEK">Last Week</option>
            <option value="MONTH">Last Month</option>
            <option value="SEMESTER">This Semester</option>
            <option value="YEAR">This Year</option>
          </select>
          
          <button
            onClick={fetchAnalyticsData}
            className="p-2 bg-primary-700 text-primary-300 rounded-lg hover:bg-primary-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-300"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : (
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Students"
              value={stats.users.students}
              subtitle={`${stats.users.activeLastWeek} active in last 7 days`}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
                  <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
                </svg>
              }
            />
            
            <StatCard
              title="Active Courses"
              value={stats.courses.active}
              subtitle={`${stats.courses.upcoming} upcoming`}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                  <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clipRule="evenodd" />
                </svg>
              }
            />
            
            <StatCard
              title="Total Enrollments"
              value={stats.enrollments.total}
              subtitle={`${stats.courses.avgEnrollment} students per course`}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                </svg>
              }
              trend={true}
              trendValue={
                stats.enrollments.lastMonth > 0 
                  ? (((stats.enrollments.thisMonth - stats.enrollments.lastMonth) / stats.enrollments.lastMonth) * 100).toFixed(1)
                  : 0
              }
              trendUp={stats.enrollments.thisMonth >= stats.enrollments.lastMonth}
            />
            
            <StatCard
              title="Facility Bookings"
              value={stats.bookings.total}
              subtitle={`${stats.facilities.available} facilities available`}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                </svg>
              }
              trend={true}
              trendValue={
                stats.bookings.lastMonth > 0 
                  ? (((stats.bookings.thisMonth - stats.bookings.lastMonth) / stats.bookings.lastMonth) * 100).toFixed(1)
                  : 0
              }
              trendUp={stats.bookings.thisMonth >= stats.bookings.lastMonth}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Enrollment Trends */}
            <div className="card p-6 col-span-2">
              <h2 className="text-lg font-semibold text-primary-100 mb-4">Enrollment Trends</h2>
              {renderTrendChart(enrollmentTrends)}
            </div>
            
            {/* User Distribution */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-primary-100 mb-4">User Distribution</h2>
              <div className="flex justify-center mb-6">
                <div className="relative w-40 h-40">
                  {/* Simple donut chart representation */}
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    {/* Students section (blue) */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray={`${stats.users.students / stats.users.total * 100}, 100`}
                      strokeLinecap="round"
                      transform="rotate(-90, 18, 18)"
                    />
                    {/* Teachers section (green) */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray={`${stats.users.teachers / stats.users.total * 100}, 100`}
                      strokeLinecap="round"
                      transform={`rotate(${stats.users.students / stats.users.total * 360 - 90}, 18, 18)`}
                    />
                    {/* Admins section (purple) */}
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="3"
                      strokeDasharray={`${stats.users.admins / stats.users.total * 100}, 100`}
                      strokeLinecap="round"
                      transform={`rotate(${(stats.users.students + stats.users.teachers) / stats.users.total * 360 - 90}, 18, 18)`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-100">{stats.users.total}</p>
                      <p className="text-xs text-primary-400">Total Users</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <span className="text-primary-300 text-sm">{stats.users.students} Students ({(stats.users.students / stats.users.total * 100).toFixed(1)}%)</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-primary-300 text-sm">{stats.users.teachers} Teachers ({(stats.users.teachers / stats.users.total * 100).toFixed(1)}%)</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                  <span className="text-primary-300 text-sm">{stats.users.admins} Admins ({(stats.users.admins / stats.users.total * 100).toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Distribution by Department */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-primary-100 mb-4">Course Distribution by Department</h2>
              {renderBarChart(courseDistribution, 'percentage', 'name', 'bg-blue-600')}
            </div>
            
            {/* Top Facilities by Usage */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-primary-100 mb-4">Top Facilities by Usage</h2>
              {renderBarChart(facilityUsage, 'utilization', 'name', 'bg-green-600')}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics; 