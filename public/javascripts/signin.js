let submit = false;
let userError = document.getElementById('error1');
let passError = document.getElementById('error2');
let userValid = false;
let passValid = false;
let e = document.getElementById('uname_signup');
let p = document.getElementById('pword_signup');
let p2 = document.getElementById('pword_signup_2');

let test = 'abc';

e.addEventListener('keyup', function(){
    let message = '';
    //Spent a good hour on this trying to condence the code, but it just made stuff unresponsive
    //I'm not sure if this is because of vanilla javascript xhr
    if(e.value.length >= 5){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `/users/${e.value}`, true);
        xhr.onload = function(){
            if(this.status == 404){
                message = '';
                userError.innerHTML = message;
                changeborder(userValid = true, e);
            }else if(this.status == 200 || this.status == 304){
                message = 'Username already taken';
                userError.innerHTML = message;
                changeborder(userValid = false, e);
            }
        }
        xhr.send();
    }else{
        message = 'Username should be longer';
        userError.innerHTML = message;
        changeborder(userValid = false, e);
    }
});

function check(){
    let message2 = '';
    if(p.value == p2.value){
        message2 = '';
        passValid = true;
    }else{
        message2 = 'Password does not match';
        passValid = false;
    }
    passError.innerHTML = message2;
    changeborder(passValid, p2);
}

p2.addEventListener('keyup', check);

function changeborder(bool, x){
    if(bool){
        x.style.borderColor = 'green';
    }else{
        x.style.borderColor = 'red';
    }
}

