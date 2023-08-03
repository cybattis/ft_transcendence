import React from "react";
import { Avatar } from "../../components/Avatar";
import "./PlayerList.css";

export interface PlayerInterface{
    username: string;
    avatar: string;
    elo: string;
}

export default function PlayerList(props: {playerOne: PlayerInterface | undefined, playerTwo: PlayerInterface | undefined}) {

    if (props.playerOne && props.playerTwo)
    {
        return <div className="playerList">
            <div>
                <div className="playerAvatar">
                    <Avatar size="50px" img={props.playerOne.avatar} />
                </div>
                <h5>{props.playerOne.username}</h5>
                <div>Elo: {props.playerOne.elo}</div>
            </div>
            <h3 className="vs">VS</h3>
            <div>
                <div className="playerAvatar">
                    <Avatar size="50px" img={props.playerTwo.avatar} />
                </div>
                <h5>{props.playerTwo.username}</h5>
                <div>Elo: {props.playerTwo.elo}</div>
            </div>
        </div>
    }
    return <></>;
}