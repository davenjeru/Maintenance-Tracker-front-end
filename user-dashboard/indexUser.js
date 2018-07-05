import { url, compare } from "../script";

const userEmailContainer = document.querySelector('.user-email');

// get the access token from session storage
const accessToken = sessionStorage.getItem('access_token');


if (userEmailContainer) {
    window.onload = getMyRequests;

    function getMyRequests() {
        let endpoint = '/users/requests';

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
                if (responseObject.status === 401 || responseObject.status === 500) {
                    window.location = '../login/index.html';
                }

                // user is authorized and can view their requests
                responseObject.json().then(
                    response => {
                        // show the requests on page
                        loadRequests(response.requests);
                    }
                );
            }
        ).catch(error => {
            console.log(error);
        });
    }

    function loadRequests(requests) {
        // sort the returned list to be in reverse
        requests = requests.sort(compare);
        const requestsContainer = document.getElementById('requests');

        requests.forEach(request => {
            // create a card for each request
            let card = document.createElement('div');
            card.className = 'card'

            // highlight each card according to its status
            let cardHeader = document.createElement('div');
            if (request.status === 'Pending Approval') {
                cardHeader.className = 'card-header-pending'
            } else if (request.status === 'Approved') {
                cardHeader.className = 'card-header-approved'

            } else if (request.status === 'Disapproved') {
                cardHeader.className = 'card-header-rejected'

            } else if (request.status === 'Resolved') {
                cardHeader.className = 'card-header-resolved'
            }
            // add heading and date to the header
            let h2 = document.createElement('h2');
            h2.innerHTML = request.title;
            let h4 = document.createElement('h4');
            let date = new Date(request.date_requested);
            h4.innerHTML = date.toDateString();
            cardHeader.appendChild(h2);
            cardHeader.appendChild(h4);
            card.appendChild(cardHeader);

            // create the card body
            let cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            // add the request description onto the card body and add to the card
            let pDescription = document.createElement('p');
            pDescription.innerHTML = request.description;
            cardBody.appendChild(pDescription);
            card.appendChild(cardBody);

            // create the card footer
            let cardFooter = document.createElement('div');
            cardFooter.className = 'card-footer';

            // create the button and add to the card-footer
            let footerButton = document.createElement('button');
            footerButton.className = 'btn btn-neutral';
            footerButton.innerHTML = 'View Request';
            footerButton.onclick = viewRequest;
            cardFooter.appendChild(footerButton);
            card.appendChild(cardFooter);

            // add the request ID but don't display it. It's going to be retrieved when the
            // "View request button is clicked"
            let requestID = document.createElement('div');
            requestID.innerHTML = request.request_id;
            requestID.style.display = 'none'
            card.appendChild(requestID);
            requestsContainer.appendChild(card);

        });
    }
}

function viewRequest(event) {
    // When the "View Request" button is clicked, put the ID in session storage, then change the window
    // location to the one where one views one request
    sessionStorage.setItem('requestID', event.toElement.parentElement.parentElement.lastChild.innerHTML)
    window.location = './user-view-request.html'
}