// src/Profile.tsx
import React, { useEffect, useState } from 'react';

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<{ [key: string]: any } | null>(null);

  useEffect(() => {
    // Retrieve and parse the user profile from localStorage
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setProfileData(JSON.parse(storedProfile));
    }
  }, []);

  if (!profileData) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <img
        src={profileData.picture}
        alt="Profile"
        style={{ width: 100, height: 100, borderRadius: '50%', marginBottom: '1rem' }}
      />
      <ul>
        {Object.entries(profileData).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {String(value)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;
