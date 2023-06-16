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

        if (kickElement) {
            if (kickElement.style.display === 'block')
                kickElement.style.display = 'none';
            else {
                if (channelElement && operatorElement && banElement && privateElement && blockedElement) {
                    channelElement.style.display = 'none';
                    banElement.style.display = 'none';
                    operatorElement.style.display = 'none';
                    privateElement.style.display = 'none';
                    blockedElement.style.display = 'none';
                }
                kickElement.style.display = 'block';
            }
        }
    }

    return (
        <div id="container-all-kick">
            <div onClick={blocKickMessage} className="button-action-form">
                <img className="logo-chat" src={kick} alt="Kick" title={"Kick"}/>
            </div>
            <div id="container-kick-channel">
                <form
                    className="form-action"
                    onSubmit={handleSubmit((data) => onSubmit(data.target))}
                >
                    <label>Target : <input className='input-form-command' {...register("target")} /></label>
                    <input className='submit-button-form' type="submit" value="Submit" />
                </form>
            </div>
        </div>
    );
}

