const keys = require('./keys');
////////////////////////////////////////////////////////////////////////////////////// Express
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());

////////////////////////////////////////////////////////////////////////////////////// Databases
const table = 'demotable';
app.get('/', (req, res) => {
    res.send('Hi');
});

//------------------------------------------------------------------ redis redis
//------------------------------- setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();
const uniqid = require('uniqid');
//------------------------------- routes
app.get('/redis/redis', (req, res) => {
    console.log('get /redis/redis');
    redisClient.hgetall('demotable', (err, values) => {
        const tableArr = [];
        if (values) {
            Object.keys(values).forEach((element) => {
                const elem = {};
                elem._id = element;
                elem['name'] = values[element];
                tableArr.push(elem);
            });
            res.send(tableArr);
        } else {
            res.send([]);
        }
    });
});
app.put('/redis/redis/:id', (req, res) => {
    console.log('put /redis/redis/:id', values);
    const id = req.params.id;
    redisClient.hset('demotable', id, req.body.row.name);
    redisClient.hgetall('demotable', (err, values) => {
        const tableArr = [];
        Object.keys(values).forEach((element) => {
            const elem = {};
            elem._id = element;
            elem['name'] = values[element];
            tableArr.push(elem);
        });
        res.send(tableArr);
    });
});
app.put('/redis/redis/insert', (req, res) => {
    console.log('put /redis/redis/insert');
    redisClient.hset('demotable', uniqid(), req.body.row.name);
    redisClient.hgetall('demotable', (err, values) => {
        const tableArr = [];
        Object.keys(values).forEach((element) => {
            const elem = {};
            elem._id = element;
            elem['name'] = values[element];
            tableArr.push(elem);
        });
        res.send(tableArr);
    });
});
app.delete('/redis/redis/:id', (req, res) => {
    console.log('delete /redis/redis/insert');
    const id = req.params.id;
    redisClient.hdel('demotable', id);
    redisClient.hgetall('demotable', (err, values) => {
        console.log('redis values', values);
        const tableArr = [];
        Object.keys(values).forEach((element) => {
            // if (element !== 'id') {
            const elem = {};
            elem._id = element;
            elem['name'] = values[element];
            tableArr.push(elem);
            // }
        });

        res.send(tableArr);
    });
});
app.get('/redis/redis/columns', (req, res) => {
    console.log('get /redis/redis/columns');
    res.send(['(no name)']);
});

//------------------------------------------------------------------ postgres pg
//------------------------------- setup
const {Pool} = require('pg');
const pgClient = new Pool({
    host: keys.pgHost,
    port: keys.pgPort,
    database: keys.pgDatabase,
    user: keys.pgUser,
    password: keys.pgPassword
});
pgClient.on('error', () => console.log('Lost PG connection'));
//------------------------------- crud model
class postgres_pg_Model {
    static async getAll() {
        return await pgClient.query(`SELECT * FROM ${table} ORDER BY id`)
            .then(result => result.rows)
            .catch(err => err);
    }
    static async getOne(id) {
        return await pgClient.query(`SELECT * FROM ${table} WHERE id = '${id}'`)
            .then(result => result.rows[0])
            .catch(err => err);
    }
    static async insert(row) {
        const rowNamesArr = [];
        const rowValuesArr = [];
        Object.keys(row).forEach((element) => {
            if (element !== 'id') {
                rowNamesArr.push(element);
                rowValuesArr.push(row[element]);
            }
        });
        const rowNames = rowNamesArr.join(", ");
        const rowValues = "'" + rowValuesArr.join("', '") + "'";
        await pgClient.query(`INSERT INTO ${table} (${rowNames}) VALUES (${rowValues})`)
            .catch(err => err);
        return await this.getAll();
    }
    static async update(id, row) {
        const rowArr = [];
        Object.keys(row).forEach((element) => {
            if (element !== 'id') {
                rowArr.push(`${element} = '${row[element]}'`);
            }
        });
        await pgClient.query(`UPDATE ${table} SET ${rowArr.join(", ")} WHERE id = '${id}'`)
            .catch(err => err);
        return await this.getAll();
    }
    static async remove(id) {
        await pgClient.query(`DELETE FROM ${table} WHERE id = '${id}'`)
            .catch(err => err);
        return await this.getAll();
    }
}
//------------------------------- routes
app.get('/postgres/pg', async (req, res) => {
    console.log('get /postgres/pg');
    res.send(await postgres_pg_Model.getAll());
});
app.get('/postgres/pg/:id', async (req, res) => {
    console.log('post /postgres/pg/:id');
    const id = req.params.id;
    res.send(await postgres_pg_Model.getOne(id));
});
app.put('/postgres/pg/insert', async (req, res) => {
    console.log('put /postgres/pg/insert');
    const row = req.body.row;
    res.send(await postgres_pg_Model.insert(row));
});
app.put('/postgres/pg/:id', async (req, res) => {
    console.log('put /postgres/pg/:id');
    const id = req.params.id;
    const row = req.body.row;
    res.send(await postgres_pg_Model.update(id, row));
});
app.delete('/postgres/pg/:id', async (req, res) => {
    console.log('delete /postgres/pg/:id');
    const id = req.params.id;
    console.log('id', id);
    res.send(await postgres_pg_Model.remove(id));
});

