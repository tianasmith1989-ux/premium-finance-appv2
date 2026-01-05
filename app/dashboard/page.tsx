'use client'

import { useUser } from '@clerk/nextjs'

export default function Dashboard() {
  const { user } = useUser()

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
        Welcome, {user?.firstName || 'User'}!
      </h1>
      
      <div style={{ 
        padding: '30px', 
        background: '#f0f9ff', 
        borderRadius: '12px',
        border: '2px solid #3b82f6',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>✅ Test Successful!</h2>
        <p>If you can see this, the app is working correctly.</p>
      </div>

      <button
        onClick={() => alert('Button works!')}
        style={{
          padding: '12px 24px',
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Click to Test
      </button>
    </div>
  )
}
