import React, { useState } from 'react';
import "./MyChannelList.css"

interface ChannelListProps {
    onStringChange: (newString: string) => void;
    channelList: string [];
}

export default function MyChannelList({ channelList, onStringChange }: ChannelListProps) {
    const [inputValue, setInputValue] = useState('');

    function choiceCanal(value: string) {
        console.log(`input : ${value}`);
        let principal = document.getElementById('canal');
        if (principal) principal.innerHTML = value;
        setInputValue(value);
        onStringChange(value);
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