//------------------------------------------------------------------ postgres pg-promise
//------------------------------- setup
const initOptions = {
    error(error, e) {
        if (e.cn) {
            console.log('CN:', e.cn);
            console.log('EVENT:', error.message || error);
        }
    }
};
const pgp = require('pg-promise')(initOptions);
const databaseConfig = {
    host: keys.pgHost,
    port: keys.pgPort,
    database: keys.pgDatabase,
    user: keys.pgUser,
    password: keys.pgPassword
};
const pgpr = pgp(databaseConfig);
//------------------------------- crud model
class postgres_pgpromise_Model {
    static async getAll() {
        return await pgpr.any(`SELECT * FROM ${table} ORDER BY id`)
            .then(data => data, reason => reason);
    }
    static async getOne(id) {
        return await pgpr.any(`SELECT * FROM ${table} WHERE id = ${id}`)
            .then(data => data[0], reason => reason);
    }
    static async insert(row) {
        const rowNamesArr = [];
        const rowValuesArr = [];
        Object.keys(row).forEach((element) => {
            if (element !== 'id') {
                rowNamesArr.push(element);
                rowValuesArr.push(row[element]);
            }
        });
        const rowNames = rowNamesArr.join(", ");
        const rowValues = "'" + rowValuesArr.join("', '") + "'";
        await pgpr.none(`INSERT INTO ${table} (${rowNames}) VALUES (${rowValues})`)
            .then(data => data, reason => reason);
        return await this.getAll();
    }
    static async update(id, row) {
        const rowArr = [];
        Object.keys(row).forEach((element) => {
            if (element !== 'id') {
                rowArr.push(`${element} = '${row[element]}'`);
            }
        });
        await pgpr.none(`UPDATE ${table} SET ${rowArr.join(", ")} WHERE id = '${id}'`)
            .then(data => data, reason => reason);
        return await this.getAll();
    }
    static async remove(id) {
        await pgpr.none(`DELETE FROM ${table} WHERE id = '${id}'`)
            .then(data => data, reason => reason);
        return await this.getAll();
    }
}
//------------------------------- routes
app.get('/postgres/pgpromise', async (req, res) => {
    console.log('get /postgres/pgpromise');
    res.send(await postgres_pgpromise_Model.getAll());
});
app.get('/postgres/pgpromise/:id', async (req, res) => {
    console.log('post /postgres/pgpromise/:id');
    const id = req.params.id;
    res.send(await postgres_pgpromise_Model.getOne(id));
});
app.put('/postgres/pgpromise/insert', async (req, res) => {
    console.log('put /postgres/pgpromise/insert');
    const row = req.body.row;
    res.send(await postgres_pgpromise_Model.insert(row));
});
app.put('/postgres/pgpromise/:id', async (req, res) => {
    console.log('put /postgres/pgpromise/:id');
    const id = req.params.id;
    const row = req.body.row;
    res.send(await postgres_pgpromise_Model.update(row));
});
app.delete('/postgres/pgpromise/:id', async (req, res) => {
    console.log('delete /postgres/pgpromise/:id');
    const id = req.params.id;
    console.log('id', id);
    res.send(await postgres_pgpromise_Model.remove(id));
});

