import React, {Component} from 'react';
import './TileControl.css';
import ChatStore from "../Stores/ChatStore";

class TileControl extends Component{
    constructor(props){
        super(props);

        this.onPhotoUpdated = this.onPhotoUpdated.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState){
        if (nextProps.chat !== this.props.chat){
            return true;
        }

        return false;
    }

    componentWillMount(){
        ChatStore.on("chat_photo_changed", this.onPhotoUpdated)
    }

    onPhotoUpdated(payload) {
        if (this.props.chat && this.props.chat.id === payload.chatId){
            this.forceUpdate();
        }
    }

    componentWillUnmount(){
        ChatStore.removeListener("chat_photo_changed", this.onPhotoUpdated);
    }

    getFirstLetter(str){
        if (!str) return '';
        for (let i = 0; i < str.length; i++){
            if (str[i].toUpperCase() !== str[i].toLowerCase()) {
                return str[i];
            }
        }

        return '';
    }

    getChatLetters(chat){
        if (!chat) return null;
        if (!chat.title) return null;
        if (chat.title.length === 0) return null;

        let split = chat.title.split(' ');
        if (split.length > 1){
            return this.getFirstLetter(split[0]) + this.getFirstLetter(split[1])
        }

        return chat.title.charAt(0);
    }

    render(){
        const chat = this.props.chat;
        const letters = this.getChatLetters(chat);

        const backgroundColor = chat.blob !== undefined ? '' : 'user_bgcolor_' + (Math.abs(chat.id) % 8 + 1);
        const photoClasses = `${backgroundColor} tile-photo`;

        return chat.blob !== undefined ?
            (<img className={photoClasses} src={URL.createObjectURL(chat.blob)} alt="" />) :
            (<div className={photoClasses}><span className='tile-text'>{ letters }</span></div>);
    }
}

export default TileControl;