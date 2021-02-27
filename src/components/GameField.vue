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
                      <v-btn
                          v-if="y !== (fieldSize - 1)"
                          height="100px"
                          @click="addBarrier([x, y], 'right')"
                          tile
                          class="barrier-btn-right"
                          :class="{'selected-barrier': barrierIsSelect([x, y], 'right')}"
                      />
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-btn
                        v-if="x !== (fieldSize - 1)"
                        @click="addBarrier([x, y], 'bottom')"
                        class="barrier-btn-bottom"
                        tile
                        width="100px"
                        style="float: bottom"
                        :class="{'selected-barrier': barrierIsSelect([x, y], 'bottom')}"
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
        <v-card height="100%">
          <v-card-title class="justify-center">
            Статус игры
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapState} from 'vuex'

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

      barriers: [],
      selectedBarriers: []
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
      return !!this.selectedBarriers.find(item =>
          item.position[0] === position[0] && item.position[1] === position[1] && item.type === type
      )
    },
    addBarrier(position, type) {
      let barrierInd = this.selectedBarriers.findIndex(item =>
          item.position[0] === position[0] && item.position[1] === position[1] && item.type === type
      )

      if (barrierInd === -1) {
        this.selectedBarriers.push({position, type})
      } else {
        this.selectedBarriers.splice(barrierInd, 1)
      }
    },
    handleStep(position, type = 'barrier') {
      if (!this.move) return
      this.socket.emit('step', {position, type})
      this.position = position
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
      this.selectedBarriers = []
    },

    btnColor(x, y) {
      return (x === this.position[0] && y === this.position[1] && 'green') ||
          (x === this.opponentPosition[0] && y === this.opponentPosition[1] && 'red') || ''
    },
  },
  mounted() {
    this.socket.on('step', data => {

      console.log('step', data)
      if (!this.move) this.opponentPosition = data.position
      else this.position = data.position

      this.move = !this.move
    })

    this.socket.on('startGame', (params) => {
      const {first, startPosition, opponentStartPosition} = params
      this.move = first
      this.figures = {
        player: this.move ? 'mdi-horse-variant' : 'mdi-cow',
        opponent: !this.move ? 'mdi-horse-variant' : 'mdi-cow',
      }

      this.position = [this.move ? 0 : this.fieldSize - 1, startPosition]
      this.opponentPosition = [!this.move ? 0 : this.fieldSize - 1, opponentStartPosition]
    })
  }
}
</script>

<style lang="scss" scoped>
::v-deep .row {
  margin: 0 !important;
}

.barrier-btn-right {
  min-width: 10px !important;
  max-width: 10px !important;
  padding: 0 !important;
}

.barrier-btn-bottom {
  min-height: 10px !important;
  max-height: 10px !important;
  padding: 0 !important;
}

.selected-barrier {
  background: red !important;
}
</style>