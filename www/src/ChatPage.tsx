import React, { useState, useEffect, KeyboardEvent } from 'react';
import './ChatPage.css';
import { Sidebar } from './Sidebar';
import { Chat } from './Chat';
import { useKeycloak } from '@react-keycloak/web';
import { fetchKeycloakUsers } from './keycloakUtils';
import { sendMessageToLlamaAPI, streamLlamaResponse } from './llamaApi';

const ChatPage: React.FC = () => {
    const { keycloak } = useKeycloak();
    const [prompt, setPrompt] = useState('');
    const [selectedPerson, setSelectedPerson] = useState('Llama');
    const [conversations, setConversations] = useState({
        Llama: [],
    });
    const [people, setPeople] = useState<string[]>(['Llama']);
    const [showChat, setShowChat] = useState(false);

    // Fetch Keycloak users when authenticated
    useEffect(() => {
        if (keycloak.authenticated) {
            console.log("Fetching users")
            fetchKeycloakUsers(keycloak).then((userNames) => {
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
            });
        }
    }, [keycloak]);

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