//------------------------------------------------------------------ postgres knex
//------------------------------- setup
const knex = require('knex');
const knexpg = knex({
    client: 'pg',
    connection: {
        host: keys.pgHost,
        port: keys.pgPort,
        database: keys.pgDatabase,
        user: keys.pgUser,
        password: keys.pgPassword
    }
});
//------------------------------- crud model
class postgres_knex_Model {
    static async getAll() {
        return await knexpg.select('*').from(table)
            .then(data => data).catch(err => err);
    }
    static async getOne(id) {
        return await knexpg.select('*').from(table).where('id', '=', id)
            .then(data => data[0]).catch(err => err);
    }
    static async insert(row) {
        await knexpg.insert(row).into(table)
            .then(data => data).catch(err => err);
        return await this.getAll();
    }
    static async update(id, row) {
        await knexpg.update(row).into(table).where('id', '=', id)
            .then(data => data).catch(err => err);
        return await this.getAll();
    }
    static async remove(id) {
        knexpg.del().from(table).where('id', '=', id)
            .then(data => data).catch(err => err);
        return await this.getAll();
    }
}
//------------------------------- routes
app.get('/postgres/knex', async (req, res) => {
    console.log('get /postgres/knex');
    res.send(await postgres_knex_Model.getAll());
});
app.get('/postgres/knex/:id', async (req, res) => {
    console.log('get /postgres/knex/:id');
    res.send(await postgres_knex_Model.getOne(id));
});
app.put('/postgres/knex/insert', async (req, res) => {
    console.log('put /postgres/knex/insert');
    const row = req.body.row;
    res.send(await postgres_knex_Model.insert(row));
});
app.put('/postgres/knex/:id', async (req, res) => {
    console.log('put /postgres/knex/:id');
    const id = req.params.id;
    const row = req.body.row;
    res.send(await postgres_knex_Model.update(id, row));
});
app.delete('/postgres/knex/:id', async (req, res) => {
    console.log('delete /postgres/knex/:id');
    const id = req.params.id;
    res.send(await postgres_knex_Model.remove(id));
});

//------------------------------------------------------------------ mongo mongoose
//------------------------------- setup
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const mongoURI = `mongodb://${keys.mongoUser}:${keys.mongoPassword}@${keys.mongoHost}:${keys.mongoPort}/${keys.mongoDatabase}`;
mongoose.connect(mongoURI, {useNewUrlParser: true, authSource: 'admin'});
const db = mongoose.connection;
const mongoose_schema = {
    _id: {
        type: mongoose.Schema.Types.ObjectId
    },
    name: {
        type: String
    },
    title: {
        type: String
    }
};
const modelSchema = mongoose.Schema(mongoose_schema, {versionKey: false});
const Model = mongoose.model('Model', modelSchema, 'demotable');
//------------------------------- crud model
class mongo_mongoose_Model {
    static async getAll() {
        console.log('mongo_mongoose_Model.getAll');
        const getAll = await Model.find({}).limit(100);
        console.log('getAll', getAll);
        return getAll;
    }
    static async getOne(id) {
        console.log('mongo_mongoose_Model.getOne');
        const getOne = await Model.findById(id);
        console.log('getOne', getOne);
        return getOne;
    }
    static async insert(row) {
        const jsonToInsert = {};
        Object.keys(mongoose_schema).forEach((element, key) => {
            if (key === 0) {
                jsonToInsert[element] = new mongoose.mongo.ObjectId();
            } else {
                jsonToInsert[element] = row[element] ? row[element] : null;
            }
        });
        await Model.create(jsonToInsert);
        return await this.getAll();
    }
    static async update(id, row) {
        console.log('mongo_mongoose_Model.update');
        console.log('row', row);
        let rowWithoutId = {};
        Object.keys(mongoose_schema).forEach((element) => {
            if (element !== '_id') {
                rowWithoutId[element] = row[element];
            }
        });
        console.log('rowWithoutId', rowWithoutId);
        await Model.findOneAndUpdate({_id: id}, {$set: rowWithoutId});
        return await this.getAll();
    }
    static async remove(id) {
        await Model.deleteOne({_id: id});
        return await this.getAll();
    }
}
//------------------------------- routes
app.get('/mongo/mongoose', async (req, res) => {
    console.log('get /mongo/mongoose');
    res.send(await mongo_mongoose_Model.getAll());
});
app.post('/mongo/mongoose/:id', async (req, res) => {
    console.log('post /mongo/mongoose/:id');
    const id = req.params.id;
    res.send(await mongo_mongoose_Model.getOne(id));
});
app.put('/mongo/mongoose/insert', async (req, res) => {
    console.log('put /mongo/mongoose/insert');
    const row = req.body.row;
    console.log('mongo insert row', row);
    res.send(await mongo_mongoose_Model.insert(row));
});
app.put('/mongo/mongoose/:id', async (req, res) => {
    console.log('put /mongo/mongoose/:id');
    const id = req.params.id;
    const row = req.body.row;
    console.log('id', id);
    console.log('item', row);
    res.send(await mongo_mongoose_Model.update(id, row));
});
app.delete('/mongo/mongoose/:id', async (req, res) => {
    console.log('delete /mongo/mongoose/:id');
    const id = req.params.id;
    console.log('id', id);
    res.send(await mongo_mongoose_Model.remove(id));
});

