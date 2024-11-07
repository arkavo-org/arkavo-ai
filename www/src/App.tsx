// src/App.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Navbar from './Navbar';
import { userManager } from './authConfig';

interface FeedItem {
    title: string;
    description: string;
    category: string;
    date: string;
    author: string;
    link: string;
    likes?: number;
    replies?: number;
    comments?: number;
}

const App: React.FC = () => {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [displayedItems, setDisplayedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFeedItems = async () => {
            try {
                const [eventsRes, threadsRes] = await Promise.all([
                    axios.get('/ipsum/events.json'),
                    axios.get('/ipsum/threads.json')
                ]);

                const eventsData: FeedItem[] = eventsRes.data;
                const threadsData: FeedItem[] = threadsRes.data;

                const combinedData = alternateItems(eventsData, threadsData);
                setFeedItems(shuffleArray(combinedData));
                setDisplayedItems(combinedData.slice(0, 10));
            } catch (error) {
                console.error("Error fetching feed data:", error);
            }
        };

        fetchFeedItems();
    }, []);

    // Alternates items from two arrays
    const alternateItems = (arr1: FeedItem[], arr2: FeedItem[]): FeedItem[] => {
        const result: FeedItem[] = [];
        const maxLength = Math.max(arr1.length, arr2.length);
        
        for (let i = 0; i < maxLength; i++) {
            if (i < arr1.length) result.push(arr1[i]);
            if (i < arr2.length) result.push(arr2[i]);
        }
        return result;
    };

    // Randomly shuffles an array
    const shuffleArray = (array: FeedItem[]): FeedItem[] => {
        return array
            .map(item => ({ ...item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ sort, ...item }) => item);
    };

    const loadMoreItems = () => {
        if (loading) return;
        setLoading(true);
        setTimeout(() => {
            setDisplayedItems(prevItems => [
                ...prevItems,
                ...feedItems.slice(prevItems.length, prevItems.length + 10)
            ]);
            setLoading(false);
        }, 1000);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop + 50 >= document.documentElement.offsetHeight) {
                loadMoreItems();
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [feedItems, loading]);

    return (
        <div style={{ width: "100vw" }}>
            <Navbar />
            <div style={{ paddingTop: "80px", padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
                {displayedItems.map((item, index) => (
                    <div key={index} className="feed-item">
                        <h2>{item.title}</h2>
                        <p>{item.description}</p>
                        <p className="meta"><strong>Category:</strong> {item.category}</p>
                        <p className="meta"><strong>Date:</strong> {item.date}</p>
                        <p className="meta"><strong>Author:</strong> {item.author}</p>
                        <a href={item.link} target="_blank" rel="noopener noreferrer">Read more</a>
                    </div>
                ))}
                {loading && <p>Loading more items...</p>}
            </div>
        </div>
    );
};

export default App;
