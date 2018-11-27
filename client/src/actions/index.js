import axios from "axios";
const ROOT_URL = "/api";
export const SELECTED_DATABASE = 'selected_database';
export const FETCH_POSTS = "fetch_posts";
export const FETCH_POST = "fetch_post";
export const UPDATE_POST = "update_post";
export const CREATE_POST = "create_post";
export const DELETE_POST = "delete_post";

export function selectDatabase(database) {
    return {
        type: SELECTED_DATABASE,
        payload: database
    };
}

export function fetchPosts(database) {
    console.log('fetchPosts()');
    const request = axios.get(`${ROOT_URL}/${database}`);
    return {
        type: FETCH_POSTS,
        payload: request
    };
}

export function fetchPost(id, database) {
    console.log('fetchPost(id)');
    const request = axios.get(`${ROOT_URL}/${database}/${id}`);
    return {
        type: FETCH_POST,
        payload: request
    };
}

export function createPost(row, database) {
    console.log('createPost()');
    const request = axios.post(`${ROOT_URL}/${database}/insert`, {row});
    return {
        type: CREATE_POST,
        payload: request
    };
}

export function updatePost(id, row, database) {
    console.log('updatePost()');
    const request = axios.put(`${ROOT_URL}/${database}/${id}`, {row});
    return {
        type: UPDATE_POST,
        payload: request
    };
}

export function deletePost(id, database) {
    console.log('deletePost()');
    console.log('id', id);
    const request = axios.delete(`${ROOT_URL}/${database}/${id}`);
    return {
        type: DELETE_POST,
        payload: request
    };
}