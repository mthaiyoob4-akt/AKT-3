// Template: How to update your Admin components to use Real-Time Sync
// Copy this pattern to your AdminNewsPanel, AdminAdvertisement, etc.

import React, { useState, useEffect } from 'react';
import { useDataRefresh } from '../hooks/useDataRefresh';
import { useSocketContext } from '../contexts/SocketContext';

/**
 * EXAMPLE: Updated Admin News Panel with Real-Time Sync
 * This shows how to modify your admin components to support global updates
 */

export function ExampleAdminNewsPanel() {
  // Form state
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Get socket context for broadcasting updates
  const socket = useSocketContext();

  // STEP 1: Load initial news data
  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content/news');
      const result = await response.json();
      if (result.success) {
        setNewsList(result.data || []);
      }
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  // STEP 2: Listen for real-time updates from other admins
  useDataRefresh({
    onNewsUpdate: (data) => {
      console.log('[Admin Panel] Someone updated news:', data.updatedBy.email);
      // Show notification to current admin
      setMessage(`News updated by ${data.updatedBy.email} at ${new Date().toLocaleTimeString()}`);
      // Refresh the news list to show latest changes
      loadNews();
    }
  });

  // STEP 3: Submit form and broadcast to all users
  const handleAddNews = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch('/api/content/news', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newsTitle,
          content: newsContent,
          // Add other fields as needed
        })
      });

      const result = await response.json();

      if (result.success) {
        // Clear form
        setNewsTitle('');
        setNewsContent('');
        // Show success message
        setMessage('✓ News published! All users will see it in real-time.');
        // Reload news list (which will also trigger Socket.IO event to all users)
        loadNews();
      } else {
        setMessage('✗ Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error adding news:', error);
      setMessage('✗ Error adding news: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm('Delete this news item?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/content/news/${newsId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('✓ News deleted! Updating all users...');
        loadNews();
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      setMessage('✗ Error deleting news: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>📰 Admin News Manager</h2>

      {/* Status Message */}
      {message && (
        <div
          style={{
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '4px',
            backgroundColor: message.includes('✓') ? '#d4edda' : '#f8d7da',
            color: message.includes('✓') ? '#155724' : '#721c24',
            border: `1px solid ${message.includes('✓') ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {message}
        </div>
      )}

      {/* Add News Form */}
      <form onSubmit={handleAddNews} style={{ marginBottom: '30px' }}>
        <h3>Add New News Item</h3>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Title:
            <input
              type="text"
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
              placeholder="Enter news title"
              required
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Content:
            <textarea
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
              placeholder="Enter news content"
              required
              rows={4}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontFamily: 'Arial'
              }}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Publishing...' : '🚀 Publish to All Users'}
        </button>
      </form>

      {/* News List */}
      <div>
        <h3>Current News Items ({newsList.length})</h3>
        {loading && <p>Loading...</p>}
        {newsList.length === 0 && <p>No news items yet</p>}
        {newsList.map((news) => (
          <div
            key={news.id}
            style={{
              padding: '15px',
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9'
            }}
          >
            <h4>{news.title}</h4>
            <p>{news.content}</p>
            <small style={{ color: '#666' }}>
              Created: {new Date(news.createdAt).toLocaleString()}
            </small>
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => handleDeleteNews(news.id)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Connection Status */}
      <div style={{
        marginTop: '30px',
        padding: '10px',
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#004085'
      }}>
        <strong>Real-Time Status:</strong> {socket?.isConnected ? '✓ Connected' : '⚠ Disconnected'}
      </div>
    </div>
  );
}

// ============================================================
// HOW TO INTEGRATE INTO YOUR EXISTING COMPONENTS:
// ============================================================

/*
STEP 1: Import the hooks
```javascript
import { useDataRefresh } from '../hooks/useDataRefresh';
import { useSocketContext } from '../contexts/SocketContext';
```

STEP 2: Add to your component (in the main function body)
```javascript
// Listen for real-time updates
useDataRefresh({
  onNewsUpdate: (data) => {
    // Refresh your data here
    loadNews();
  },
  onAdvertisementUpdate: (data) => {
    loadAdvertisements();
  },
  // etc...
});
```

STEP 3: When submitting forms, refresh after success
```javascript
const response = await fetch('/api/content/news', {
  method: 'POST',
  // ... rest of fetch config
});

if (response.ok) {
  loadNews(); // This triggers Socket.IO broadcast automatically!
}
```

THAT'S IT! Your component now:
- Syncs with all other browsers in real-time
- Shows live updates when other admins make changes
- Automatically broadcasts changes to all users
*/

export default ExampleAdminNewsPanel;
