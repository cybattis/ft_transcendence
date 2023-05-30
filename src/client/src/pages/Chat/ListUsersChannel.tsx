import React, { useState, useEffect } from 'react';
import "./ListUsersChannel.css";
import axios from 'axios';

interface ListUsersChannelProps {
    channel: string;
}

export default function ListUsersChannel({ channel }: ListUsersChannelProps) {
    const [users, setUsers] = useState<string[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`http://localhost:5400/channel/users/#general`);
                setUsers(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des utilisateurs du canal :', error);
            }
        };

        fetchUsers();
    }, [channel]);

    return (
        <div className={'list-users-container'}>
            <h3>Liste des utilisateurs {channel}</h3>
            <div className={'list-user'}>
                {users.length === 0 ? (
                    <p>Aucun utilisateur dans le canal</p>
                ) : (
                    <ul>
                        {users.map((user) => (
                            <li key={user}>{user}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
