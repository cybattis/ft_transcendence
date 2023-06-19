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

        let channel = document.getElementById("container-all-join");
        let operator = document.getElementById("container-all-operator");
        let prv = document.getElementById("container-all-private");
        let ban = document.getElementById("container-all-ban");
        let kick = document.getElementById("container-all-kick");
        let blocked = document.getElementById("container-all-blocked");
        let quit = document.getElementById("container-quit-channel");
        let focus = document.getElementById("target-ban");
        if (banElement && channel && operator && prv && ban && kick && blocked && quit && focus) {
            if (banElement.style.display === 'block')
                close();
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
                focus.focus();
                channel.style.order = '0';
                prv.style.order = '1';
                operator.style.order = '2';
                kick.style.order = '4';
                ban.style.order = '3';
                blocked.style.order = '5';
                quit.style.order = '6';
            }
        }
    }

    function close(){
        let banElement = document.getElementById("container-ban-channel");
        let channel = document.getElementById("container-all-join");
        let operator = document.getElementById("container-all-operator");
        let prv = document.getElementById("container-all-private");
        let ban = document.getElementById("container-all-ban");
        let kick = document.getElementById("container-all-kick");
        let blocked = document.getElementById("container-all-blocked");
        let quit = document.getElementById("container-quit-channel");

        if (banElement && channel && operator && prv && ban && kick && blocked && quit) {
            banElement.style.display = 'none';
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
        <div id="container-all-ban">
            <div onClick={blocDoOperator} className="button-action-form">
                <img className="logo-chat" src={ban} alt="Ban" title={"Ban"} />
            </div>
            <label id="container-ban-channel">
                <button className={"button-close-cmd"} onClick={close}>X</button>
                <h4 className={"cmd-container-channel"}>Ban</h4>
                <form
                    className="form-action"
                    onSubmit={handleSubmit((data) => onSubmit(data.target, data.selectAct, data.time))}
                >
                    <input id="target-ban" className='input-form-command' {...register("target")} placeholder={'Target'} name="target"/>
                    <select {...register("selectAct")} name="selectAct" >
                        <option value="+b">Ban</option>
                        <option value="-b">Unban</option>
                    </select>
                    <input placeholder={'time'} className='input-form-command' {...register("time")} name="time"/>
                    <input className='submit-button-form' type="submit" value="Submit" />
                </form>
            </label>
        </div>
    );
}
