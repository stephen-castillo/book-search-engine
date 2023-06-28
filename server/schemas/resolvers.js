const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            return User.findOne({ _id: context.user._id });
        },
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        },
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, { userId, bookData }, context) => {
            try {
                if(context.user){
                    const updatedUser = await User.findOneAndUpdate(
                        { _id: userId },
                        { $addToSet: { savedBooks: bookData } },
                        { new: true, runValidators: true }
                    );
                    return updatedUser;
                }
                throw new AuthenticationError('You need to be logged in!');
            } catch (err) {
                console.log(err);
            }
        },
        removeBook: async (parent, { userId, bookId }, context) => {
            if (context.user){
                const updatedUser = await User.findOneAndUpdate(
                    { _id: userId },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                );
                if(updatedUser){
                    return updatedUser;
                }else{
                    throw new AuthenticationError('User not found!');
                }
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
};

module.exports = resolvers;
