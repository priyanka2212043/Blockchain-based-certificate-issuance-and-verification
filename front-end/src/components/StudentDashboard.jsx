import React from 'react';

function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Welcome Student {user?.username || ''}!</h1>
      <p>This is your student dashboard.</p>
    </div>
  );
}

export default StudentDashboard;
