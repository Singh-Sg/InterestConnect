import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../CSS/Chat.css'
const Chat = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState(() => {
    const storedMessages = localStorage.getItem(`chat_${id}_messages`);
    return storedMessages ? JSON.parse(storedMessages) : [];
  });
  const [message, setMessage] = useState('');
  const [websckt, setWebsckt] = useState(null);
  const [data, setData] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [password, setPassword] = useState(localStorage.getItem('password'));

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/chatapp/users/`, {
        auth: {
          username,
          password,
        },
      })
      .then((response) => {
        console.log('Users data:', response.data);
        const userData = response.data.map((user) => ({ ...user, accepted: false }));
        setData(userData);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }, []);

  useEffect(() => {
    const url = `ws://127.0.0.1:8000/ws/chat/${id}/?username=${username}&password=${password}`;
    const ws = new WebSocket(url);

    ws.onopen = (event) => {
      console.log('WebSocket connected');
      setWebsckt(ws);
    };

    ws.onmessage = (e) => {
      const messageData = JSON.parse(e.data);
      const messageObj = {
        sender_id: messageData.sender_id,
        message: messageData.message,
        username: messageData.sender_id !== username ? messageData.username : 'You',
        received: true,
      };
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, messageObj];
        localStorage.setItem(`chat_${id}_messages`, JSON.stringify(updatedMessages));
        return updatedMessages;
      });
    };

    return () => {
      ws.close();
    };
  }, [id, username, password]);
  let currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  setInterval(() => {
    currentTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, 1000);

  // const sendMessage = (message) => {
  //   if (websckt && typeof message === 'string' && message.trim() !== '') {
  //     const messageData = {
  //       sender_id: username,
  //       id,
  //       message: message,
  //       username,
  //     };
  //     websckt.send(JSON.stringify(messageData));
  //     setMessage('');
  //   }
  // };

  const sendMessage = (message) => {
    if (websckt && typeof message === 'string' && message.trim() !== '') {
      const messageData = {
        sender_id: username,
        id,
        message: message,
        username,
      };
      console.log('Sending message:', messageData); // Debugging output
      websckt.send(JSON.stringify(messageData));
      setMessage('');
    }
  };
  
  return (
    <div className="container clearfix">

      <div className="chat">

        <div className="chat-header clearfix">
          <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01_green.jpg" alt="avatar" />

          <div className="chat-about">
            <div className="chat-with">Chat with {data.find((user) => user.id === parseInt(id))?.username}</div>
            <div className="chat-num-messages">{`already ${messages.length} messages`}</div>
          </div>
          <i className="fa fa-star"></i>
        </div>

        <div className="chat-history">
          {/* <ul>
            {messages.map((msg, index) => (
              <li key={index} className={`clearfix ${msg.sender_id === username ? 'align-right' : ''}`}>
                <div className="message-data">
                  <span className="message-data-time">{currentTime}</span>
                </div>
                <div
                  className={`message ${msg.sender_id === username ? 'y-message float-right' : 'other-message'} ${msg.sender_id === username ? 'sent-message' : msg.received ? 'received-message' : 'received-message'
                    }`}
                >
                  {msg.message}
                </div>
              </li>
            ))}
          </ul> */}
          <ul>
            {messages.map((msg, index) => (
              <li key={index} className={`clearfix ${msg.sender_id === username ? 'align-right' : ''}`}>
                <div className="message-data">
                  <span className="message-data-time">{currentTime}</span>
                </div>
                <div className={`message ${msg.sender_id === username ? 'y-message float-right' : 'other-message'}`}>
                  {msg.message}
                </div>
              </li>
            ))}
          </ul>

        </div>

        <div className="chat-message clearfix">
          <textarea
            name="message-to-send"
            id="message-to-send"
            placeholder="Type your message"
            rows="3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <i className="fa fa-file-o"></i> &nbsp;&nbsp;&nbsp;
          <i className="fa fa-file-image-o"></i>

          <button onClick={() => sendMessage(message)}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
