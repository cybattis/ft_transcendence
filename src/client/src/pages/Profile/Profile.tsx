import "./Profile.css";
import { useLoaderData } from "react-router-dom";
import { UserInfo } from "../../type/user.type";
import { Avatar } from "../../components/Avatar";
import { XPBar } from "../../components/XPBar/XPBar";
import {
  GameStatsHeader,
  GameStatsItem,
} from "../../components/Game/GameStats/GameStatsItem";
import { calculateWinrate } from "../../utils/calculateWinrate";
import { GameStatsDto } from "../../type/game.type";

export function Profile() {
  // TODO: check token validity

  let data = useLoaderData() as UserInfo;
  const winrate: number = calculateWinrate(data);

  console.log(data);

  return (
    <div className={"profilePage"}>
      <div id={"infobox"}>
        <Avatar size="200px" img={data.avatarUrl} />
        <div id="info">
          <h1 id={"nickname"}>{data.nickname}</h1>
          <div>LVL {data.level}</div>
          <p>{data.xp} xp</p>
          <XPBar xp={data.xp} lvl={data.level} />
        </div>
      </div>
      <div id={"stats"}>
        <div id={"elo"} className={"dataBox"}>
          <div>ELO</div>
          <div>{data.ranking}</div>
        </div>
        <div id={"gamePlayed"} className={"dataBox"}>
          <div>Game played</div>
          <div>{data.games?.length}</div>
        </div>
        <div id={"winrate"} className={"dataBox"}>
          <div>Winrate</div>
          <div>{winrate}%</div>
        </div>
      </div>
      <div className={"gamesStatsBox"}>
        <h5 id={"gamesStatsBoxTitle"}>Matche history</h5>
        <hr id={"hrbar"} />
        <GameStatsHeader />
        <div className={"matchesTable"}>
          {data.games?.map((game: GameStatsDto, index) => (
            <div key={index}>
              <GameStatsItem game={game} id={data.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
