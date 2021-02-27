<template>
  <v-data-table
      :items="lobbyList"
      :headers="headers"
      hide-default-footer
      item-key="_id"
      :items-per-page="-1"
      :loading="loading"
  >
    <template v-slot:item.playersCount="{ item }">
      {{item.playersCount}}/2
    </template>
    <template v-slot:item.status="{ item }">
      {{item.playersCount === 2 ? 'В игре' : 'Ожидание'}}
    </template>
    <template v-slot:item.actions="{ item }">
      <v-btn @click="joinLobby(item)" title="Присоединиться" :disabled="!!selectedLobby" icon>
        <v-icon>
          mdi-connection
        </v-icon>
      </v-btn>
      <v-btn @click="deleteLobby(item)" :disabled="item.playersCount > 0" title="Удалить" icon>
        <v-icon>
          mdi-delete
        </v-icon>
      </v-btn>
    </template>
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Лобби игры</v-toolbar-title>
        <v-divider class="mx-4" inset vertical/>
        <v-spacer/>
        <v-btn
            @click="showCreateLobbyDialog = true"
            color="primary"
        >
          Создать лобби
        </v-btn>

        <CreateLobbyDialog
            :value="showCreateLobbyDialog"
            @close="showCreateLobbyDialog = false"
        />
      </v-toolbar>
    </template>
  </v-data-table>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: "LobbyList",
  components: {
    CreateLobbyDialog: () => import('../dialogs/CreateLobbyDialog')
  },
  data() {
    return {
      showCreateLobbyDialog: false,
      loading: false,
      headers: [
        {
          text: 'Название',
          value: 'lobbyName'
        },
        {
          text: 'Размер поля',
          value: 'fieldSize'
        },
        {
          text: 'Кол-во препятсвий игры',
          value: 'gameBarrierCount'
        },
        {
          text: 'Кол-во препятсвий игрока',
          value: 'playerBarrierCount'
        },
        {
          text: 'Игроки',
          value: 'playersCount',
        },
        {
          text: 'Статус',
          value: 'status'
        },
        {
          text: 'Действия',
          value: 'actions',
          sortable: false
        }
      ]
    }
  },
  computed: {
    ...mapState({
      lobbyList: (state) => state.Common.lobbyList,
      socket: (state) => state.Common.socket,
      selectedLobby: (state) => state.Common.selectedLobby
    })
  },
  methods: {
    joinLobby(item) {
      this.socket.emit('joinLobby', {
        lobbyId: item._id
      })
    },
    deleteLobby(item) {
      this.$store.dispatch('deleteLobby', item)
    },
  },
  mounted() {
    this.loading = true
    this.$store.dispatch('getLobbyList')
        .finally(() => {
          this.loading = false
        })

    this.socket.on('createLobby', (lobby) => {
      this.$store.commit('ADD_LOBBY', lobby)
    })
    this.socket.on('deleteLobby', (lobby) => {
      this.$store.commit('DELETE_LOBBY', lobby)
    })
    this.socket.on('updateLobby', (lobby) => {
      this.$store.commit('UPDATE_LOBBY', lobby)
    })

    this.socket.on('joinLobby', (lobby) => {
      this.$store.commit('SET_SELECTED_LOBBY', lobby)
    })
    this.socket.on('leaveLobby', (message) => {
      this.$store.commit('SET_SELECTED_LOBBY', null)
      console.log('leaveLobbyMessage: ', message)
    })
  }
}
</script>