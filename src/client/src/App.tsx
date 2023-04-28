import React from 'react';
import './App.css';
import {AIOnlyPong} from "./game/AIOnlyPong";
import {PracticePong} from "./game/PracticePong";

function App() {
	return (
		<>
			<AIOnlyPong name={"pong1"} width={200} height={250} leftDifficulty={"Easy"} rightDifficulty={"Easy"}/>
			<PracticePong name={"practicePong1"} width={800} height={400} aiDifficulty={"Medium"}/>
		</>
	);
}

export default App;
