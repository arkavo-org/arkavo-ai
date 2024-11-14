import React, { useState, KeyboardEvent } from 'react';
import './ChatPage.css';
import { Sidebar } from './Sidebar.tsx';
import { Chat } from './Chat.tsx';

function ChatPage() {
    const [prompt, setPrompt] = useState('');
    const [selectedPerson, setSelectedPerson] = useState('Llama');
    const [conversations, setConversations] = useState({
        Llama: [],
        'Sigmund Freud': [],
        'Bill Burns CIA': [],
        'Marlissa Smith NSA': [],
        'Albert Einstein': [],
        'Marie Curie': [],
        'Ada Lovelace': [],
        'Stephen Hawking': [],
        'Isaac Newton': []
    });
    const [showChat, setShowChat] = useState(false); // Controls view on mobile

    const people = [
        'Llama',
        'Sigmund Freud',
        'Bill Burns CIA',
        'Marlissa Smith NSA',
        'Albert Einstein',
        'Marie Curie',
        'Ada Lovelace',
        'Stephen Hawking',
        'Isaac Newton',
    ];
    
    const handleSubmit = async () => {
        if (!prompt.trim()) return;

        setConversations(prevConversations => ({
            ...prevConversations,
            [selectedPerson]: [...prevConversations[selectedPerson], `You: ${prompt}`]
        }));

        const context = conversations[selectedPerson].join('\n');
        const jsonData = {
            model: "llama3.2",
            prompt: `${context}\nYou: ${prompt}`,
        };

        setPrompt('');

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        });

        if (!response.body) {
            console.error('No response body');
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let aiResponse = '';
        setConversations(prevConversations => ({
            ...prevConversations,
            [selectedPerson]: [...prevConversations[selectedPerson], `AI: `]
        }));

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            let endOfLineIndex;
            while ((endOfLineIndex = buffer.indexOf('\n')) >= 0) {
                const line = buffer.slice(0, endOfLineIndex);
                buffer = buffer.slice(endOfLineIndex + 1);

                if (line.trim()) {
                    try {
                        const parsedLine = JSON.parse(line);
                        aiResponse += parsedLine.response;

                        setConversations(prevConversations => {
                            const updatedConversation = [...prevConversations[selectedPerson]];
                            updatedConversation[updatedConversation.length - 1] = `AI: ${aiResponse}`;
                            return {
                                ...prevConversations,
                                [selectedPerson]: updatedConversation
                            };
                        });
                    } catch (e) {
                        console.error('Failed to parse line as JSON', e);
                    }
                }
            }
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

    // Determine whether the screen size is mobile
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
}

export default ChatPage;
