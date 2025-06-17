// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GameContract1 {
    enum GameStatus {
        Active,
        InProgress,
        Ended
    }

    struct Game {
        address creator;
        address[] players;
        uint256 stakeAmount;
        GameStatus status;
        mapping(address => bool) isEliminated;
    }

    Game[] public games;

    uint256 public constant MAX_PLAYERS = 5; // 1 creator + 4 joiners

    event GameCreated(uint256 indexed gameId, uint256 stakeAmount);
    event PlayerJoined(uint256 indexed gameId, address player);
    event PlayerEliminated(uint256 indexed gameId, address player);
    event GameStarted(uint256 indexed gameId);
    event GameWon(uint256 indexed gameId, address winner);

    modifier gameExists(uint256 gameId) {
        require(gameId < games.length, "Game does not exist");
        _;
    }

    // Create a new game room
    function createGameRoom(uint256 stakeAmount) external payable {
        require(msg.value == stakeAmount, "Stake amount must match sent value");
        require(stakeAmount > 0, "Stake must be greater than zero");

        games.push();
        uint256 gameId = games.length - 1;

        Game storage game = games[gameId];
        game.creator = msg.sender;
        game.stakeAmount = stakeAmount;
        game.status = GameStatus.Active;

        game.players.push(msg.sender); // Creator auto-joins

        emit GameCreated(gameId, stakeAmount);
        emit PlayerJoined(gameId, msg.sender);
    }

    // Join an existing game room
    function joinGameRoom(uint256 gameId) external payable gameExists(gameId) {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Active, "Game is not joinable");
        require(game.players.length < MAX_PLAYERS, "Game is full");
        require(msg.value == game.stakeAmount, "Stake amount must match");
        require(!isPlayerInGame(game, msg.sender), "Already joined");

        game.players.push(msg.sender);
        emit PlayerJoined(gameId, msg.sender);
    }

    // Anyone can start the game if 5 players joined
    function startGame(uint256 gameId) external gameExists(gameId) {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Active, "Game is not active");
        require(game.players.length == MAX_PLAYERS, "Not enough players");

        game.status = GameStatus.InProgress;

        emit GameStarted(gameId);
    }

    // Spin the roulette (only during in-progress game)
    function spinRoulette(uint256 gameId) external gameExists(gameId) {
        Game storage game = games[gameId];
        require(
            game.status == GameStatus.InProgress,
            "Game is not in progress"
        );
        require(game.players.length > 1, "Not enough players");

        // Pick a random player to eliminate
        uint256 eliminatedIndex = random(game.players.length);
        address eliminatedPlayer = game.players[eliminatedIndex];

        require(
            !game.isEliminated[eliminatedPlayer],
            "Player already eliminated"
        );

        game.isEliminated[eliminatedPlayer] = true;
        emit PlayerEliminated(gameId, eliminatedPlayer);

        // Remove eliminated player
        game.players[eliminatedIndex] = game.players[game.players.length - 1];
        game.players.pop();

        // Check if game ends (only 1 player left)
        if (game.players.length == 1) {
            game.status = GameStatus.Ended;

            address winner = game.players[0];
            uint256 totalPrize = game.stakeAmount * MAX_PLAYERS;

            (bool success, ) = winner.call{value: totalPrize}("");
            require(success, "Prize transfer failed");

            emit GameWon(gameId, winner);
        }
    }

    // View current players in a game (for frontend)
    function getPlayers(
        uint256 gameId
    ) external view gameExists(gameId) returns (address[] memory) {
        return games[gameId].players;
    }

    // View game details (for frontend)
    function getGameStatus(
        uint256 gameId
    )
        external
        view
        gameExists(gameId)
        returns (
            address creator,
            uint256 stakeAmount,
            GameStatus status,
            uint256 playerCount
        )
    {
        Game storage game = games[gameId];
        return (
            game.creator,
            game.stakeAmount,
            game.status,
            game.players.length
        );
    }

    // View all active game rooms (for frontend lobby display)
    function getAllActiveGames()
        external
        view
        returns (uint256[] memory activeGameIds)
    {
        uint256 count = 0;
        for (uint256 i = 0; i < games.length; i++) {
            if (games[i].status == GameStatus.Active) {
                count++;
            }
        }

        activeGameIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < games.length; i++) {
            if (games[i].status == GameStatus.Active) {
                activeGameIds[index] = i;
                index++;
            }
        }
        return activeGameIds;
    }

    // Internal helper: Check if player already joined
    function isPlayerInGame(
        Game storage game,
        address player
    ) internal view returns (bool) {
        for (uint256 i = 0; i < game.players.length; i++) {
            if (game.players[i] == player) {
                return true;
            }
        }
        return false;
    }

    // Randomness (simple for demo - use Chainlink VRF for production)
    function random(uint256 max) internal view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        msg.sender
                    )
                )
            ) % max;
    }

    // Reject accidental ether
    receive() external payable {
        revert("Direct transfers not allowed");
    }
}
