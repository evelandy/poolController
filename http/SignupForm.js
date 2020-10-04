document.getElementById('createUser').addEventListener('submit', createUser);

async function createUser(e) {
    e.preventDefault();
    let fname = document.getElementById('fname').value;
    let lname = document.getElementById('lname').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let email = document.getElementById('email').value;
    let address = document.getElementById('address').value;
    let city = document.getElementById('city').value;
    let zip_code = document.getElementById('zip_code').value;
    let phone = document.getElementById('phone').value;

    let token = localStorage.getItem('x-access-token');
    

    await fetch('http://127.0.0.1:5000/api/v1/user', {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'x-access-token': token,
            withCredentials: true
        },
        body: JSON.stringify({fname: fname, lname: lname, username: username, password: password, email: email, address: address, city: city, zip_code: zip_code, phone: phone})
    })
    .then((response) => {
        let data = response.json();
        return data;
    })
    .catch((err) => {
        console.log(err);
    })
}
