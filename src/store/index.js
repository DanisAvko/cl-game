import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import Common from './common'

Vue.use(Vuex)

export const url = process.env.VUE_APP_API_URL + '/api/'

const store = new Vuex.Store({
    modules: {
        Common
    },
    actions: {
        getRequest(store, payload) {
            let config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            }

            return axios.get(
                url + payload.method,
                config
            ).then(response => {
                return response.data.data
            })
        },
        postRequest(store, payload) {
            let config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            }

            return axios.post(
                url + payload.method,
                payload.data,
                config
            ).then(response => {
                return response.data.data
            })
        },
    }
})

export default store