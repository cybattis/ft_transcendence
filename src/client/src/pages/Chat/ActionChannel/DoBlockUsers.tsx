import "./FormAction.css";
import { useForm } from "react-hook-form";
import ban  from "../../../resource/ban.svg";

export default function DoBlockUsers({ onSubmit } : any) {
    const { register, handleSubmit} = useForm();
    function blocBlockedUsers() {
        let banElement = document.getElementById("container-ban-channel");
        let channelElement = document.getElementById("container-create-channel");
        let operatorElement = document.getElementById("container-operator-channel");
        let privateElement = document.getElementById("container-private-message");
        let kickElement = document.getElementById("container-kick-channel");
        let blockedElement = document.getElementById("container-blocked-users");

        let channel = document.getElementById("container-all-join");
        let operator = document.getElementById("container-all-operator");
        let prv = document.getElementById("container-all-private");
        let ban = document.getElementById("container-all-ban");
        let kick = document.getElementById("container-all-kick");
        let blocked = document.getElementById("container-all-blocked");
        let quit = document.getElementById("container-quit-channel");
        let focus = document.getElementById("focus-blocked");
        if (blockedElement && channel && operator && prv && ban && kick && blocked && quit && focus) {
            if (blockedElement.style.display === 'block')
            {
                blockedElement.style.display = 'none';
                operator.style.order = '2';
                kick.style.order = '3';
                ban.style.order = '4';
                blocked.style.order = '5';
                quit.style.order = '6';
            }
            else
            {
                if (privateElement && channelElement && operatorElement && kickElement && banElement){
                    privateElement.style.display = 'none';
                    operatorElement.style.display = 'none';
                    channelElement.style.display = 'none'
                    kickElement.style.display = 'none';
                    banElement.style.display = 'none'
                }
                channel.style.order = '0';
                prv.style.order = '1';
                operator.style.order = '2';
                kick.style.order = '4';
                ban.style.order = '5';
                blocked.style.order = '3';
                quit.style.order = '6';
                blockedElement.style.display = 'block';
                focus.focus();
            }
        }
    }

    function close(){
        let blockedElement = document.getElementById("container-blocked-users");
        let channel = document.getElementById("container-all-join");
        let operator = document.getElementById("container-all-operator");
        let prv = document.getElementById("container-all-private");
        let ban = document.getElementById("container-all-ban");
        let kick = document.getElementById("container-all-kick");
        let blocked = document.getElementById("container-all-blocked");
        let quit = document.getElementById("container-quit-channel");

        if (blockedElement && channel && operator && prv && ban && kick && blocked && quit) {
            blockedElement.style.display = 'none';
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
        <div id="container-all-blocked">
            <div onClick={blocBlockedUsers} className="button-action-form">
                <img className="logo-chat" src={ban} alt="Blocked" title={"Blocked"} />
            </div>
            <label id="container-blocked-users">
                <button className={"button-close-cmd"} onClick={close}>X</button>
                <h4 className={"cmd-container-channel"}>Blocked</h4>
                <form
                    className="form-action"
                    onSubmit={handleSubmit((data) => onSubmit(data.target, data.cmd))}
                >
                    <input id="focus-blocked" className='input-form-command' {...register("target")} placeholder={"Target"} name="target"/>
                    <input className='submit-button-form' type="submit" value="Submit" />
                </form>
            </label>
        </div>
    );
}
