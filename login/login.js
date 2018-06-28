import { url } from "../script";
const form = document.querySelector('form');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const displayMessage = document.querySelector('.message')
if (form){
    form.addEventListener('submit', formSubmitted);
}

function formSubmitted(event) {
    event.preventDefault();
    login(email.value, password.value);
}
function login(email, password) {
    // endpoint to be used
    let endpoint = '/auth/login'


    // the request body format
    let requestBody = {
        "email": email,
        "password": password
    };

    // build the request
    let request = new Request(url + endpoint,
        {
            method: 'POST',
            mode: 'cors',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(requestBody)
        }
    );

    // use that request to fetch a response from the login endpoint
    fetch(request).then(
        responseObject => {
            responseObject.json().then(
                response => {
                    if (!responseObject.ok) {
                        displayMessage.className = 'btn-danger';
                        displayMessage.innerHTML = response.message;
                    } else {
                        displayMessage.className = 'btn-success';
                        displayMessage.innerHTML = response.message;
                        loginSuccess(response.user, response.access_token);
                    }
                }
            );
        }
    );
}

function loginSuccess(user, accessToken){
    sessionStorage.setItem('access_token', accessToken);
    sessionStorage.setItem('user', user.email);
    if (user.role === 'Administrator'){
        window.location = "../admin-dashboard/index-admin.html";
        }else if(user.role === 'Consumer'){
        window.location = "../user-dashboard/index-user.html";
    }
}
