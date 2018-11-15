const graphql = require('graphql');
const mongoose = require('mongoose');
const axios = require('axios');
const {GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLList, GraphQLNonNull} = graphql;

const mongoose_schema = {
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String
    },
    title: {
        type: String
    }
};
const modelSchema = mongoose.Schema(mongoose_schema, {versionKey: false});
const Model = mongoose.model('Model', modelSchema, 'demotable');

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {type: GraphQLString},
        name: {type: GraphQLString},
        title: {type: GraphQLInt}
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: {id: {type: GraphQLString}},
            resolve() {
                return Model.find({});
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                title: {type: GraphQLString}
            },
            resolve(parnetValue, {id}) {
                return Model.create(item);
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parnetValue, {id}) {
                return Song.remove({ _id: id });
            }
        }
    }
});

module.exports = new GraphQLSchema({
    mutation,
    query: RootQuery
});
