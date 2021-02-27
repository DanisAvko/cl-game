<template>
  <v-app>
    <v-container>
      <LobbyList/>
      <v-divider/>
      <GameField :field-size="fieldSize" class="mt-8"/>
    </v-container>
  </v-app>
</template>

<script>
import LobbyList from "./components/LobbyList";
import GameField from "@/components/GameField";
import {mapState} from "vuex";

export default {
  name: 'App',
  components: {LobbyList, GameField},
  computed: {
    ...mapState({
      selectedLobby: (state) => state.Common.selectedLobby
    }),
    fieldSize() {
      return this.selectedLobby ? this.selectedLobby.fieldSize : 6
    }
  },
  created() {
    this.$store.dispatch('initSocket')
  }
};
</script>
