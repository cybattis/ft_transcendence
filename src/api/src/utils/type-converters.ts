import { User } from "../user/entity/Users.entity";
import {
  UserCredentials,
  UserFriend,
  UserFriendsData,
  UserInfo,
  UserSettings
} from "../type/user.type";
import { Game} from "../game/entity/Game.entity";
import { GameStats } from "../type/game.type";

export namespace TypeConverters {
  function fromGameToGameStats(game: Game): GameStats {
    return {
      type: game.type,
      mode: game.mode,
      ids: game.ids,
      scoreP1: game.scoreP1,
      scoreP2: game.scoreP2,
      status: game.status,
      creationDate: game.creationDate.toDateString(),
    };
  }

  export function fromUserToUserInfo(user: User): UserInfo {
    return {
      id: user.id,
      nickname: user.nickname,
      xp: user.xp,
      level: user.level,
      ranking: user.ranking,
      avatarUrl: user.avatarUrl,
      games: user.games.map((game) => { return fromGameToGameStats(game); }),
      friendsId: user.friendsId,
      requestedId: user.requestedId,
      blockedId: user.blockedId,
      blockedById: user.blockedById,
      totalGameWon: user.totalGameWon,
      paddleColor: user.paddleColor,
    }
  }

  export function fromUserToUserSettings(user: User): UserSettings {
    return {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      authActivated: user.authActivated,
    }
  }

  export function fromUserToUserFriend(user: User): UserFriend {
    return {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      inGame: user.inGame,
      online: user.online,
    }
  }

  export function fromUserToUserFriendsData(user: User): UserFriendsData {
    return {
      id: user.id,
      friendsId: user.friendsId,
      requestedId: user.requestedId,
      blockedId: user.blockedId,
      blockedById: user.blockedById,
      blockedChat: user.blockedChat,
    }
  }

  export function fromUserToUserCredentials(user: User): UserCredentials {
    return {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      password: user.password,
      isIntra: user.IsIntra,
      isVerified: user.isVerified,
    }
  }
}