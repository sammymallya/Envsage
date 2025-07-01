const jwt = require('jsonwebtoken');
function signToken(user,jwtSecretKey){
    const payload = {name:user.name};
    const token =  jwt.sign(payload,jwtSecretKey);
    return token;
}
module.exports = signToken;