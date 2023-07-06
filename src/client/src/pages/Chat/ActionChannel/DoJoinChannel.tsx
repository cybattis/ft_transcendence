import "./FormAction.css";
import { useForm } from "react-hook-form";
import join  from "../../../resource/join.svg";
import React  from 'react';

export default function DoJoinChannel({ onSubmit } : any) {
    const { register, handleSubmit, reset} = useForm();

    let channelElement = document.getElementById("container-create-channel");
    let operatorElement = document.getElementById("container-operator-channel");
    let privateElement = document.getElementById("container-private-message");
    let banElement = document.getElementById("container-ban-channel");
    let kickElement = document.getElementById("container-kick-channel");
    let blockedElement = document.getElementById("container-blocked-users");
    let focus = document.getElementById("focus-join");

    function blocDoChannel() {

        if (channelElement && focus) {
            if (channelElement.style.display === 'block')
                close();
            else
            {
                if (privateElement && operatorElement && banElement && kickElement && blockedElement) {
                    privateElement.style.display = 'none';
                    banElement.style.display = 'none';
                    operatorElement.style.display = 'none';
                    kickElement.style.display = 'none';
                    blockedElement.style.display ='none';
                }
                channelElement.style.display = 'block';
                focus.focus();
            }
        }
    }

    function close(){
        if (channelElement)
            channelElement.style.display = 'none';
        reset();
    }

    return (
        <div id="container-all-join">
        <div onClick={blocDoChannel} className="button-action-form">
            <img className="logo-chat" src={join} alt="Join" title={"Join"}/>
        </div>
        <div id="container-create-channel">
            <button className={"button-close-cmd"} onClick={close}>X</button>
            <h4 className={"cmd-container-channel"}>Join</h4>
            <form
                className="form-action"
                onSubmit={handleSubmit((data) => {onSubmit(data.channel, data.password); close();})}
            >
                <input id="focus-join" placeholder={"Channel"}   className='input-form-command' {...register("channel")} />
                <input className='input-form-command' placeholder={"Password"}  type="password" {...register("password")} />
                <input className='submit-button-form' type="submit" value="Submit" />
            </form>
        </div>
    </div>
);
}
