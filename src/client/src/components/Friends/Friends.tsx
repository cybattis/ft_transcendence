import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./Friends.css"
import { Avatar } from '../Avatar';
import { Link } from "react-router-dom";

//Mettre un useState refresh automatique
function Online(data: any) {
  return <div className="online">
    <div className="status">{(data.inGame === true) ? "In game" : "In menu"}</div>
  </div>
}

function Offline() {
  return <div className="offline"></div>
}


function FriendsList() { 
        const [dataOnline, setDataOnline] = useState([{
            nickname: "",
            avatarUrl: "",
            online: false,
            inGame: false,
            id: 0,
        }]);

        const [dataOffline, setDataOffline] = useState([{
          nickname: "",
          avatarUrl: "",
          online: false,
          inGame: false,
          id: 0,
      }]);

    const token = localStorage.getItem("token");
    
    useEffect(() => {
        async function fetchDataOnline() {
            await axios.get("http://localhost:5400/user/friends/online", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then((res) => {
                setDataOnline(res.data);
            });
        }
        async function fetchDataOffline() {
          await axios.get("http://localhost:5400/user/friends/offline", {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          })
          .then((res) => {
              setDataOffline(res.data);
          });
      }
        fetchDataOnline();
        fetchDataOffline();
    }, []);


   if ((dataOnline && dataOnline[0]) || (dataOffline && dataOffline[0])) {
    return <>
    <h4>Friends</h4>
    <ul>
      {dataOnline.map(dataOnline => {
        return <div className="friends" key={dataOnline.nickname}>
            <Link to={`/profile/${dataOnline.nickname}`} className="friendLink">
              <div>
                <p  className="friendsImg"><Avatar size="50px" img={dataOnline.avatarUrl} /></p>
                {<Online inGame={dataOnline.inGame}/>}
              </div>
                <p className="nickname">{dataOnline.nickname}</p>
            </Link>
          </div>;
      })}
      {dataOffline.map(dataOffline => {
        return <div className="friends" key={dataOffline.nickname}>
            <Link to={`/profile/${dataOffline.nickname}`} className="friendLink">
              <div>
                <p  className="friendsImg"><Avatar size="50px" img={dataOffline.avatarUrl} /></p>
                {<Offline />}
              </div>
                <p className="nickname">{dataOffline.nickname}</p>
              </Link>
          </div>;
      })}
    </ul>
</>
   }
   else
    return <h4>No Friends</h4>
}
        
export function Friends() {
    return <div className="friendList">
        <FriendsList />
    </div>;
}