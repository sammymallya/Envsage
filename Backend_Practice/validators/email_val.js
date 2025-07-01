function emailVal(email){
    const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/ ;
    if (email != '' && email.match(emailFormat)){
        return true;
    }
    return false;
}
module.exports = emailVal;