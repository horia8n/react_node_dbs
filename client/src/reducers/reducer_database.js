import { SELECTED_DATABASE } from "../actions/index";

export default function(state=null, action){
    console.log('reducer action', action);
    switch (action.type){
        case SELECTED_DATABASE:
            return action.payload;
        default:
            return state;
    }
}