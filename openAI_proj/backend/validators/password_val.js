function passVal (password,cpassword) {
    if (password===cpassword){
        return true;
    }
    return false;
}
module.exports = passVal;