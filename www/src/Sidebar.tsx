import React from 'react';
import dummyImage from './assets/dummy-image.jpg'; // Import a dummy image
import './Sidebar.css';

interface SidebarProps {
    people: string[];
    selectedPerson: string;
    onPersonSelect: (person: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ people, selectedPerson, onPersonSelect }) => {
    return (
        <aside className="sidebar">
            <ul>
                {people.map(person => (
                    <li
                        key={person}
                        className={selectedPerson === person ? 'selected' : ''}
                        onClick={() => onPersonSelect(person)}
                    >
                        <img src={dummyImage} alt="dummy" className="person-image" />
                        {person}
                    </li>
                ))}
            </ul>
        </aside>
    );
};
