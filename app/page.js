'use client'

import { useState, useRef, useEffect } from "react";
import { Box, Stack, TextField, Button, Typography, Paper, AppBar, Toolbar, CssBaseline, IconButton } from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm the AI Rate my prof assistant. How can I help you?"
    }
  ]);

  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      reader.read().then(function processText({ done, value }) {
        if (done) return result;

        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        return reader.read().then(processText);
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        bgcolor="#121212"
      >
        <AppBar position="fixed" sx={{ bgcolor: "#1f1f1f" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
            </IconButton>
            <Typography variant="h6" positon="center" component="div" sx={{ flexGrow: 1 }}>
              AI Rate My Prof
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexGrow={1}
          mt={8}
        >
          <Paper
            elevation={4}
            sx={{
              width: "600px",
              height: "80vh",
              bgcolor: "#1e1e1e",
              color: "white",
              borderRadius: 4,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Stack
              direction="column"
              spacing={2}
              sx={{ flexGrow: 1, overflowY: "auto", p: 3 }}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={
                    message.role === 'assistant' ? 'flex-start' : 'flex-end'
                  }
                >
                  <Box
                    sx={{
                      bgcolor: message.role === 'assistant' ? '#303f9f' : '#00796b',
                      color: "white",
                      borderRadius: 3,
                      p: 2,
                      maxWidth: "75%",
                      wordWrap: "break-word",
                    }}
                  >
                    <Typography variant="body1" component="p">
                      {message.content}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Stack>
            <Box
              component="form"
              onKeyPress={handleKeyPress}
              sx={{ p: 2, display: "flex", bgcolor: "#1f1f1f" }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{
                  bgcolor: "#2c2c2c",
                  input: { color: "white" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#424242",
                    },
                    "&:hover fieldset": {
                      borderColor: "#616161",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#757575",
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={sendMessage}
                sx={{ ml: 2, bgcolor: "#2979ff", "&:hover": { bgcolor: "#5393ff" } }}
              >
                Send
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
}