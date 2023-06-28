import "./FormAction.css";
import { useForm } from "react-hook-form";
import ban  from "../../../resource/ban.svg";
import React  from 'react';

export default function DoBlockUsers({ onSubmit } : any) {
    const { register, handleSubmit, reset} = useForm();
    let banElement = document.getElementById("container-ban-channel");
    let channelElement = document.getElementById("container-create-channel");
    let operatorElement = document.getElementById("container-operator-channel");
    let privateElement = document.getElementById("container-private-message");
    let kickElement = document.getElementById("container-kick-channel");
    let blockedElement = document.getElementById("container-blocked-users");
    function blocBlockedUsers() {
        let focus = document.getElementById("focus-blocked");
        if (blockedElement && focus) {
            if (blockedElement.style.display === 'block')
                blockedElement.style.display = 'none';
            else
            {
                if (privateElement && channelElement && operatorElement && kickElement && banElement){
                    privateElement.style.display = 'none';
                    operatorElement.style.display = 'none';
                    channelElement.style.display = 'none'
                    kickElement.style.display = 'none';
                    banElement.style.display = 'none'
                }
                blockedElement.style.display = 'block';
                focus.focus();
            }
        }
    }

    function close(){
        if (blockedElement)
            blockedElement.style.display = 'none';
        reset();
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        console.log(`Key pressed: ${event.key}`);
        if (event.key === "Enter")
            close();
    };

    return (
        <div id="container-all-blocked">
            <div onClick={blocBlockedUsers} className="button-action-form">
                <img className="logo-chat" src={ban} alt="Blocked" title={"Blocked"} />
            </div>
            <label id="container-blocked-users">
                <button className={"button-close-cmd"} onClick={close}>X</button>
                <h4 className={"cmd-container-channel"}>Blocked</h4>
                <form
                    className="form-action"
                    onSubmit={handleSubmit((data) => {onSubmit(data.target, data.cmd); close();})}
                >
                    <input id="focus-blocked" className='input-form-command' {...register("target")} placeholder={"Target"} name="target"/>
                    <input className='submit-button-form' type="submit" value="Submit" />
                </form>
            </label>
        </div>
    );
}