// import _ from "lodash";
import {FETCH_POSTS, FETCH_POST, CREATE_POST, UPDATE_POST, DELETE_POST} from "../actions";

export default function (state = [], action) {
    switch (action.type) {
        case FETCH_POSTS:
            return action.payload.data;
        case CREATE_POST:
            return action.payload.data;
        case UPDATE_POST:
            return action.payload.data;
        case DELETE_POST:
            return action.payload.data;
        case FETCH_POST:
            return action.payload.data;
        default:
            return state;
    }
}