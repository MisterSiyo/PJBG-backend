const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/.+@.+\..+/, 'Veuillez entrer une adresse e-mail valide'], //marche pas ?
            //je me permets, à la place de match >>>  
            // validator : function(d) {
            // return  /.+@.+\..+/.test(d)},
            //message: props => `${props.value} n'est pas une adresse e-mail valide`
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        token: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
