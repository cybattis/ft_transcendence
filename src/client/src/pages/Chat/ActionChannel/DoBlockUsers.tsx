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
        let pos = document.getElementById("test");
        if (blockedElement) {
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
                if(pos)
                    pos.style.order = '0';
            }
        }
    }

    return (
        <div id="container-all-blocked">
            <div onClick={blocBlockedUsers} className="button-action-form">
                <img className="logo-chat" src={ban} alt="Blocked" title={"Blocked"} />
            </div>
            <label id="container-blocked-users">
                <form
                    className="form-action"
                    onSubmit={handleSubmit((data) => onSubmit(data.target, data.cmd))}
                >
                    <label>Target : <input className='input-form-command' {...register("target")} name="target"/></label>
                    <select {...register("cmd")} name="cmd" >
                        <option value="+b">Blocked</option>
                        <option value="-b">Unblocked</option>
                    </select>
                    <label>Time : <input className='input-form-command' {...register("time")} name="time"/></label>
                    <input className='submit-button-form' type="submit" value="Submit" />
                </form>
            </label>
        </div>
    );
}
