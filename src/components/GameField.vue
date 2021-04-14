<template>
  <v-container>
    <v-row>
      <v-col cols="8">
        <v-card>
          <v-card-title class="justify-center">
            Лобби: {{ selectedLobby ? selectedLobby.name : 'не выбрано' }}
            <v-btn
                v-if="selectedLobby"
                @click="leaveLobby()"
                title="Покинуть"
                icon
            >
              <v-icon size="30">
                mdi-exit-to-app
              </v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <template v-for="(_, x) in height">
              <div class="d-flex flex-row justify-center" :key="'row-' + x">
                <div v-for="(_, y) in width" :key="'col-' + y">
                  <v-row no-gutters>
                    <v-col>
                      <v-btn
                          @click="handleStep([x, y])"
                          :color="btnColor(x, y)"
                          outlined
                          class="field-cell"
                      >
                        <v-icon
                            v-if="x === position[0] && y === position[1]"
                            key="player-1" x-large
                        >
                          {{ figures.player }}
                        </v-icon>
                        <v-icon
                            v-if="x === opponentPosition[0] && y === opponentPosition[1]"
                            key="player-2" x-large
                        >
                          {{ figures.opponent }}
                        </v-icon>
                      </v-btn>
                    </v-col>
                    <v-col>
                      <div
                          v-if="y !== (width - 1)"
                          class="barrier-right v-btn--is-elevated"
                          :class="{'selected-barrier': barrierIsSelect([x, y], [x, y + 1])}"
                      />
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <div
                        v-if="x !== (height - 1)"
                        class="barrier-bottom v-btn--is-elevated"
                        :class="{'selected-barrier': barrierIsSelect([x, y], [x + 1, y])}"
                    />
                  </v-row>
                </div>
              </div>
            </template>
          </v-card-text>
          <v-card-actions class="justify-center">
            <div v-if="!selectedLobby">Ожидание игры</div>
            <div v-else-if="selectedLobby.playersCount === 1">Ожидание соперника</div>
            <div v-else>
              <span v-if="move">Ваш ход</span>
              <span v-else>Ход противника</span>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card>
          <v-card-title class="justify-center">
            <span class="mr-1">История игры</span>
            <v-btn @click="gameLogs = []" icon title="Очистить">
              <v-icon>
                mdi-broom
              </v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text style="height: 600px; max-height: 800px; overflow: auto">
            <v-list>
              <v-list-item v-for="(log, i) in gameLogs" :key="i" style="font-size: 16px">
                <div v-if="log.key" class="font-weight-bold mr-1">
                  {{ log.key + ': ' }}
                </div>
                <div :class="{'font-weight-bold': !log.key}">
                  {{ log.text }}
                </div>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapState} from 'vuex'
import Obstacle from "@/bot/obstacle";
import Player from "@/bot/player";