//------------------------------------------------------------------ mongo mongodb
//------------------------------- setup
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const mongodb = (id, row, callback) => {
    MongoClient.connect(`mongodb://${keys.mongoUser}:${keys.mongoPassword}@${keys.mongoHost}:${keys.mongoPort}`, function (err, db) {
        if (err) throw err;
        const dbo = db.db(keys.mongoDatabase);
        callback(id, row, dbo);
    });
    db.close();
};
//------------------------------- crud model
class mongo_mongodb_Model {
    static async getAll() {
        const getAll = await new Promise((resolve, reject) => mongodb (null, null, (id, row, dbo) => {
            dbo.collection(table).find({}).toArray(function (err, result) {
                if (err) throw err;
                resolve(result);
            });
        }));
        console.log('getAll', getAll);
        return getAll;
    }
    static async getOne(id) {
        const getAll = await new Promise((resolve, reject) => mongodb (null, null, (id, row, dbo) => {
            dbo.collection(table).findOne({_id: ObjectId(id)}, function (err, result) {
                if (err) throw err;
                resolve(result);
            });
        }));
        console.log('getAll', getAll);
        return getAll;
    }
    static async insert(row) {
        const jsonToInsert = {};
        Object.keys(mongoose_schema).forEach((element, key) => {
            if (key === 0) {
                jsonToInsert[element] = new mongoose.mongo.ObjectId();
            } else {
                jsonToInsert[element] = row[element] ? row[element] : null;
            }
        });
        await new Promise((resolve, reject) => mongodb (null, jsonToInsert, (id, row, dbo) => {
            dbo.collection(table).insertOne(row, function (err, res1) {
                if (err) throw err;
                resolve(res1);
            });
        }));
        return await this.getAll();
    }
    static async update(id, row) {
        console.log('mongo_mongoose_Model.update');
        console.log('id', id);
        console.log('row', row);
        let rowWithoutId = {};
        Object.keys(mongoose_schema).forEach((element) => {
            if (element !== '_id') {
                rowWithoutId[element] = row[element];
            }
        });
        console.log('rowWithoutId', rowWithoutId);
        await new Promise((resolve, reject) => mongodb (id, rowWithoutId, (id, row, dbo) => {
            dbo.collection(table).updateOne({_id: ObjectId(id)}, {$set: row}, function (err, res1) {
                if (err) throw err;
                resolve(res1);
            });
        }));
        return await this.getAll();
    }
    static async remove(id) {
        console.log('mongo_mongodb_Model.remove');
        console.log('id', id);
        await new Promise((resolve, reject) => mongodb (id, null, (id, row, dbo) => {
            dbo.collection(table).deleteOne({_id: ObjectId(id)}, function (err, res1) {
                if (err) throw err;
                resolve(res1);
            });
        }));
        return await this.getAll();
    }
}
//------------------------------- routes
app.get('/mongo/mongodb', async (req, res) => {
    console.log('get /mongo/mongodb');
    res.send(await mongo_mongodb_Model.getAll());

});
app.get('/mongo/mongodb/:id', async (req, res) => {
    console.log('get /mongo/mongodb/:id');
    const id = req.params.id;
    res.send(await mongo_mongodb_Model.getOne(id));
});
app.put('/mongo/mongodb/insert', async (req, res) => {
    console.log('put /mongo/mongodb/insert');
    const item = req.body.row;
    res.send(await mongo_mongodb_Model.insert(item));
});
app.put('/mongo/mongodb/:id', async (req, res) => {
    console.log('put /mongo/mongodb/:id');
    const id = req.params.id;
    const row = req.body.row;
    res.send(await mongo_mongodb_Model.update(id, row));
});
app.delete('/mongo/mongodb/:id', async (req, res) => {
    console.log('delete /mongo/mongodb/:id');
    const id = req.params.id;
    res.send(await mongo_mongodb_Model.remove(id));
});

