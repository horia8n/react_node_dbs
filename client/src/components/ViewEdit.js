import React, {Component} from 'react';

class ViewEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value
        };
        this.initialValue = this.props.value;
    }

    onKeyPress = (e) => {
        if ((e.key === 'Enter' && e.ctrlKey)) {
            this.props.onValidateUpdate(this.props.rowIndex, this.props.colIndex, this.state.value, this.props.added);
        }
    };
    onBlur = () => {
        this.props.onValidateUpdate(this.props.rowIndex, this.props.colIndex, this.state.value, this.props.added);
    };
    onKeyUp = (e) => {
        if (e.keyCode === 27) {
            this.setState({value: this.initialValue});
            this.props.onCancelUpdate(this.props.rowIndex, this.props.colIndex, this.state.value, this.props.added);
        }
    };
    onChange = (event) => {
        this.setState({value: event.target.value});
    };
    renderTD = () => {
        // console.log('renderTD', this.props);
        let valueArr;
        if (this.props.value !== null) {
            if (this.props.added) {
                valueArr = ['+'];
            } else {
                valueArr = this.state.value.toString().split('\n');
            }
        } else {
            valueArr = [''];
        }
        return (
            <td
                key={this.props.colIndex}
                onClick={() => this.props.switchToEdit(this.props.rowIndex, this.props.colIndex)}
            >
                <div
                    className="viewMode"
                >
                    {valueArr.map((line, lineIndex) => {
                        return <div key={lineIndex} className="viewLine">{line}</div>;
                    })}
                </div>
                {this.renderTextBox()}
            </td>
        );
    };
    renderTextBox = () => {
        if (this.props.edit) {
            return (
                <textarea
                    className="editMode"
                    type="text"
                    autoFocus={true}
                    onChange={this.onChange}
                    value={this.state.value}
                    onKeyPress={this.onKeyPress}
                    onKeyUp={this.onKeyUp}
                    onBlur={this.onBlur}
                />
            );
        }
        return null;
    };

    render() {
        return this.renderTD();
    }
}

export default ViewEdit;