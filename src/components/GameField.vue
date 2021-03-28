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
      position: [],
      opponentPosition: [],
      move: false,
      figures: {},

      gameLogs: [],

      barriers: [],
      classPlayer: null,
      classBarriers: []
    }
  },
  computed: {
    ...mapState({
      socket: (state) => state.Common.socket,
      selectedLobby: (state) => state.Common.selectedLobby,
      clientName: (state) => state.Common.clientName
    }),
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
    handleStep(position) {
      if (!this.move) return
      this.socket.emit('step', {
        position,
        width: this.width,
        height: this.height,
        barriers: this.barriers,
      })
      console.warn('obs: ', this.classPlayer.expandObstacles())
    },
    leaveLobby() {
      this.socket.emit('leaveLobby', {
        lobbyId: this.selectedLobby._id
      })
      this.resetGame()
    },

    resetGame() {
      this.position = []
      this.opponentPosition = []
      this.move = false
      this.figures = {}
      this.barriers = []
    },

    btnColor(x, y) {
      return (x === this.position[0] && y === this.position[1] && 'green') ||
          (x === this.opponentPosition[0] && y === this.opponentPosition[1] && 'red') || ''
    },
  },
  mounted() {
    this.socket.on('step', (data) => {
      console.warn('step: ', data)

      const log = {text: `(${data.position[0] + 1}, ${data.position[1] + 1})`}
      if (!this.move) {
        this.opponentPosition = data.position
        log.key = "Ход соперника"
      } else {
        this.position = data.position
        log.key = "Ваш ход"
      }

      this.gameLogs.push(log)
      this.move = !this.move
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
            key: 'Количество препятсвий игры',
            text: this.selectedLobby.gameBarrierCount
          },
          {
            key: 'Количество препятсвий игрока',
            text: this.selectedLobby.playerBarrierCount
          }
      )
      const { move, position, opponentPosition, barriers, height, width } = params

      this.classBarriers = []
      barriers.forEach(barrier => {
        this.classBarriers.push(new Obstacle(barrier[0][0], barrier[0][1], barrier[1][0], barrier[1][1]))
        this.classBarriers.push(new Obstacle(barrier[2][0], barrier[2][1], barrier[3][0], barrier[3][1]))
      })
      const player = new Player('1093')
      player.initialization(
          width, height,
          position[0], position[1], opponentPosition[0],
          opponentPosition[1], 3, this.classBarriers
      )
      this.classPlayer = player
      this.move = move
      this.figures = {
        player: this.move ? 'mdi-horse-variant' : 'mdi-cow',
        opponent: !this.move ? 'mdi-horse-variant' : 'mdi-cow',
      }

      this.position = position
      this.opponentPosition = opponentPosition
      this.barriers = barriers
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