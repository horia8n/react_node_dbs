import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {fetchPosts, fetchPost, createPost, deletePost, updatePost, selectDatabase } from "../actions/index";
import ViewEdit from './ViewEdit';

class Table extends Component {
    constructor(){
        super();
        this.state = {
            edited: {
                rowIndex: null,
                colIndex: null
            }
        };
    }
    //------------------------------------------------------ Functions
    switchToEdit = (rowIndex, colIndex) => {
        console.log('switchToEdit_rowIndex', rowIndex);
        console.log('switchToEdit_colIndex', colIndex);
        const demotable = this.props.demotable;
        if (rowIndex === this.props.demotable.length) {
            demotable[rowIndex] = JSON.parse(JSON.stringify(demotable[0]));
            for (let index in demotable[rowIndex]) {
                demotable[rowIndex][index] = null
            }
            demotable[rowIndex][colIndex] = '';
        }
        this.setState({edited: {rowIndex, colIndex}});
    };
    onValidateUpdate = (rowIndex, colIndex, value, added) => {
        console.log('onValidateUpdate', rowIndex, colIndex, value, added);
        const demotable = this.props.demotable;
        if (added) {
            demotable[rowIndex] = {};
            demotable[rowIndex][colIndex] = value;
            this.props.createPost(demotable[rowIndex], this.props.database.code);
            this.setState({edited: {rowIndex: null, colIndex: null}});
        } else {
            demotable[rowIndex][colIndex] = value;
            this.props.updatePost(demotable[rowIndex][this.props.database.idColumnName], demotable[rowIndex], this.props.database.code);
            this.setState({edited: {rowIndex: null, colIndex: null}});
        }
    };
    onCancelUpdate = (rowIndex, colIndex, value, added) => {
        console.log('onCancelUpdate', rowIndex, colIndex, value, added);
        const demotable = this.props.demotable;
        if (added) {
            demotable.splice(-1, 1);
            this.setState({edited: {rowIndex: null, colIndex: null}});
        } else {
            this.setState({ edited: {rowIndex: null, colIndex: null}});
        }
    };
    prepareInsertOne = () => {
        console.log('prepareInsertOne');
        const demotable = this.props.demotable;
        const instance = [];
        this.state.columns.forEach(element => {
            instance[element] = '';
        });
        demotable.push(instance);
        this.setState({demotable});
    };
    onValidateDelete = (row) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            this.props.deletePost(row[this.props.database.idColumnName], this.props.database.code);
            this.setState({edited: {rowIndex: null, colIndex: null}});
        }
    };
    renderTable = () => {
        if (!this.props.demotable.length) {
            return null;
        }
        const colNamesArr = [];
        Object.keys(this.props.demotable[0]).forEach((element) => {
            colNamesArr.push(element);
        });
        const headTR = (
            <tr key="columns">
                {colNamesArr.map((value, index) => {
                    if (index !== 0) {
                        return (<td key={value}>{value}</td>);
                    }
                    return null;
                })}
                <td className="deleteTD" key="delete"></td>
            </tr>
        );
        const bodyTR = this.props.demotable.map((row, rowIndex) => {
            const colValuesArr = [];
            Object.keys(row).forEach((element) => {
                colValuesArr.push(row[element]);
                return null;
            });
            return (
                <tr key={rowIndex}>
                    {colValuesArr.map((value, index) => {
                        if (index !== 0) {
                            let edit = false;
                            if (rowIndex === this.state.edited.rowIndex && colNamesArr[index] === this.state.edited.colIndex) {
                                edit = true;
                                // value = '';
                            }
                            let added = false;
                            if (colValuesArr[0] === null) {
                                added = true;
                                value = '';
                            }
                            if (colValuesArr[0] === null && colNamesArr[index] === this.state.edited.colIndex) {
                                added = true;
                                value = '';
                            }
                            return <ViewEdit
                                key={colNamesArr[index]}
                                edit={edit}
                                added={added}
                                rowIndex={rowIndex}
                                colIndex={colNamesArr[index]}
                                value={value}
                                switchToEdit={this.switchToEdit}
                                onValidateUpdate={this.onValidateUpdate}
                                onCancelUpdate={this.onCancelUpdate}
                            />;
                        }
                        return null;
                    })}
                    <td className="deleteTD" onClick={() => this.onValidateDelete(row)}>
                        <div className="buttton">&#10007;</div>
                    </td>
                </tr>
            );
        });
        const insert = colNamesArr.map((name, index) => {
            if (index !== 0) {
                let edit = true;
                if (this.state.edited.rowIndex === null) {
                    edit = false;
                    return <ViewEdit
                        key={index}
                        edit={edit}
                        added={true}
                        rowIndex={this.props.demotable.length}
                        colIndex={colNamesArr[index]}
                        value="+"
                        switchToEdit={this.switchToEdit}
                        onValidateUpdate={this.onValidateUpdate}
                        onCancelUpdate={this.onCancelUpdate}
                    />;
                }
                return null;
            }
            return null;
        });
        return (
            <div className="database">
                <div className="databaseTitle">{this.props.database.name}</div>
                <table>
                    <thead>
                    {headTR}
                    </thead>
                    <tbody>
                    {bodyTR}
                    <tr key="insert">
                        {insert}
                    </tr>
                    </tbody>
                </table>
            </div>
        );
    };
    //------------------------------------------------------ Render
    render(){
        console.log('render demotable', this.props.demotable);
        return this.renderTable();
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
export default connect(mapStateToProps, mapDispatchToProps)(Table);