import { Route, Routes } from 'react-router-dom';

import HomePage from '@/pages/Home/HomePage';

import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>
  );
}

export default App;
