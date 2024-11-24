import React, { useState, useEffect, KeyboardEvent } from 'react';
import './ChatPage.css';
import { Sidebar } from './Sidebar';
import { Chat } from './Chat';
import { useKeycloak } from '@react-keycloak/web'; // Import useKeycloak
import { fetchKeycloakUsers } from './orgBackendUtils'; // Import the utility function
import { sendMessageToLlamaAPI, streamLlamaResponse } from './llamaApi';

const ChatPage: React.FC = () => {
    const { keycloak, initialized } = useKeycloak(); // Get keycloak instance and check if it's initialized
    const [prompt, setPrompt] = useState('');
    const [selectedPerson, setSelectedPerson] = useState('Llama');
    const [conversations, setConversations] = useState({
        Llama: [],
    });
    const [people, setPeople] = useState<string[]>(['Llama']);
    const [showChat, setShowChat] = useState(false);
    const [loading, setLoading] = useState(true); // Loading state for users
    const [error, setError] = useState<string | null>(null); // Error state for handling fetch errors

    // Use the token to fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            if (initialized && keycloak.authenticated) {
                try {
                    // Ensure the token is valid and refresh it if needed
                    const tokenValid = await keycloak.updateToken(30); // Refresh token if it's going to expire in 30 seconds

                    const token = keycloak.token; // Get the fresh token
                    if (!token) {
                        throw new Error('Access token is missing');
                    }

                    console.log("Fetching users with token");
                    const userNames = await fetchKeycloakUsers(token); // Pass the token here
                    setPeople(['Llama', ...userNames]);
                    setConversations((prevConversations) => {
                        const newConversations = { ...prevConversations };
                        userNames.forEach((name) => {
                            if (!newConversations[name]) {
                                newConversations[name] = [];
                            }
                        });
                        return newConversations;
                    });
                } catch (error) {
                    console.error('Error fetching users:', error);
                    setError('Failed to fetch users');
                } finally {
                    setLoading(false); // Set loading to false after fetching
                }
            }
        };

        fetchUsers();
    }, [initialized, keycloak]);

    // Handle message submission
    const handleSubmit = async () => {
        if (!prompt.trim()) return;

        // Add user's message to conversation
        setConversations((prevConversations) => ({
            ...prevConversations,
            [selectedPerson]: [...prevConversations[selectedPerson], `You: ${prompt}`],
        }));

        const context = conversations[selectedPerson].join('\n');
        try {
            const responseBody = await sendMessageToLlamaAPI('llama3.2', context, prompt);
            const reader = responseBody.getReader();
            let aiResponse = '';

            // Stream the response
            await streamLlamaResponse(
                reader,
                (data) => {
                    aiResponse += data;
                    setConversations((prevConversations) => {
                        const updatedConversation = [...prevConversations[selectedPerson]];
                        updatedConversation[updatedConversation.length - 1] = `AI: ${aiResponse}`;
                        return {
                            ...prevConversations,
                            [selectedPerson]: updatedConversation,
                        };
                    });
                },
                (error) => {
                    console.error('Error streaming Llama response:', error);
                }
            );
        } catch (error) {
            console.error('Error sending message to Llama API:', error);
        } finally {
            setPrompt('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handlePersonSelect = (person: string) => {
        setSelectedPerson(person);
        setShowChat(true); // Switch to chat view on mobile
    };

    const isMobile = window.innerWidth <= 768;

    if (loading) {
        return <div>Loading users...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div id="app-container">
            {(!isMobile || !showChat) && (
                <Sidebar
                    people={people}
                    selectedPerson={selectedPerson}
                    onPersonSelect={handlePersonSelect}
                    className={`sidebar ${!isMobile || !showChat ? 'active' : ''}`}
                />
            )}
            {(isMobile && showChat) && (
                <div className="chat-window active">
                    <div className="back-button" onClick={() => setShowChat(false)}>
                        ← Back
                    </div>
                    <Chat
                        prompt={prompt}
                        setPrompt={setPrompt}
                        handleSubmit={handleSubmit}
                        handleKeyDown={handleKeyDown}
                        conversations={conversations[selectedPerson]}
                    />
                </div>
            )}
            {!isMobile && (
                <Chat
                    prompt={prompt}
                    setPrompt={setPrompt}
                    handleSubmit={handleSubmit}
                    handleKeyDown={handleKeyDown}
                    conversations={conversations[selectedPerson]}
                    className="chat-window"
                />
            )}
        </div>
    );
};

export default ChatPage;