export default {
  name: "GameField",
  props: {
    width: {
      type: Number
    },
    height: {
      type: Number
    }
  },
  data() {
    return {
      move: false,
      figures: {},

      gameLogs: [],

      barriers: [],
      player: null
    }
  },
  computed: {
    ...mapState({
      socket: (state) => state.Common.socket,
      selectedLobby: (state) => state.Common.selectedLobby,
      clientName: (state) => state.Common.clientName
    }),
    position() {
      return this.player ? [this.player.myX, this.player.myY] : []
    },
    opponentPosition() {
      return this.player ? [this.player.opponentX, this.player.opponentY] : []
    }
  },
  methods: {
    comparePoint(p1, p2) {
      return p1[0] === p2[0] && p1[1] === p2[1]
    },
    barrierIsSelect(fromPoint, toPoint) {
      return !!this.barriers.find(barrier => {
        if (
            (this.comparePoint(barrier[0], fromPoint) && this.comparePoint(barrier[1], toPoint)) ||
            (this.comparePoint(barrier[0], toPoint) && this.comparePoint(barrier[1], fromPoint))
        ) return true
        else if (
            (this.comparePoint(barrier[2], fromPoint) && this.comparePoint(barrier[3], toPoint)) ||
            (this.comparePoint(barrier[2], toPoint) && this.comparePoint(barrier[3], fromPoint))
        ) return true

        return false
      })
    },
    handleStep({data, type}) {
      if (!this.move) return
      if (type === 'player') {
        this.socket.emit('step', {
          position: data,
          width: this.width,
          height: this.height,
          barriers: this.barriers,
        })
      } else {
        let tnp = [...this.barriers,[
          [data[0].fromX, data[0].fromY],
          [data[0].toX, data[0].toY],
          [data[1].fromX, data[1].fromY],
          [data[1].toX, data[1].toY],
        ]]
        this.socket.emit('step', {
          position: [this.player.myX, this.player.myY],
          width: this.width,
          height: this.height,
          barriers: tnp,
        })
      }


    },
    leaveLobby() {
      this.socket.emit('leaveLobby', {
        lobbyId: this.selectedLobby._id
      })
      this.resetGame()
    },

    resetGame() {
      this.player = null

      this.move = false
      this.figures = {}
      this.barriers = []
    },

    btnColor(x, y) {
      return (x === this.position[0] && y === this.position[1] && 'green') ||
          (x === this.opponentPosition[0] && y === this.opponentPosition[1] && 'red') || ''
    },

    alg1() {
      const expand = this.player.expandPlayer()
      if (this.figures.player !== 'mdi-cow') {
        let step = null
        step = expand.find(move => move[0] === this.player.myX + 1 && move[1] === this.player.myY)
        if (step) return step
        step = expand.find(move => move[0] === this.player.myX && move[1] === this.player.myY + 1)
        if (step) return step
        step = expand.find(move => move[0] === this.player.myX && move[1] === this.player.myY - 1)
        if (step) return step
        step = expand.find(move => move[0] === this.player.myX - 1 && move[1] === this.player.myY)
        if (step) return step
        return [this.player.myX, this.player.myY]
      } else {
        let step = null
        step = expand.find(move => move[0] === this.player.myX - 1 && move[1] === this.player.myY)
        if (step) return step
        step = expand.find(move => move[0] === this.player.myX && move[1] === this.player.myY + 1)
        if (step) return step
        step = expand.find(move => move[0] === this.player.myX && move[1] === this.player.myY - 1)
        if (step) return step
        step = expand.find(move => move[0] === this.player.myX + 1 && move[1] === this.player.myY)
        if (step) return step
        return [this.player.myX, this.player.myY]
      }
    },

    alg2() {
      const expand = this.player.expandPlayer()
      const random = Math.floor(Math.random() * (expand.length))
      const obst = this.player.expandObstacles()

      if (this.player.myObstacles !== this.player.maxObstacles && obst.length !== 0) {
        const random2 = Math.floor(Math.random() * (obst.length))
        this.player.myObstacles++
        return {
          type: 'obst',
          data: obst[random2]
        }
      }

      return {
        type: 'player',
        data: expand.length === 0 ? [this.player.myX, this.player.myY] : expand[random]
      }
    },

    alg3() {
      let myStep = this.player.getEndPlayerSteps(-1,this.player.myGoalRow,  this.player.myX, this.player.myY)
      const expand = this.player.expandPlayer()
      const random = Math.floor(Math.random() * (expand.length))
      const allObst = this.player.expandObstacles()

      let oppGoalRow = this.player.myGoalRow === 0 ? (this.player.sizeX - 1) : 0
      let oppStep = this.player.getEndPlayerSteps(-1,oppGoalRow,  this.player.opponentX, this.player.opponentY)
      let obst = allObst.filter(item => {
        return !!item.find((i)=> {
          return (i.fromX === oppStep[0][0] &&
              i.fromY === oppStep[0][1] &&
              i.toX === oppStep[1][0] &&
              i.toY === oppStep[1][1]) ||
              (i.toX === oppStep[0][0] &&
                  i.toY === oppStep[0][1] &&
                  i.fromX === oppStep[1][0] &&
                  i.fromY === oppStep[1][1])
        })
      })

      if (this.player.myObstacles !== this.player.maxObstacles && obst.length !== 0 && oppStep.length < myStep.length) {
        const random2 = Math.floor(Math.random() * (obst.length))
        this.player.myObstacles++
        return {
          type: 'obst',
          data: obst[random2]
        }
      }

      return {
        type: 'player',
        data: myStep.length !== 0 && this.player.canPlayerMove(myStep[1][0], myStep[1][1]) ? myStep[1] : expand.length !== 0 ? expand[random] : [this.player.myX, this.player.myY]
      }
    },

    handleMove() {
      return this.alg3()
    }
  },
  mounted() {
    this.socket.on('step', (data) => {
      console.warn('step: ', data)

      const log = {text: `(${data.position[0] + 1}, ${data.position[1] + 1})`}
      if (!this.move) {
        this.barriers = data.barriers
        this.$set(this.player, 'opponentX', data.position[0])
        this.$set(this.player, 'opponentY', data.position[1])
        this.move = !this.move
        const tmpBarriers = []
        data.barriers.forEach(barrier => {
          tmpBarriers.push(new Obstacle(barrier[0][0], barrier[0][1], barrier[1][0], barrier[1][1]))
          tmpBarriers.push(new Obstacle(barrier[2][0], barrier[2][1], barrier[3][0], barrier[3][1]))
        })
        this.$set(this.player, 'obstacles', tmpBarriers)
        setTimeout(() => {
          this.handleStep(this.handleMove())
        }, 1000)

        log.key = "Ход соперника"
      } else {
        this.barriers = data.barriers
        this.$set(this.player, 'myX', data.position[0])
        this.$set(this.player, 'myY', data.position[1])
        this.move = !this.move
        const tmpBarriers = []
        data.barriers.forEach(barrier => {
          tmpBarriers.push(new Obstacle(barrier[0][0], barrier[0][1], barrier[1][0], barrier[1][1]))
          tmpBarriers.push(new Obstacle(barrier[2][0], barrier[2][1], barrier[3][0], barrier[3][1]))
        })
        this.$set(this.player, 'obstacles', tmpBarriers)
        log.key = "Ваш ход"
      }

      this.gameLogs.push(log)
    })

    this.socket.on('startGame', (params) => {
      console.warn('startGame: ', params)

      this.gameLogs.push(
          {
            key: 'Игра началась',
            text: `${this.clientName} vs ${params.opponentName}`
          },
          {
            key: 'Название лобби',
            text: this.selectedLobby.name
          },
          {
            key: 'Размер поля',
            text: `${this.width} x ${this.height}`
          },
          {
            key: 'Количество препятствий игры',
            text: this.selectedLobby.gameBarrierCount
          },
          {
            key: 'Количество препятствий игрока',
            text: this.selectedLobby.playerBarrierCount
          }
      )
      const { move, position, opponentPosition, barriers, height, width, playerBarrierCount } = params

      const tmpBarriers = []
      barriers.forEach(barrier => {
        tmpBarriers.push(new Obstacle(barrier[0][0], barrier[0][1], barrier[1][0], barrier[1][1]))
        tmpBarriers.push(new Obstacle(barrier[2][0], barrier[2][1], barrier[3][0], barrier[3][1]))
      })
      const player = new Player('1093')
      player.initialization(
          height, width,
          position[0], position[1], opponentPosition[0],
          opponentPosition[1], playerBarrierCount, tmpBarriers
      )
      this.player = player
      this.move = move
      this.figures = {
        player: this.move ? 'mdi-horse-variant' : 'mdi-cow',
        opponent: !this.move ? 'mdi-horse-variant' : 'mdi-cow',
      }

      this.barriers = barriers

      if (this.move) {
        setTimeout(() => {
          this.handleStep(this.handleMove())
        }, 3000)
      }
    })

    this.socket.on('endGame', data => {
      console.warn('endGame: ', data)
      this.gameLogs.push(
          {
            text: 'Конец игры',
          },
          {
            key: 'Победитель',
            text: data.winnerName
          }
      )
    })
    this.socket.on('randomLobby', data => {
      console.warn('randomLobby', data)
    })
    this.socket.emit('randomLobby')
  }
}
</script>

<style lang="scss" scoped>
::v-deep .row {
  margin: 0 !important;
}

.field-cell {
  height: 80px !important;
  width: 80px !important;
}

.barrier-right {
  background-color: #f5f5f5;
  height: 80px;
  width: 10px;
  border-radius: 1px;
}

.barrier-bottom {
  background-color: #f5f5f5;
  width: 80px;
  height: 10px;
  border-radius: 1px;
}

.selected-barrier {
  background: red !important;
}
</style>