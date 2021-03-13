<template>
  <v-app>
    <v-container>
      <LobbyList/>
      <v-divider/>
      <GameField :width="width" :height="height" class="mt-8"/>
    </v-container>
  </v-app>
</template>

<script>
import LobbyList from "./components/LobbyList";
import GameField from "@/components/GameField";
import { mapState } from "vuex";


export default {
  name: 'App',
  components: {
    LobbyList,
    GameField
  },
  computed: {
    ...mapState({
      selectedLobby: (state) => state.Common.selectedLobby,
      clientName: (state) => state.Common.clientName
    }),
    width() {
      return this.selectedLobby ? this.selectedLobby.width : 6
    },
    height() {
      return this.selectedLobby ? this.selectedLobby.height : 6
    }
  },
  created() {
    const options = {
      query: {
        name: this.clientName
      }
    }
    this.$store.dispatch('initSocket', options)
  }
};
</script>
