import React from 'react';
import './App.css';
import {AIOnlyPong} from "./game/AIOnlyPong";

function App() {
	return (
		<>
			<AIOnlyPong name={"pong1"} width={200} height={400} leftDifficulty={"Easy"} rightDifficulty={"Easy"}/>
			<AIOnlyPong name={"pong2"} width={400} height={200} leftDifficulty={"Medium"} rightDifficulty={"Easy"}/>
			<AIOnlyPong name={"pong3"} width={800} height={800} leftDifficulty={"Hard"} rightDifficulty={"Easy"}/>
			<AIOnlyPong name={"pong4"} width={800} height={400} leftDifficulty={"Easy"} rightDifficulty={"Medium"}/>
		</>
	);
}

export default App;
