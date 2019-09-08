import React from 'react';
import PropTypes from 'prop-types';
import {Col, Row} from "react-bootstrap";
import mainStyles from "../../../style.scss";

class ItemAdd extends React.Component {
    constructor() {
        super();
        this.state = {
            editing: false,
            item_id: null,
            item_name: "",
            item_quantity : 1
        };
    }

    setWrapperRef = (node) => {
        this.wrapperRef = node;
    };

    checkEdit = (e) => {
        if(!this.state.editing){
            this.setState({editing:true})
        }
        document.addEventListener('mousedown', this.handleClickOutside);
    };
    updateName = (e) =>{
        this.setState({item_name:e.target.value});
    };
    updateQuantity = (e) =>{
        this.setState({item_quantity:e.target.value});
    };
    handleClickOutside = (e) => {
        if (this.wrapperRef && !this.wrapperRef.contains(e.target)) {
            if (this.state.item_name !== null && this.state.item_name.trim() !== "") {
                this.props.addItem(this.state.item_name,this.state.item_quantity);
            }
            this.setState({
                editing: false,
                item_name: "",
                item_quantity: 1
            });
        }
    };
    checkKey = (e) => {
        if(e.keyCode === 13){
            if (this.state.item_name === null || this.state.item_name.trim() === "") {
                this.setState({
                    editing: false,
                    item_name: "",
                    item_quantity: 1
                });
            }
            else {
                this.props.addItem(this.state.item_name,this.state.item_quantity);
            }
            document.removeEventListener('mousedown', this.handleClickOutside);
        }
    };

    render(){
        let itemAdd = null;
        if (this.state.editing) {
            itemAdd =(
                <Row className='mt-3' >
                    <Col xs={2}>
                        <input type="number" value={this.state.item_quantity} min="1" ref={this.setWrapperRef} onChange={(e) => this.updateQuantity(e)} />
                    </Col>
                    <Col xs={10}>
                        <input placeholder='Item name here' type="text" value={this.state.item_name} ref={this.setWrapperRef} onChange={this.updateName} onKeyDown={(e)=>this.checkKey(e)}/>
                    </Col>
                </Row>
                );
        }else{
            itemAdd = <div className={`mt-3 ${mainStyles.addButton}`} onClick={this.checkEdit}><i className='bx bx-plus'></i> Add to list</div>
        }
        return(
            itemAdd
        )

    }
}

export default ItemAdd;