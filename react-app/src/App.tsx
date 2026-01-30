import { useState } from 'react';
import { Button, Container, Typography, Box, Paper } from '@mui/material';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <a href="https://vite.dev" target="_blank">
            <img
              src={viteLogo}
              className="logo"
              alt="Vite logo"
              style={{ height: '6em', padding: '1.5em' }}
            />
          </a>
          <a href="https://react.dev" target="_blank">
            <img
              src={reactLogo}
              className="logo react"
              alt="React logo"
              style={{ height: '6em', padding: '1.5em' }}
            />
          </a>
        </Box>

        <Typography variant="h2" component="h1" gutterBottom color="primary">
          Cơm Ánh Dương React App
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Vite + React 19 + MUI v6 + FSD Lite
        </Typography>

        <Paper elevation={3} sx={{ p: 4, mt: 4, maxWidth: 500, mx: 'auto' }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setCount((count) => count + 1)}
            sx={{ mb: 2 }}
          >
            count is {count}
          </Button>
          <Typography variant="body1">
            Edit <code>src/App.tsx</code> and save to test HMR
          </Typography>
        </Paper>

        <Typography variant="caption" display="block" sx={{ mt: 4, color: 'text.disabled' }}>
          Click on the Vite and React logos to learn more
        </Typography>
      </Box>
    </Container>
  );
}

export default App;
