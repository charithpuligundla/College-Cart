import { Route, Routes } from "react-router-dom";
import App from "./App";
import Login from "./Login";
import Home from "./Home";
import AddRequest from "./AddRequest";
import ChatRoom from "./ChatRoom";
import Myrequests from "./Myrequests";
import Profile from "./Profile";
import Mydeliveries from "./Mydeliveries";
import CountdownTimer from "./Timer";
import DocsPage from "./docs";
import ProtectedRoute from "./ProtectedRoute";
import SearchBox from "./search";
import UpdateRequest from "./UpdateRequest";

export default function Router() {
  return (
    <>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/addrequest" element={<ProtectedRoute><AddRequest /></ProtectedRoute>} />
        <Route path="/chat/:chatId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
        <Route path="/myrequests" element={<ProtectedRoute><Myrequests /></ProtectedRoute>} />
        <Route path="/updaterequest/:requestId" element={<ProtectedRoute><UpdateRequest /></ProtectedRoute>} />
        <Route path="/profile/:profileId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/mydeliveries" element={<ProtectedRoute><Mydeliveries /></ProtectedRoute>} />
        <Route path="/timer" element={<CountdownTimer />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/search" element={<SearchBox />} />
      </Routes>
    </>
  )
}