//------------------------------------------------------------------ mysql mysql
//------------------------------- setup
const mysqlConnection = require('mysql');
const mysql = mysqlConnection.createConnection({
    host: keys.mysqlHost,
    port: keys.mysqlPort,
    database: keys.mysqlDatabase,
    user: keys.mysqlUser,
    password: keys.mysqlPassword
});
mysql.connect(function (err) {
    if (err) throw err;
});
//------------------------------- crud model
class mysql_mysql_Model {
    static async getAll() {
        const getAll =  await new Promise((resolve, reject) => mysql.query(`SELECT * FROM ${table} ORDER BY id`, (err, result) => {
            if (err) throw err;
            resolve(result);
        }));
        const getAll1 = JSON.parse(JSON.stringify(getAll));
        console.log('getAll', getAll1);
        return getAll1;
    }
    static async getOne(id) {
        const getOne =  await new Promise((resolve, reject) => mysql.query(`SELECT * FROM ${table} WHERE id = ${id}`, (err, result) => {
            if (err) throw err;
            resolve(result[0]);
        }));
        const getOne1 = JSON.parse(JSON.stringify(getOne));
        console.log('getAll', getOne1);
        return getOne1;
    }
    static async insert(row) {
        const rowNamesArr = [];
        const rowValuesArr = [];
        Object.keys(row).forEach((element) => {
            if (element !== 'id') {
                rowNamesArr.push(element);
                rowValuesArr.push(row[element]);
            }
        });
        const rowNames = rowNamesArr.join(", ");
        const rowValues = "'" + rowValuesArr.join("', '") + "'";
        await new Promise((resolve, reject) => mysql.query(`INSERT INTO ${table} (${rowNames}) VALUES (${rowValues})`, (err, result) => {
            if (err) throw err;
            resolve(result);
        }));
        return await this.getAll();
    }
    static async update(id, row) {
        const rowArr = [];
        Object.keys(row).forEach((element) => {
            if (element !== 'id') {
                rowArr.push(`${element} = '${row[element]}'`);
            }
        });
        await new Promise((resolve, reject) => mysql.query(`UPDATE ${table} SET ${rowArr.join(", ")} WHERE id = '${id}'`, (err, result) => {
            if (err) throw err;
            resolve(result);
        }));
        return await this.getAll();
    }
    static async remove(id) {
        await pgClient.query(`DELETE FROM ${table} WHERE id = '${id}'`)
            .catch(err => err);
        await new Promise((resolve, reject) => mysql.query(`DELETE FROM ${table} WHERE id = '${id}'`, (err, result) => {
            if (err) throw err;
            resolve(result);
        }));
        return await this.getAll();
    }
}
//------------------------------- routes
app.get('/mysql/mysql', async (req, res) => {
    console.log('get /mysql');
    res.send(await mysql_mysql_Model.getAll());
});
app.get('/mysql/mysql/:id', async (req, res) => {
    console.log('get /mysql/mysql/:id');
    const id = req.params.id;
    res.send(await mysql_mysql_Model.getOne(id));
});
app.put('/mysql/mysql/insert', async (req, res) => {
    console.log('put /mysql/insert');
    const row = req.body.row;
    res.send(await mysql_mysql_Model.insert(row));
});
app.put('/mysql/mysql/:id', async (req, res) => {
    console.log('put /mysql/:id');
    const id = req.params.id;
    const row = req.body.row;
    console.log('id', id);
    console.log('row', row);
    res.send(await mysql_mysql_Model.update(id, row));
});
app.delete('/mysql/mysql/:id', async (req, res) => {
    console.log('delete /mysql/:id');
    const id = req.params.id;
    res.send(await mysql_mysql_Model.remove(id));
});

