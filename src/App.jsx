import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthWrapper from './components/AuthWrapper';
import Home from './pages/Home';
import History from './pages/History';
import Permanent from './pages/Permanent';
import Guide from './pages/Guide';
import { Home as HomeIcon, History as HistoryIcon } from 'lucide-react';

import Background from './components/Background';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col relative transition-colors duration-300">

          <AuthWrapper>
            <div className="flex flex-col min-h-screen pt-20">
              <Background />
              <Navbar />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/permanent" element={<Permanent />} />
                  <Route path="/guide" element={<Guide />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </AuthWrapper>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
