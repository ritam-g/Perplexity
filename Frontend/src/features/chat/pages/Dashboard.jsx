import React from 'react'
import { useEffect } from 'react';
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat';

function Dashboard() {
    const { initializedSocketConnection } = useChat()
    //    console.log(user);
    useEffect(() => {
        initializedSocketConnection()
    })
    return (
        <div>
            dashboard
        </div>
    )
}

export default Dashboard
