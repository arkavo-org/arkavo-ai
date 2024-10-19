import React, { useState, KeyboardEvent } from 'react';
import logo from './assets/arkavo.svg';
import './App.css'

function App() {
    const [prompt, setPrompt] = useState('');
    const [responses, setResponses] = useState<string[]>([]);

    const handleSubmit = async () => {
        if (!prompt.trim()) return; // Prevent empty submissions

        setResponses([]); // Clear previous responses when a new prompt is submitted

        const jsonData = {
            model: "llama3.2",
            prompt: prompt,
        };

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
                        setResponses(prev => [...prev, parsedLine.response]);
                    } catch (e) {
                        console.error('Failed to parse line as JSON', e);
                    }
                }
            }
        }

        // Handle any remaining data in the buffer
        if (buffer.trim()) {
            try {
                const parsedLine = JSON.parse(buffer);
                setResponses(prev => [...prev, parsedLine.response]);
            } catch (e) {
                console.error('Failed to parse buffer as JSON', e);
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <>
            <img src={logo} className="logo" alt="Arkavo logo"/>
            <h1>Arkavo AI</h1>
            <div>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your prompt"
                    rows={3}
                />
                <br/><br/>
                <button onClick={handleSubmit}>Send</button>
            </div>
            <div>
                {responses.map((response, index) => (
                    <span key={index}>{response}</span>
                ))}
            </div>
        </>
    );
}

export default App;
