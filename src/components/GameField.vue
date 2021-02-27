<template>
  <v-container>
    <v-row>
      <v-col cols="8">
        <v-card>
          <v-card-title class="justify-center">
            Лобби: {{ selectedLobby ? selectedLobby.lobbyName : 'не выбрано' }}
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
            <template v-for="(_, x) in fieldSize">
              <div class="d-flex flex-row justify-center" :key="'row-' + x">
                <div v-for="(_, y) in fieldSize" :key="'col-' + y">
                  <v-row no-gutters>
                    <v-col>
                      <v-btn
                          @click="handleStep([x, y], 'player')"
                          :color="btnColor(x, y)"
                          outlined
                          height="100px"
                          width="100px"
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
                          v-if="y !== (fieldSize - 1)"
                          class="barrier-right v-btn--is-elevated"
                          :class="{'selected-barrier': barrierIsSelect([[x, y], [x, y + 1]], 0)}"
                      />
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <div
                        v-if="x !== (fieldSize - 1)"
                        class="barrier-bottom v-btn--is-elevated"
                        :class="{'selected-barrier': barrierIsSelect([[x, y], [x + 1, y]], 1)}"
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
import { mapState } from 'vuex'

export default {
  name: "GameField",
  props: {
    fieldSize: {
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
    }
  },
  computed: {
    ...mapState({
      socket: (state) => state.Common.socket,
      selectedLobby: (state) => state.Common.selectedLobby
    }),
  },
  methods: {
    barrierIsSelect(position, type) {
      return !!this.barriers.find(item =>
          item.type === type &&
          item.position.find(pos => position[0][0] === pos[0] && position[0][1] === pos[1]) &&
          item.position.find(pos => position[1][0] === pos[0] && position[1][1] === pos[1])
      )
    },
    handleStep(position, type = 'barrier') {
      if (!this.move) return
      this.socket.emit('step', {position, type})
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
      console.log('step', data)

      const log = { text: `(${data.position[0] + 1}, ${data.position[1] + 1})` }
      if (!this.move) {
        this.opponentPosition = data.position
        log.key = "Ход соперника"
      }
      else {
        this.position = data.position
        log.key = "Ваш ход"
      }

      this.gameLogs.push(log)
      this.move = !this.move
    })

    this.socket.on('startGame', (params) => {
      console.log('startGame', params)

      this.gameLogs.push(
          {
            text: 'Игра началась'
          },
          {
            key: 'Название лобби',
            text: this.selectedLobby.lobbyName
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
      const { move, startPosition, opponentStartPosition, barriers } = params
      this.move = move
      this.figures = {
        player: this.move ? 'mdi-horse-variant' : 'mdi-cow',
        opponent: !this.move ? 'mdi-horse-variant' : 'mdi-cow',
      }

      this.position = startPosition
      this.opponentPosition = opponentStartPosition
      this.barriers = barriers
    })
  }
}
</script>

<style lang="scss" scoped>
::v-deep .row {
  margin: 0 !important;
}

.barrier-right {
  background-color: #f5f5f5;
  height: 100px;
  width: 10px;
  border-radius: 1px;
}

.barrier-bottom {
  background-color: #f5f5f5;
  width: 100px;
  height: 10px;
  border-radius: 1px;
}

.selected-barrier {
  background: red !important;
}
</style>