import "./FormAction.css";
import { useForm } from "react-hook-form";
import operator from "../../../resource/operator.svg";

export default function DoOperator({ onSubmit } : any) {
    const { register, handleSubmit} = useForm();
    function blocDoOperator() {
        let channelElement = document.getElementById("container-create-channel");
        let operatorElement = document.getElementById("container-operator-channel");
        let privateElement = document.getElementById("container-private-message");
        let banElement = document.getElementById("container-ban-channel");
        let blockedElement = document.getElementById("container-blocked-users");
        let kickElement = document.getElementById("container-kick-channel");
        let focus = document.getElementById("focus-ope");

        let channel = document.getElementById("container-all-join");
        let operator = document.getElementById("container-all-operator");
        let prv = document.getElementById("container-all-private");
        let ban = document.getElementById("container-all-ban");
        let kick = document.getElementById("container-all-kick");
        let blocked = document.getElementById("container-all-blocked");
        let quit = document.getElementById("container-quit-channel");
        if (operatorElement && channel && operator && prv && ban && kick && blocked && quit && focus) {
            if (operatorElement.style.display === 'block')
                close();
            else
            {
                if (privateElement && channelElement && banElement && blockedElement && kickElement){
                    privateElement.style.display = 'none';
                    banElement.style.display = 'none';
                    channelElement.style.display = 'none'
                    blockedElement.style.display = 'none';
                    kickElement.style.display = 'none';
                }
                operatorElement.style.display = 'block';
                focus.focus();
                channel.style.order = '0';
                prv.style.order = '1';
                operator.style.order = '3';
                kick.style.order = '2';
                ban.style.order = '4';
                blocked.style.order = '5';
                quit.style.order = '6';
            }
        }
    }

    function close(){
        let operatorElement = document.getElementById("container-operator-channel");
        let channel = document.getElementById("container-all-join");
        let operator = document.getElementById("container-all-operator");
        let prv = document.getElementById("container-all-private");
        let ban = document.getElementById("container-all-ban");
        let kick = document.getElementById("container-all-kick");
        let blocked = document.getElementById("container-all-blocked");
        let quit = document.getElementById("container-quit-channel");
        if (operatorElement && channel && operator && prv && ban && kick && blocked && quit) {
            operatorElement.style.display = 'none';
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
        <div id="container-all-operator">
            <div onClick={blocDoOperator} className="button-action-form">
                <img className="logo-chat" src={operator} alt="Operator" title={"Operator"}/>
            </div>
            <label id="container-operator-channel">
                <button className={"button-close-cmd"} onClick={close}>X</button>
                <h4 className={"cmd-container-channel"}>Operator</h4>
                <form
                    className="form-action"
                    onSubmit={handleSubmit((data) => onSubmit(data.ope, data.selectAct))}
                >
                    <input id="focus-ope" className='input-form-command' {...register("ope")} name="ope" placeholder={"Target"}/>
                    <select {...register("selectAct")} name="selectAct" >
                        <option value="+o">Add operator</option>
                        <option value="-o">Sub operator</option>
                    </select>
                    <input className='submit-button-form' type="submit" value="Submit" />
                </form>
            </label>
        </div>
    );
}

