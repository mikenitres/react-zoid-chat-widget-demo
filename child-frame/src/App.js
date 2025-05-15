/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { Card, CrossIcon, Heading, IconButton, majorScale, Pane, SendMessageIcon, Strong, Text, TextInput, Tooltip } from 'evergreen-ui';

function App(props) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const ws = useRef(null);
  const reconnectInterval = useRef(null);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const connectToWebSocket = () => {
    ws.current = new WebSocket('wss://echo.websocket.org/');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current);
        reconnectInterval.current = null;
      }
    };

    ws.current.onmessage = (event) => {
      const data = event.data;
      const newMessageObject = {
        text: data,
        sender: 'Server'
      };
      setMessages((prevMessages) => [...prevMessages, newMessageObject]);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      if (!reconnectInterval.current) {
        reconnectInterval.current = setInterval(() => {
          console.log('Attempting to reconnect to WebSocket...');
          connectToWebSocket();
        }, 5000);
      }
    };
  };

  useEffect(() => {
    connectToWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    handleScrollToBottom();
  }, [messages]);

  const handleScrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const newMessageObject = {
        text: newMessage,
        sender: 'User'
      };
      setMessages((prevMessages) => [...prevMessages, newMessageObject]);

      if (props.passDownFunc) {
        props.passDownFunc(newMessage);
      }

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(newMessage);
      }
      setNewMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  return (
    <Pane className="App">
      <Pane className={`chat-container ${isChatVisible ? 'chat-container-enter' : 'chat-container-exit'}`}>
        {isChatVisible && (
          <>
            <Pane className='chat-header' display="flex" alignItems="center" justifyContent="space-between" padding={majorScale(1)}>
              <br />
              <Heading size={700} color="white">PayPal Customer Support</Heading>
              <Tooltip content="Close Chat">
                <IconButton
                  className="close-chat-button"
                  icon={CrossIcon}
                  appearance="minimal"
                  onClick={toggleChat}
                />
              </Tooltip>
            </Pane>
            <Card padding={majorScale(1)} className="chat-window">
              <Pane className="message-list">
                {messages.map((message, index) => (
                  <Pane
                    key={index}
                    className={`message ${message.sender === 'User' ? 'user-message' : 'server-message'}`}
                    padding={majorScale(1)}
                    borderRadius={majorScale(1)}
                    marginBottom={majorScale(1)}
                  >
                    <Text>{message.text}</Text>
                  </Pane>
                ))}
                <div ref={messagesEndRef} />
              </Pane>
            </Card>
            <Pane display="flex" alignItems="center" className="input-area">
              <TextInput
                className="message-input"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                onKeyDown={handleKeyDown}
              />
              <IconButton
                className="send-message-button"
                icon={SendMessageIcon}
                onClick={handleSendMessage}
              />
            </Pane>
          </>
        )}
      </Pane>
      {!isChatVisible && (
        <Pane position="fixed" bottom={majorScale(2)} right={majorScale(2)}>
          <Tooltip content={isChatVisible ? "Close Chat" : "Open Chat"}>
            <IconButton
              onClick={toggleChat}
              className="chat-button chat-toggle-button"
            />
          </Tooltip>
        </Pane>
      )}
    </Pane>
  );
}

export default App;
