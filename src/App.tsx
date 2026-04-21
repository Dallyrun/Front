import { Route, Routes } from 'react-router-dom';

import HomePage from '@/pages/Home/HomePage';
import LoginPage from '@/pages/Login/LoginPage';

import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
