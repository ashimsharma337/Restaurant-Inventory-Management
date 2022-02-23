import axios from "axios";

const http = axios.create({
    baseURL: `${process.env.REACT_APP_BASE_URL}`,
    responseType: "json",
    timeout: 30000,
    timeoutErrorMessage: "Response timeout"
})

const getHeaders = (headers) => {
    let ret_headers = {
        "content-type": "application/json"
    };
    return ret_headers;
}

const postItem = (url, data, is_restrict=false, headers = {}) => {
    let post_headers = getHeaders(headers);
    if(is_restrict){
        post_headers.headers = {
            "authorization": localStorage.getItem("att")
        }
    }
    return http.post(url, data, post_headers);
}

const getItems = (url, params = {}) => {
    let post_headers = getHeaders(params);
     return http.get(url, post_headers);
}

const deleteItem = (url, is_strict=false) => {
    let headers = getHeaders();
    if(is_strict){
        headers.headers = {
           "authorization": localStorage.getItem("att")
        }
    }
    return http.delete(url, headers);
}

const getItemById = (url, is_strict=false) => {
    let headers = getHeaders();
    if(is_strict){
        headers.headers = {
           "authorization": localStorage.getItem("att")
        }
    }
    return http.get(url, headers);
}

const updateById = (url, data, is_strict=false) => {
    let headers = getHeaders();
    if(is_strict){
        headers.headers = {
           "authorization": localStorage.getItem("att")
        }
    }
    return http.put(url, data, headers);
}

export const httpRequest = {
    postItem,
    getItems,
    deleteItem,
    getItemById,
    updateById
};