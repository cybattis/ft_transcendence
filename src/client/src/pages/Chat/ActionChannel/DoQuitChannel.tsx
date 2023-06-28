import { useForm } from "react-hook-form";
import "./FormAction.css";
import quit from "../../../resource/quit.svg";

export default function DoQuitForm({ onSubmit } : any) {
    const { register, handleSubmit} = useForm();
    function blocQuitMessage() {
        let channelElement = document.getElementById("container-create-channel");
        let operatorElement = document.getElementById("container-operator-channel");
        let privateElement = document.getElementById("container-private-message");
        let banElement = document.getElementById("container-ban-channel");
        let kickElement = document.getElementById("container-kick-channel");

        if (kickElement && channelElement && operatorElement && banElement && privateElement) {
            channelElement.style.display = 'none';
            banElement.style.display = 'none';
            operatorElement.style.display = 'none';
            privateElement.style.display = 'none';
        }
    }

    return (
        <div id="container-quit-channel">
            <div onClick={blocQuitMessage} className="button-action-form">
                <form
                className="form-action"
                onSubmit={handleSubmit((data) => onSubmit(data.target))}
            >
                    <label className='cache-input'>Target : <input className='input-form-command' {...register("quit")} /></label>
                    <label><img className="logo-chat" src={quit} alt="quit" title={"Quit"}/><input className='cache-input' type="submit" value="Quit" /></label>
                </form>
            </div>
        </div>
    );
}