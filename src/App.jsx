import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>FE_C2 - Dự án React</h1>
        <p>Chào mừng bạn đến với ứng dụng React</p>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Số đếm hiện tại: {count}
        </button>
        <p>
          Chỉnh sửa <code>src/App.jsx</code> và lưu để kiểm tra HMR
        </p>
      </div>
    </>
  )
}

export default App
