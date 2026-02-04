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

export default function Router() {
  return (
    <>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/addrequest" element={<AddRequest />} />
        <Route path="/chat/:chatId" element={<ChatRoom />} />
        <Route path="/myrequests" element={<Myrequests />} />
        <Route path="/profile/:profileId" element={<Profile />} />
        <Route path="/mydeliveries" element={<Mydeliveries />} />
        <Route path="/timer" element={<CountdownTimer />} />
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
    </>
  )
}

