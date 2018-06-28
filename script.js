export const url = "http://localhost:5000/api/v1";

export function compare(a, b) {
    /* this is the function that compares requests by id and reverses the requests
        array received in the response
        */
    if (a.request_id > b.request_id) {
        return -1;
    }
    if (a.request_id < b.request_id) {
        return 1;
    }
    // a must be equal to b
    return 0;
}