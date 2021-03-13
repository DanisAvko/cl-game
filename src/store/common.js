import {
    SET_SOCKET,

    SET_LOBBY_lIST,
    UPDATE_LOBBY,
    DELETE_LOBBY,
    ADD_LOBBY,

    SET_SELECTED_LOBBY,
} from "./mutations-types";
import { io } from "socket.io-client";
const url =  process.env['VUE_APP_API_URL']
import Vue from 'vue'

const state = {
    lobbyList: [],

    selectedLobby: null,

    socket: null,

    clientName: 'Mataninja'
}

const mutations = {
    [SET_SOCKET]: (state, payload) => {
        state.socket = payload
    },

    [SET_LOBBY_lIST]: (state, payload) => {
        state.lobbyList = payload
    },
    [UPDATE_LOBBY]: (state, payload) => {
        let lobbyInd = state.lobbyList.findIndex(item => item._id === payload._id)

        if (lobbyInd !== -1) {
            Vue.set(state.lobbyList, lobbyInd, payload)
            if (state.selectedLobby && state.lobbyList[lobbyInd]._id === state.selectedLobby._id) {
                state.selectedLobby = payload
            }
        }
    },
    [DELETE_LOBBY]: (state, payload) => {
        state.lobbyList = state.lobbyList.filter(item => item._id !== payload._id)
    },
    [ADD_LOBBY]: (state, payload) => {
        state.lobbyList.unshift(payload)
    },

    [SET_SELECTED_LOBBY]: (state, payload) => {
        state.selectedLobby = payload
    },
}

const actions = {
    getLobbyList({ dispatch, commit }) {
        return dispatch('getRequest', {
            method: 'lobby'
        }).then((response) => {
            commit(SET_LOBBY_lIST, response)

            return response
        })
    },
    createLobby({ dispatch }, payload) {
        return dispatch('postRequest', {
            method: 'lobby',
            data: payload
        }).then((response) => {
            return response
        })
    },
    deleteLobby({ dispatch, commit }, payload) {
        return dispatch('postRequest', {
            method: 'deletelobby',
            data: {
                id: payload._id
            }
        }).then((response) => {
            commit(DELETE_LOBBY, payload)

            return response
        })
    },
    initSocket({ commit }, { query }) {
        const socket = io(url, { query })

        socket.on('connection', (data) => {
            console.warn('socket.connection: ', data?.message); //
        })

        commit('SET_SOCKET', socket)
    }
}

export default {
    state,
    mutations,
    actions
}