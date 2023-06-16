import "./FormAction.css";
import { useForm } from "react-hook-form";
import ban  from "../../../resource/ban.svg";

export default function DoBanChannel({ onSubmit } : any) {
    const { register, handleSubmit} = useForm();
    function blocDoOperator() {
        let banElement = document.getElementById("container-ban-channel");
        let channelElement = document.getElementById("container-create-channel");
        let operatorElement = document.getElementById("container-operator-channel");
        let privateElement = document.getElementById("container-private-message");
        let kickElement = document.getElementById("container-kick-channel");
        let blockedElement = document.getElementById("container-blocked-users");

        if (banElement) {
            if (banElement.style.display === 'block')
                banElement.style.display = 'none';
            else
            {
                if (privateElement && channelElement && operatorElement && kickElement && blockedElement){
                    privateElement.style.display = 'none';
                    operatorElement.style.display = 'none';
                    channelElement.style.display = 'none'
                    kickElement.style.display = 'none';
                    blockedElement.style.display = 'none';
                }
                banElement.style.display = 'block';
            }
        }
    }

    return (
        <div id="container-all-ban">
            <div onClick={blocDoOperator} className="button-action-form">
                <img className="logo-chat" src={ban} alt="Ban" title={"Ban"} />
            </div>
            <label id="container-ban-channel">
                <form
                    className="form-action"
                    onSubmit={handleSubmit((data) => onSubmit(data.target, data.selectAct, data.time))}
                >
                    <label>Target : <input className='input-form-command' {...register("target")} name="target"/></label>
                    <select {...register("selectAct")} name="selectAct" >
                        <option value="+b">Ban</option>
                        <option value="-b">Unban</option>
                    </select>
                    <label>Time : <input className='input-form-command' {...register("time")} name="time"/></label>
                    <input className='submit-button-form' type="submit" value="Submit" />
                </form>
            </label>
        </div>
    );
}
