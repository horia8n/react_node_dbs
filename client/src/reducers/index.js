import {combineReducers} from 'redux';
import PostsReducer from './reducer_posts';
import DatabaseReducer from './reducer_database';

const rootReducer = combineReducers({
    posts: PostsReducer,
    database: DatabaseReducer
});

export default rootReducer;
