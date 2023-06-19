import { useForm } from "react-hook-form";
import "./FormAction.css";
import operator from "../../../resource/operator.svg";

export default function DoPrivateMessage({ onSubmit } : any) {
    const { register, handleSubmit} = useForm();
    function blocPrivateMessage() {
        let kickElement = document.getElementById("container-kick-channel");
        let channelElement = document.getElementById("container-create-channel");
        let operatorElement = document.getElementById("container-operator-channel");
        let privateElement = document.getElementById("container-private-message");
        let banElement = document.getElementById("container-ban-channel")
        let blockedElement = document.getElementById("container-blocked-users");

        let channel = document.getElementById("container-all-join");
        let operator = document.getElementById("container-all-operator");
        let prv = document.getElementById("container-all-private");
        let ban = document.getElementById("container-all-ban");
        let kick = document.getElementById("container-all-kick");
        let blocked = document.getElementById("container-all-blocked");
        let quit = document.getElementById("container-quit-channel");
        let focus = document.getElementById("focus-prv");
        if (privateElement && channel && operator && prv && ban && kick && blocked && quit && focus) {
            if (privateElement.style.display === 'block')
                close();
            else {
                if (channelElement && kickElement && operatorElement && banElement && blockedElement) {
                    channelElement.style.display = 'none';
                    banElement.style.display = 'none';
                    blockedElement.style.display = 'none';
                    operatorElement.style.display = 'none';
                    kickElement.style.display = 'none';
                }
                focus.focus();
                privateElement.style.display = 'block';
                channel.style.order = '0';
                prv.style.order = '3';
                operator.style.order = '2';
                kick.style.order = '2';
                ban.style.order = '4';
                blocked.style.order = '5';
                quit.style.order = '6';
            }
        }
    }

    function close(){
        let privateElement = document.getElementById("container-private-message");
        let channel = document.getElementById("container-all-join");
        let operator = document.getElementById("container-all-operator");
        let prv = document.getElementById("container-all-private");
        let ban = document.getElementById("container-all-ban");
        let kick = document.getElementById("container-all-kick");
        let blocked = document.getElementById("container-all-blocked");
        let quit = document.getElementById("container-quit-channel");

        if (privateElement && channel && operator && prv && ban && kick && blocked && quit) {
            privateElement.style.display = 'none';
            channel.style.order = '0';
            prv.style.order = '1';
            operator.style.order = '2';
            kick.style.order = '3';
            ban.style.order = '4';
            blocked.style.order = '5';
            quit.style.order = '6';
        }
    }
    return (


        <div id="container-all-private">
            <div onClick={blocPrivateMessage} className="button-action-form">
                <img className="logo-chat" src={operator} alt="Private Message" title={"Private Message"}/>
            </div>
            <div id="container-private-message">
                <button className={"button-close-cmd"} onClick={close}>X</button>
                <h4 className={"cmd-container-channel"}>Message Private</h4>
                <form
                    className="form-action"
                    onSubmit={handleSubmit((data) => onSubmit(data.target))}
                >
                    <input id="focus-prv" placeholder={"Target"} className='input-form-command' {...register("target")} />
                    <input className='submit-button-form' type="submit" value="Submit" />
                </form>
            </div>
        </div>
    );
}

