import { useForm } from "react-hook-form";
import "./FormAction.css";
import operator from "../../../resource/operator.svg";

export default function DoPrivateMessage({ onSubmit } : any) {
    const { register, handleSubmit} = useForm();
    function blocPrivateMessage() {
        let channelElement = document.getElementById("container-create-channel");
        let operatorElement = document.getElementById("container-operator-channel");
        let privateElement = document.getElementById("container-private-message");
        let banElement = document.getElementById("container-ban-channel")
        let blockedElement = document.getElementById("container-blocked-users");

        if (privateElement) {
            if (privateElement.style.display === 'block')
                privateElement.style.display = 'none';
            else {
                if (channelElement && operatorElement && banElement && blockedElement) {
                    channelElement.style.display = 'none';
                    banElement.style.display = 'none';
                    blockedElement.style.display = 'none';
                    operatorElement.style.display = 'none';
                }
                privateElement.style.display = 'block';
            }
        }
    }

    return (


        <div id="container-all-private">
            <div onClick={blocPrivateMessage} className="button-action-form">
                <img className="logo-chat" src={operator} alt="Private Message" title={"Private Message"}/>
            </div>
            <div id="container-private-message">
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

