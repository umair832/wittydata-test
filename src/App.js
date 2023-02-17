
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './containers/LoginPage';
import SignUpPage from './containers/SignUpPage';
import ToDoListPage from './containers/ToDoListPage';
import UserProfilePage from './containers/UserProfilePage';


function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LoginPage />}/>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/todolist" element={<ToDoListPage />} />
        <Route path="/userprofile" element={<UserProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
