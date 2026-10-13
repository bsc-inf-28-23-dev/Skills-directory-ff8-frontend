import { Routes, Route } from 'react-router-dom';
import { Conversation } from './pages/resident/Conversation/Conversation';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/conversation/:providerId" element={<Conversation />} />
    </Routes>
  );
}

export default App;