//------------------------------------------------------------------ mysql knex
//------------------------------- setup
// const knex = require('knex');
const knexmysql = knex({
    client: 'mysql',
    version: '8.0',
    connection: {
        host: keys.mysqlHost,
        port: keys.mysqlPort,
        database: keys.mysqlDatabase,
        user: keys.mysqlUser,
        password: keys.mysqlPassword
    }
});
//------------------------------- crud model
class mysql_knex_Model {
    static async getAll() {
        return await knexmysql.select('*').from(table)
            .then(data => data).catch(err => err);
    }
    static async getOne(id) {
        return await knexmysql.select('*').from(table).where('id', '=', id)
            .then(data => data[0]).catch(err => err);
    }
    static async insert(row) {
        await knexmysql.insert(row).into(table)
            .then(data => data).catch(err => err);
        return await this.getAll();
    }
    static async update(id, row) {
        await knexmysql.update(row).into(table).where('id', '=', id)
            .then(data => data).catch(err => err);
        return await this.getAll();
    }
    static async remove(id) {
        await knexmysql.del().from(table).where('id', '=', id)
            .then(data => data).catch(err => err);
        return await this.getAll();
    }
}
//------------------------------- routes
app.get('/mysql/knex', async (req, res) => {
    console.log('get /mysql/knex');
    res.send(await mysql_knex_Model.getAll());
});
app.get('/mysql/knex/:id', async (req, res) => {
    console.log('get /mysql/knex/:id');
    res.send(await mysql_knex_Model.getOne(id));
});
app.put('/mysql/knex/insert', async (req, res) => {
    console.log('put /mysql/knex/insert');
    const row = req.body.row;
    res.send(await mysql_knex_Model.insert(row));
});
app.put('/mysql/knex/:id', async (req, res) => {
    console.log('put /mysql/knex/:id');
    const id = req.params.id;
    const row = req.body.row;
    res.send(await mysql_knex_Model.update(id, row));
});
app.delete('/mysql/knex/:id', async (req, res) => {
    console.log('delete /mysql/knex/:id');
    const id = req.params.id;
    console.log('id', id);
    res.send(await mysql_knex_Model.remove(id));
});

//------------------------------------------------------------------ graphql
//------------------------------- setup
const expressGraphQL = require('express-graphql');
// const models = require('./models');
// const graphql_schema = require('./schema/schema');
// - - - - - - - - - - - - -
const graphql = require('graphql');
const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLList, GraphQLNonNull} = graphql;
const UserType = new GraphQLObjectType({
    name: 'demotest',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        title: {type: GraphQLString}
    })
});
const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        getAll: {
            type: new GraphQLList(UserType),
            async resolve() {
                return await postgres_pg_Model.getAll();
                // return await postgres_pgpromise_Model.getAll();
                // return await postgres_knex_Model.getAll();
                // return await mongo_mongoose_Model.getAll();
                // return await mongo_mongodb_Model.getAll();
                // return await mysql_mysql_Model.getAll();
                // return await mysql_knex_Model.getAll();
            }
        }
    }
});
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addModel: {
            type: UserType,
            args: {
                name: {type: GraphQLString},
                title: {type: GraphQLString}
            },
            async resolve(parnetValue, row) {
                return await postgres_pg_Model.insert(row);
                // return await postgres_pgpromise_Model.insert(row);
                // return await postgres_knex_Model.insert(row);
                // return await mongo_mongoose_Model.insert(row);
                // return await mongo_mongodb_Model.insert(row);
                // return await mysql_mysql_Model.insert(row);
                // return await mysql_knex_Model.insert(row);
            }
        },
        updateModel: {
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)},
                name: {type: GraphQLString},
                title: {type: GraphQLString}
            },
            async resolve(parnetValue, row) {
                return await postgres_pg_Model.update(row.id, row);
                // return await postgres_pgpromise_Model.update(row.id, row);
                // return await postgres_knex_Model.update(row.id, row);
                // return await mongo_mongoose_Model.update(row._id, row);
                // return await mongo_mongodb_Model.update(row._id, row);
                // return await mysql_mysql_Model.update(row.id, row);
                // return await mysql_knex_Model.update(row.id, row);
            }
        },
        deleteModel: {
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)}
            },
            async resolve(parnetValue, id) {
                return await postgres_pg_Model.remove(id);
                // return await postgres_pgpromise_Model.remove(id);
                // return await postgres_knex_Model.remove(id);
                // return await mongo_mongoose_Model.remove(id);
                // return await mongo_mongodb_Model.remove(id);
                // return await mysql_mysql_Model.remove(id);
                // return await mysql_knex_Model.remove(id);
            }
        }
    }
});
const graphql_schema = new GraphQLSchema({
    query: RootQuery,
    mutation
});
// - - - - - - - - - - - - -
app.use('/graphql', expressGraphQL({
    schema: graphql_schema,
    graphiql: true
}));

////////////////////////////////////////////////////////////////////////////////////// Listen
app.listen(5000, err => {
    console.log('Listening');
});