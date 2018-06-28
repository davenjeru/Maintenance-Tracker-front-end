import {compare, url} from "../script";

// try and get the admin email container
// returns null if document.location != index-admin.html
const adminEmailContainer = document.getElementById('admin_email');

// get the access token from session storage
const accessToken = sessionStorage.getItem('access_token');

// if the admin email container is not null, then we are at the index-admin page
if (adminEmailContainer) {
    // show the admin's email address just because
    adminEmailContainer.innerHTML = sessionStorage.getItem('user');

    // when the window loads, get the requests from the api
    window.onload = getRequests;

    function getRequests() {
        // the admin's  endpoint for fetching requests
        let endpoint = '/requests/';

        // prepare the requests with the right method, mode and access token
        let request = new Request(url + endpoint,
            {
                method: 'GET',
                mode: 'cors',
                headers: new Headers({
                    'ACCESS_TOKEN': accessToken
                }),
            }
        );

        // dispatch the request and get the response
        fetch(request).then(
            responseObject => {
                // if unauthorized for any reason, then go back to login
                if (responseObject.status === 401) {
                    window.location = '../login/index.html';
                }

                // admin is authorized and can view requests
                responseObject.json().then(
                    response => {
                        // show the requests on page
                        showRequests(response.requests)
                    }
                );
            }
        ).catch(error => {
            console.log(error);
        });
    }

    function showRequests(requests) {
        /**
         * @param requests => the array of requests received from the response on fetch
         */
        // reverse the requests array such that the largest id comes first
        requests = requests.sort(compare);

        // get the requests container so as to add them one by one
        const requestsContainer = document.getElementById('requests');

        requests.forEach(request => {
                // create the row we are going to add the request details
                let row = document.createElement('tr');

                // create the column to add the request id and append to the row
                let requestID = document.createElement('td');
                requestID.innerHTML = request.request_id;
                row.appendChild(requestID);

                // create the column to add the email of the person who requested it and append to the row
                let requestedBy = document.createElement('td');
                requestedBy.innerHTML = request.requested_by;
                row.appendChild(requestedBy);

                // create the column to add the request title and append to the row
                let requestTitle = document.createElement('td');
                requestTitle.innerHTML = request.title;
                row.appendChild(requestTitle);

                // create the column to add the request description and append to the row
                let requestDescription = document.createElement('td');
                requestDescription.innerHTML = request.description;
                row.appendChild(requestDescription);

                // create the column to add the request date and append to the row
                let requestDate = document.createElement('td');
                requestDate.innerHTML = request.date_requested;
                row.appendChild(requestDate);

                // create the column to add the request status and append to the row
                let requestStatus = document.createElement('td');
                requestStatus.innerHTML = request.status;
                row.appendChild(requestStatus);

                // create the column to add the buttons for responding to requests and append to the row
                let requestActions = document.createElement('td');
                if (request.status === 'Pending Approval') {
                    // if the request is pending approval, then two buttons are added:
                    // approve button
                    let approveButton = document.createElement('button');
                    approveButton.className = 'btn btn-success';
                    approveButton.innerHTML = 'Approve';
                    approveButton.onclick = respondRequest;
                    requestActions.appendChild(approveButton);

                    // disapprove button
                    let disapproveButton = document.createElement('button');
                    disapproveButton.className = 'btn btn-danger';
                    disapproveButton.innerHTML = 'Disapprove';
                    disapproveButton.onclick = respondRequest;
                    requestActions.appendChild(disapproveButton);
                } else if (request.status === 'Approved') {
                    // if the request is approved, then we add the resolve button
                    let resolveButton = document.createElement('button');
                    resolveButton.className = 'btn btn-neutral';
                    resolveButton.innerHTML = 'Resolve';
                    resolveButton.onclick = respondRequest;
                    requestActions.appendChild(resolveButton);
                } else if (request.status === 'Disapproved' || request.status === 'Resolved') {
                    // if the request is disapproved or resolved then no actions are possible
                    requestActions.innerHTML = '-'
                }
                row.appendChild(requestActions);
                // add this row to the requests container
                requestsContainer.appendChild(row);
            }
        );
    }
}

function respondRequest(event) {
    /**
     * @param event => the event that triggers this function
     */
        // get the request id from the parent element of the button that triggered this function
    const requestID = event.toElement.parentElement.parentElement.firstChild.innerHTML;

    // get the action in lower case for building the URL
    const action = event.toElement.innerHTML.toLowerCase();

    // endpoint for responding to url
    let endpoint = `/requests/${requestID}/${action}`;

    // build the request with the right method(PUT), mode(cors) and access token
    let request = new Request(url + endpoint,
        {
            method: 'PUT',
            mode: 'cors',
            headers: new Headers({
                'ACCESS_TOKEN': accessToken
            }),
        }
    );

    // dispatch the request
    fetch(request).then(
        responseObject => {
            if (responseObject.status === 401) {
                // if unauthorized then return to login page
                window.location = '../login/index.html';
            } else if (responseObject.status === 409) {
                // if there is a conflict then reload the whole page
                window.location.reload(true);
            }
            responseObject.json().then(
                response => {
                    /**
                     * update the row on success
                     */

                        // get the row from the element that triggered this function
                    let row = event.toElement.parentElement.parentElement;

                    // get the element where the status is displayed and update it
                    let rowStatus = row.children[5];
                    rowStatus.innerHTML = response.request.status;

                    // get the element where the action buttons are displayed and destroy its children
                    let rowAction = row.children[6];
                    rowAction.innerHTML = '';

                    // update the buttons
                    if (response.request.status === 'Approved') {
                        let resolveButton = document.createElement('button');
                        resolveButton.className = 'btn btn-neutral';
                        resolveButton.innerHTML = 'Resolve';
                        resolveButton.onclick = respondRequest;
                        rowAction.appendChild(resolveButton);
                    } else if (response.request.status === 'Disapproved' || response.request.status === 'Resolved') {
                        rowAction.innerHTML = '-'
                    }
                }
            );
        }
    ).catch(error => {
        console.log(error);
    });
}