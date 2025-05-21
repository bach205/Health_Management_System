import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import LayoutPage from './pages/LayoutPage'
import dayjs from 'dayjs'

import updateLocale from "dayjs/plugin/updateLocale";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  weekStart: 1,
});
dayjs.extend(customParseFormat);

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LayoutPage />}>
          <Route path="/" element={<h1>Home</h1>} />
        </Route>
      </Routes>
    </>
  )
}

export default App
