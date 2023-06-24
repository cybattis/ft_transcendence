import "./FormAction.css";
import { useForm } from "react-hook-form";
import ban  from "../../../resource/ban.svg";
import React  from 'react';


export default function DoBanChannel({ onSubmit } : any) {
    const { register, handleSubmit, reset} = useForm();
    let banElement = document.getElementById("container-ban-channel");
    let channelElement = document.getElementById("container-create-channel");
    let operatorElement = document.getElementById("container-operator-channel");
    let privateElement = document.getElementById("container-private-message");
    let kickElement = document.getElementById("container-kick-channel");
    let blockedElement = document.getElementById("container-blocked-users");
    let focus = document.getElementById("target-ban");
    function blocDoOperator() {

        if (banElement && focus) {
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
            }
        }
    }

    function close(){
        if (banElement)
            banElement.style.display = 'none';
        reset();
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
                    onSubmit={handleSubmit((data) => {onSubmit(data.target, data.selectAct, data.time); close();})}
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