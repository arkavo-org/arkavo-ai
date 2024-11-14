import React, { useState, ChangeEvent } from 'react';
import './Settings.css';
import Navbar from './Navbar'; // Import the Navbar component

interface SettingsProps {
    userName: string;
    profilePicture: string;
    darkMode: boolean;
    onUpdateName: (newName: string) => void;
    onUpdateProfilePicture: (newPicture: string) => void;
    onToggleDarkMode: () => void;
}

const Settings: React.FC<SettingsProps> = ({ userName, profilePicture, darkMode, onUpdateName, onUpdateProfilePicture, onToggleDarkMode }) => {
    const [name, setName] = useState(userName);
    const [newProfilePicture, setNewProfilePicture] = useState(profilePicture);
    const [isDarkMode, setIsDarkMode] = useState(darkMode);

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleProfilePictureChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setNewProfilePicture(base64String);
                onUpdateProfilePicture(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveName = () => {
        onUpdateName(name);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        onToggleDarkMode();
    };

    return (
        <div>
            <Navbar /> {/* Display Navbar at the top */}
            <div className="settings-container">
                <h2>User Settings</h2>

                <div className="settings-section">
                    <label htmlFor="name">Change Name:</label>
                    <input 
                        type="text"
                        id="name"
                        value={name}
                        onChange={handleNameChange}
                    />
                    <button onClick={handleSaveName}>Save</button>
                </div>

                <div className="settings-section">
                    <label>Profile Picture:</label>
                    <div className="profile-picture-container">
                        <img src={newProfilePicture} alt="Profile" className="profile-picture" />
                        <input 
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                        />
                    </div>
                </div>

                <div className="settings-section">
                    <label>Dark Mode:</label>
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={isDarkMode}
                            onChange={toggleDarkMode}
                        />
                        <span className="slider" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
