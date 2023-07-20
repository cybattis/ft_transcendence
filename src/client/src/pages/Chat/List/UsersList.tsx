import React, { useEffect, useState } from 'react';
import axios from "axios";
import { apiBaseURL } from '../../../utils/constant';
import { JwtPayload } from "../../../type/client.type";
import jwt_decode from "jwt-decode";
import "./UserList.css";

export default function UsersList(props: { channel: string }) {
    const [usersList, setUsersList] = useState([]);
    const [banList, setBanList] = useState([]);
    const [muteList, setMuteList] = useState([]);
    const [isOpe, setIsOpe] = useState(false);

    const token = localStorage.getItem("token");
    const payload: JwtPayload = jwt_decode(token as string);

    async function fecthLists() {
        if (!props.channel || !props.channel[0])
            return;
        setIsOpe(false);
        let canal = props.channel;
        if (canal[0] === '#')
            canal = canal.slice(1);
        else
            return <></>

        await axios.get(apiBaseURL + "chat/channelName/" + canal, {
            headers: {
                token: token,
            }
        })
            .then((res) => {
                console.log(res.data.operator.includes(payload.nickname));
                if (res.data.operator.includes(payload.nickname))
                    setIsOpe(true);
                setUsersList(res.data.users);
                setBanList(res.data.ban);
                setMuteList(res.data.mute);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    useEffect(() => {
        fecthLists();
    }, [props.channel]);

    function ListBan() {
        if (banList) {
            return (
                <>
                    <h4>Ban</h4>
                    {banList.map((username) => (
                        <button className="channel-waiting" key={username} value={username}>
                            {username}
                        </button>
                    ))}
                </>
            )
        }
        return <>
            <h4>Ban</h4>
        </>;
    }

    function ListMute() {
        if (muteList) {
            return (
                <>
                    <h4>Mute</h4>
                    {muteList && muteList.map((username) => (
                        <button className="channel-waiting" key={username} value={username}>
                            {username}
                        </button>
                    ))}
                </>
            )
        }
        return <>
            <h4>Mute</h4>
        </>;
    }

    return (
        props.channel[0] !== '#'  ? <></>
        :
        <div className="lists">
            <h4>Users</h4>
            {usersList && usersList.map((username) => (
                <button className="channel-waiting" key={username} value={username}>
                    {username}
                </button>
            ))}
            {isOpe && <ListBan />}
            {isOpe && <ListMute />}
        </div>
    );
}