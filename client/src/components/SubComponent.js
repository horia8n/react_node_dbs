import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {fetchPosts, fetchPost, createPost, deletePost, updatePost, selectDatabase} from "../actions/index";
import Table from './Table';

class SubComponent extends Component {
    constructor() {
        super();
        this.state = {};
        this.dataChoices = [
            {name: 'Postgres - pg module', code: 'postgres/pg', idColumnName: 'id'},
            {name: 'Postgres - pg-promise module', code: 'postgres/pgpromise', idColumnName: 'id'},
            {name: 'Postgres - knex module', code: 'postgres/knex', idColumnName: 'id'},
            {name: 'Mongo - mongodb module', code: 'mongo/mongodb', idColumnName: '_id'},
            {name: 'Mongo - mongoose module', code: 'mongo/mongoose', idColumnName: '_id'},
            {name: 'Mysql - mysql module', code: 'mysql/mysql', idColumnName: 'id'},
            {name: 'Mysql - knex module', code: 'mysql/knex', idColumnName: 'id'},
            {name: 'Redis - redis module', code: 'redis/redis', idColumnName: 'id'},
        ];
    };
    databasePick = () => {
        return this.dataChoices.map((database, index) => {
            let selected = '';
            if(this.props.database){
                if(database.code === this.props.database.code){
                    selected = ' selected';
                }
            }
            return (
                <div
                    className={`databaseChoice${selected}`}
                    key={index}
                    onClick={() => this.renderThisTable(database)}
                >
                    {database.name}
                </div>
            );
        });
    };
    renderThisTable = async (database) => {
        await this.props.selectDatabase(database);
        this.props.fetchPosts(this.props.database.code);
    };
    render() {
        return (
            <div className="SubComponent">
                <div className="databasePick">
                    {this.databasePick()}
                </div>
                <Table/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        demotable: state.posts,
        database: state.database
    };
}
function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            fetchPosts: fetchPosts,
            fetchPost: fetchPost,
            createPost: createPost,
            deletePost: deletePost,
            updatePost: updatePost,
            selectDatabase: selectDatabase
        }, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(SubComponent);