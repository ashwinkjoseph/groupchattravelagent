import React, { useState, useEffect } from 'react';
import './App.css'; // You might need to create this file for styling

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

function App() {
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Replace with your actual backend API endpoint
  const apiUrl = 'http://localhost:5000'; 

  useEffect(() => {
    // Fetch initial messages when the component mounts (optional)
    fetchMessages();
  }, []);


  const fetchMessages = async () => {
    try {
      const response = await fetch(`${apiUrl}/messages`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data); // Assuming your backend returns messages in the Message interface format
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
  };

  const handleMemberAdd = () => {
    // Simple validation - you might want to improve this
    if (members.length < 5) { // Limit group size for example
      const newMember = prompt('Enter member username:');
      if (newMember && !members.includes(newMember)) {
        setMembers([...members, newMember]);
      }
    } else {
      alert("Maximum group members reached.");
    }
  };

  const handleCreateGroup = async () => {
    setIsCreatingGroup(true);
    try {
      const response = await fetch(`${apiUrl}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: groupName, members }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Group created:', data);
      alert('Group created successfully!');
      setGroupName('');
      setMembers([]);
      setIsCreatingGroup(false);
      fetchMessages(); // Refresh messages after creating a group
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group.');
      setIsCreatingGroup(false);
    }
  };

  const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const sendMessage = async () => {
    if (newMessage.trim() !== '') {
      try {
        const response = await fetch(`${apiUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: 'me', // Replace with actual user authentication
            text: newMessage,
            timestamp: new Date(),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setMessages([...messages, data]); // Add the new message to the state
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message.');
      }
    }
  };

  return (
    <div className="app">
      <h1>Group Chat</h1>

      {isCreatingGroup ? (
        <div>
          <h2>Create Group</h2>
          <label>
            Group Name:
            <input type="text" value={groupName} onChange={handleGroupNameChange} />
          </label>
          <br />
          <button onClick={handleMemberAdd}>Add Member</button>
          <ul>
            {members.map((member) => (
              <li key={member}>{member}</li>
            ))}
          </ul>
          <br />
          <button onClick={handleCreateGroup} disabled={groupName === '' || members.length === 0}>
            Create Group
          </button>
        </div>
      ) : (
        <div>
          <h2>Chat</h2>

          <div className="message-list">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender === 'me' ? 'sent' : 'received'}`}>
                <strong>{message.sender}:</strong> {message.text}
                <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>

          <div className="input-area">
            <input
              type="text"
              value={newMessage}
              onChange={handleNewMessageChange}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      <button onClick={() => setIsCreatingGroup(true)}>Create New Group</button>
    </div>
  );
}

export default App;
