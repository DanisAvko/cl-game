<template>
  <v-dialog v-model="show" width="400px">
    <v-card>
      <v-card-title>
        Создание лобби
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="name" label="Название" outlined/>
        <div>Размеры поля</div>
        <v-text-field v-model.number="width" type="number" label="Ширина" outlined/>
        <v-text-field v-model.number="height" type="number" label="Высота" outlined/>
        <v-text-field v-model.number="gameBarrierCount" type="number" label="Количество препятствий игры" outlined/>
        <v-text-field v-model.number="playerBarrierCount" type="number" label="Количество препятствий игрока" outlined/>
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
      width: null,
      height: null,
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
        width: this.width,
        height: this.height,
        gameBarrierCount: this.gameBarrierCount,
        playerBarrierCount: this.playerBarrierCount,
        name: this.name,
      }).finally(() => {
        this.loading = false
        this.show = false
      })
    }
  }
}
</script>