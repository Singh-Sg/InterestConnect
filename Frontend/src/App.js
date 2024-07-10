import React from 'react'
import Signin from './Components/Signin';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from './Components/SignUp';
import DataShow from './Components/DataShow';
import Notifications from './Components/Notifications';
import Chat from './Components/Chat';

const App = () => {
  return (
    <div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signin />}></Route>
        <Route path='/signup' element={<SignUp/>}></Route>
        <Route path='/datashow' element={<DataShow/>}></Route>
        <Route path='/notification' element={<Notifications/>}/>
        <Route path='/chat/:id' element={<Chat/>} />
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App