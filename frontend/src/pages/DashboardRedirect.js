import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

/**
 * Legacy redirect component for old /dashboard URLs
 * Redirects /dashboard?dept=CSCE&courseNumber=120 to /course/CSCE120
 */
const DashboardRedirect = () => {
  const [searchParams] = useSearchParams();
  const dept = searchParams.get('dept');
  const courseNumber = searchParams.get('courseNumber');
  
  if (dept && courseNumber) {
    const courseId = `${dept}${courseNumber}`;
    return <Navigate to={`/course/${courseId}`} replace />;
  }
  
  // If no valid params, redirect to home
  return <Navigate to="/" replace />;
};

export default DashboardRedirect;
