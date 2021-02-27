<template>
  <v-dialog v-model="show" width="400px">
    <v-card>
      <v-card-title>
        Создание лобби
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="name" label="Название" outlined/>
        <v-text-field v-model.number="size" type="number" label="Размеры поля" outlined/>
        <v-text-field v-model.number="gameBarrierCount" type="number" label="Количество препятсвий игры" outlined/>
        <v-text-field v-model.number="playerBarrierCount" type="number" label="Количество препятсвий игрока" outlined/>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn
            @click="createLobby"
            :loading="loading"
            color="primary"
        >
          Создать
        </v-btn>
        <v-btn
            @click="show = false"
            :disabled="loading"
        >
          Отменить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "CreateLobbyDialog",
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      name: '',
      size: null,
      gameBarrierCount: null,
      playerBarrierCount: null,

      loading: false
    }
  },
  computed: {
    show: {
      get() {
        return this.value
      },
      set() {
        this.$emit('close')
      }
    }
  },
  methods: {
    createLobby() {
      this.loading = true
      this.$store.dispatch('createLobby', {
        fieldSize: this.size,
        gameBarrierCount: this.gameBarrierCount,
        playerBarrierCount: this.playerBarrierCount,
        lobbyName: this.name,
      }).finally(() => {
        this.loading = false
        this.show = false
      })
    }
  }
}
</script>