import React, { useState } from 'react';
import "./ChannelList.css"

interface ChannelListProps {
    onStringChange: (newString: string) => void;
    channelList: string [];
}

export default function ChannelList({ channelList, onStringChange }: ChannelListProps) {

    function choiceCanal(value: string) {
        let principal = document.getElementById('canal');
        let focus = document.getElementById('focus-principal-chat');
        if (principal)
            principal.innerHTML = value;
        onStringChange(value);
        if (focus)
            focus.focus();
    }

    return (
            <div className='choice-canal-container'>
                {channelList.map((channel) => (
                    <button className="channel-waiting" key={channel} onClick={() => choiceCanal(channel)} value={channel}>
                        {channel}
                    </button>
                ))}
            </div>
    );
}