import React, { useState, KeyboardEvent } from 'react';
import './App.css';
import { Sidebar } from './Sidebar.tsx';
import { Chat } from './Chat.tsx';

function App() {
    const [prompt, setPrompt] = useState('');
    const [selectedPerson, setSelectedPerson] = useState('Llama'); // Default selection
    const [conversations, setConversations] = useState<{ [key: string]: string[] }>({
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
        if (!prompt.trim()) return; // Prevent empty submissions

    
        // Add user's prompt to the conversation
        setConversations(prevConversations => ({
            ...prevConversations,
            [selectedPerson]: [...prevConversations[selectedPerson], `You: ${prompt}`]
        }));
    
        // Build the context from the current conversation for the selected person
        const context = conversations[selectedPerson].join('\n');
    
        const jsonData = {
            model: "llama3.2",
            prompt: `${context}\nYou: ${prompt}`, // Add the entire conversation as context, followed by the new prompt
        };

        // Clear the prompt after submission
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
    
        // Start an AI response placeholder in the conversation
        let aiResponse = '';
        setConversations(prevConversations => ({
            ...prevConversations,
            [selectedPerson]: [...prevConversations[selectedPerson], `AI: `]
        }));
    
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
    
            // Decode the stream chunk as UTF-8 text
            buffer += decoder.decode(value, { stream: true });
    
            // Process each line in the stream
            let endOfLineIndex;
            while ((endOfLineIndex = buffer.indexOf('\n')) >= 0) {
                const line = buffer.slice(0, endOfLineIndex);
                buffer = buffer.slice(endOfLineIndex + 1);
    
                if (line.trim()) {
                    try {
                        const parsedLine = JSON.parse(line); // Parse the JSON response
    
                        // Append the new portion of the response to the current AI message
                        aiResponse += parsedLine.response;
    
                        // Update the AI's response in real time
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
        setSelectedPerson(person); // Update the selected person
    };

    return (
        <div className="app-container">
            <Sidebar
                people={people}
                selectedPerson={selectedPerson}
                onPersonSelect={handlePersonSelect}
            />
            <Chat
                prompt={prompt}
                setPrompt={setPrompt}
                handleSubmit={handleSubmit}
                handleKeyDown={handleKeyDown}
                conversations={conversations[selectedPerson]}
            />
        </div>
    );
}

export default App;
