import "./DoActionChannel.css";
import { useForm } from "react-hook-form";

export default function DoActionChannel({ onSubmit } : any) {
    const { register, handleSubmit} = useForm();
    function createChannelJoin() {
        let privateElement = document.getElementById("container-private-message");
        let channelElement = document.getElementById("container-create-channel");
        if (channelElement) {
            if (channelElement.style.display === 'block')
                channelElement.style.display = 'none';
            else
            {
                if (privateElement) {
                    if (privateElement.style.display === 'block')
                        privateElement.style.display = 'none';
                }
                channelElement.style.display = 'block';
            }
        }
    }

    function createPrivateMess() {
        let channelElement = document.getElementById("container-create-channel");
        let privateElement = document.getElementById("container-private-message");
        if (privateElement) {
            if (privateElement.style.display === 'block')
                privateElement.style.display = 'none';
            else {
                if (channelElement) {
                    if (channelElement.style.display === 'block')
                        channelElement.style.display = 'none';
                }
                privateElement.style.display = 'block';
            }
        }
    }

    return (
        <div className="DoAction">
            <div className="container-option-to-do">
                <div onClick={createChannelJoin} className="ButtonToJoin">
                    Join
                </div>
                <div onClick={createPrivateMess} className="ButtonToPvm">
                    Pvm
                </div>
            </div>
            <div id="container-create-channel">
                <form
                    className="FormCreateChannel"
                    onSubmit={handleSubmit((data) => onSubmit(data))}
                >
                    <input id='input-channel' {...register("channel")} />
                    <input id='input-pwd' type="password" {...register("password")} />
                    <input type="submit" value="Submit" />
                </form>
            </div>
            <div id="container-private-message">
                <form
                    className="FormPrivateMessage"
                    onSubmit={handleSubmit((data) => onSubmit(data))}
                >
                    <input id='input-target' {...register("target")} />
                    <input type="submit" value="Submit" />
                </form>
            </div>
        </div>
    );
}

