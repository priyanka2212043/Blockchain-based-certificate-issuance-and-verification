import React from 'react';

function InstructorWelcome() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Welcome Instructor {user?.username || ''}!</h1>
      <p>This is your instructor dashboard.</p>
    </div>
  );
}

export default InstructorWelcome;
