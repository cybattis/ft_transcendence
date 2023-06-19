import { useForm } from "react-hook-form";
import "./FormAction.css";
import kick from "../../../resource/kick.svg";

export default function DoKickChannel({ onSubmit } : any) {
    const { register, handleSubmit} = useForm();
    function blocKickMessage() {
        let channelElement = document.getElementById("container-create-channel");
        let operatorElement = document.getElementById("container-operator-channel");
        let privateElement = document.getElementById("container-private-message");
        let banElement = document.getElementById("container-ban-channel");
        let kickElement = document.getElementById("container-kick-channel");
        let blockedElement = document.getElementById("container-blocked-users");

        let channel = document.getElementById("container-all-join");
        let operator = document.getElementById("container-all-operator");
        let prv = document.getElementById("container-all-private");
        let ban = document.getElementById("container-all-ban");
        let kick = document.getElementById("container-all-kick");
        let blocked = document.getElementById("container-all-blocked");
        let quit = document.getElementById("container-quit-channel");
        let focus = document.getElementById("focus-kick");
        if (kickElement && channel && operator && prv && ban && kick && blocked && quit && focus) {
            if (kickElement.style.display === 'block')
                close();
            else {
                if (channelElement && operatorElement && banElement && privateElement && blockedElement) {
                    channelElement.style.display = 'none';
                    banElement.style.display = 'none';
                    operatorElement.style.display = 'none';
                    privateElement.style.display = 'none';
                    blockedElement.style.display = 'none';
                }
                kickElement.style.display = 'block';
                focus.focus();
                channel.style.order = '0';
                prv.style.order = '1';
                operator.style.order = '2';
                kick.style.order = '3';
                ban.style.order = '4';
                blocked.style.order = '5';
                quit.style.order = '6';
            }
        }
    }

    function close(){
        let kickElement = document.getElementById("container-kick-channel");
        let channel = document.getElementById("container-all-join");
        let operator = document.getElementById("container-all-operator");
        let prv = document.getElementById("container-all-private");
        let ban = document.getElementById("container-all-ban");
        let kick = document.getElementById("container-all-kick");
        let blocked = document.getElementById("container-all-blocked");
        let quit = document.getElementById("container-quit-channel");

        if (kickElement && channel && operator && prv && ban && kick && blocked && quit) {
            kickElement.style.display = 'none';
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
        <div id="container-all-kick">
            <div onClick={blocKickMessage} className="button-action-form">
                <img className="logo-chat" src={kick} alt="Kick" title={"Kick"}/>
            </div>
            <div id="container-kick-channel">
                <button className={"button-close-cmd"} onClick={close}>X</button>
                <h4 className={"cmd-container-channel"}>Kick</h4>
                <form
                    className="form-action"
                    onSubmit={handleSubmit((data) => onSubmit(data.target))}
                >
                    <input id="focus-kick" className='input-form-command' {...register("target")} placeholder={"Target"}/>
                    <input className='submit-button-form' type="submit" value="Submit" />
                </form>
            </div>
        </div>
    );
}

