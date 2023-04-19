import React from 'react';
import './App.css';
import {AIOnlyPong} from "./game/AIOnlyPong";

function App() {
	return (
		<>
			<AIOnlyPong name={"pong1"} width={400} height={400} leftDifficulty={"Easy"} rightDifficulty={"Easy"}/>
			<AIOnlyPong name={"pong2"} width={400} height={400} leftDifficulty={"Easy"} rightDifficulty={"Easy"}/>
			<AIOnlyPong name={"pong3"} width={400} height={400} leftDifficulty={"Easy"} rightDifficulty={"Easy"}/>
			<AIOnlyPong name={"pong4"} width={400} height={400} leftDifficulty={"Easy"} rightDifficulty={"Easy"}/>
		</>
	);
}

export default App;
