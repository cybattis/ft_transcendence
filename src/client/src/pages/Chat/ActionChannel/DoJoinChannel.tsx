import "./FormAction.css";
import { useForm } from "react-hook-form";
import join  from "../../../resource/join.svg";


export default function DoJoinChannel({ onSubmit } : any) {
    const { register, handleSubmit} = useForm();
    function blocDoChannel() {
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
        if (channelElement) {
            if (channelElement.style.display === 'block')
                channelElement.style.display = 'none';
            else
            {
                if (privateElement && operatorElement && banElement && kickElement && blockedElement) {
                    privateElement.style.display = 'none';
                    banElement.style.display = 'none';
                    operatorElement.style.display = 'none';
                    kickElement.style.display = 'none';
                    blockedElement.style.display ='none';
                }
                if (channel && operator && prv && ban && kick && blocked && quit){
                    operator.style.order = '0';
                    prv.style.order = '1';
                    ban.style.order = '2';
                    kick.style.order = '4';
                    blocked.style.order = '5';
                    quit.style.order = '6';

                    channel.style.order = '3';
                }
                channelElement.style.display = 'block';
            }
        }
    }

    return (
        <div id="container-all-join">
                <div onClick={blocDoChannel} className="button-action-form">
                    <img className="logo-chat" src={join} alt="Join" title={"Join"}/>
                </div>
            <div id="container-create-channel">
                <form
                    className="form-action"
                    onSubmit={handleSubmit((data) => onSubmit(data.channel, data.password))}
                >
                    <label>Channel : <input className='input-form-command' {...register("channel")} /></label>
                    <label>Password : <input className='input-form-command' type="password" {...register("password")} /></label>
                    <input className='submit-button-form' type="submit" value="Submit" />
                </form>
            </div>
        </div>
    );
}

