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
        if (operatorElement) {
            if (operatorElement.style.display === 'block')
                operatorElement.style.display = 'none';
            else
            {
                if (privateElement && channelElement && banElement && blockedElement){
                    privateElement.style.display = 'none';
                    banElement.style.display = 'none';
                    channelElement.style.display = 'none'
                    blockedElement.style.display = 'none';
                }
                operatorElement.style.display = 'block';
            }
        }
    }

    return (
        <div id="container-all-operator">
            <div onClick={blocDoOperator} className="button-action-form">
                <img className="logo-chat" src={operator} alt="Operator" title={"Operator"}/>
            </div>
            <label id="container-operator-channel">
                <form
                    className="form-action"
                    onSubmit={handleSubmit((data) => onSubmit(data.ope, data.selectAct))}
                >
                    <label>Target : <input className='input-form-command' {...register("ope")} name="ope"/></label>
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

