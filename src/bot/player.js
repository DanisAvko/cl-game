export default class Player {
    constructor(name) {
        this.name = name
        this.version = "version 0.1"
        this.myX = -1
        this.myY = -1
        this.opponentX = -1
        this.opponentY = -1
        this.sizeX = -1
        this.sizeY = -1
        this.obstacles = []
        this.maxObstacles = -1
        this.myGoalRow = -1
        this.myObstacles = 0
    }

    initialization(sizeX, sizeY, myX, myY, opponentX, opponentY, maxObstacles, listOfObstacles) {
        this.sizeX = sizeX
        this.sizeY = sizeY
        this.myX = myX
        this.myY = myY
        this.opponentX = opponentX
        this.opponentY = opponentY
        this.maxObstacles = maxObstacles
        this.obstacles = listOfObstacles
        this.myObstacles = 0

        this.myGoalRow = this.myY === 0 ? sizeY - 1 : 0
    }

    isInBoard(x, y) {
        // TODO: возвращает True, если позиция (x, y) внутри доски
        return x >= 0 && x < this.sizeX && y >= 0 && y < this.sizeY
    }

    isObstacleAbsent(fromX, fromY, toX, toY) {
        return !this.obstacles.find(obstacle => {
            return obstacle.fromX === fromX && obstacle.fromY === fromY &&
                obstacle.toX === toX && obstacle.toY === toY
        })
    }

    canPlayerMove(x, y) {
        // TODO: возвращает True, если игрок может сделать ход из (this.myX, this.myY) на клетку (x, y)
        return (this.myX !== x && this.myY !== y) &&
            this.isInBoard(x, y) &&
            ((Math.abs(this.myX - x) === 1 && this.myY === y) || (Math.abs(this.myY - y) === 1 && this.myX === x)) &&
            this.isObstacleAbsent(this.myX, this.myY, x, y)
    }

    expandPlayer() {
        /* TODO: Возвращает список из набора координат (x, y), куда игрок может сделать ход из текущей позиции.
             Результат Может быть пустым. */
        let allMoves = [[this.myX + 1, this.myY], [this.myX - 1, this.myY], [this.myX, this.myY + 1], [this.myX, this.myY - 1]]
        let myMoves = allMoves.filter(move => {
            return this.canPlayerMove(move[0], move[1])
        })
        return myMoves
    }

    expandObstacles() {
        /* TODO: Возвращает список из наборов (o1,o2) всех возможных вариантов установки препятствий.
            Результат может быть пустым. */
        let myObstacles = []
        return myObstacles
    }

    opponentMove(moveType, result) {
        if (moveType == 1) {
            //соперник передвинул фишку, обновляем информацию о координатах
            this.opponentX = result[0]
            this.opponentY = result[1]
        } else if (moveType == 2) {
            // соперник установил новое препятствие
            if (result.length === 2) {
                this.obstacles.push(result[0])
                this.obstacles.push(result[1])
            } else {
                // этого быть не должно, ошибка!
                print("Error, opponent returned wrong move!!")
            }
        } else {
            //Соперник пропустил ход
            print("Opponent return None")
        }
    }

    makeMove() {

    }
}