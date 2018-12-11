/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import ChatTileControl from './ChatTileControl';
import DialogTitleControl from './DialogTitleControl';
import DialogStatusControl from './DialogStatusControl';
import ChatStore from '../../Stores/ChatStore';
import './ChatControl.css';

class ChatControl extends React.Component {
    shouldComponentUpdate(nextProps, nextState){
        return nextProps.chatId !== this.props.chatId;
    }

    handleClick = () => {
        const { chatId, onSelect} = this.props;
        if (!onSelect) return;

        const chat = ChatStore.get(chatId);
        if (!chat) return;

        onSelect(chat);
    };

    render() {
        const { chatId, onTileSelect } = this.props;

        return (
            <div className='chat' onClick={this.handleClick}>
                <div className='chat-wrapper'>
                    <ChatTileControl chatId={chatId} onSelect={onTileSelect} />
                    <div className='dialog-inner-wrapper'>
                        <div className='dialog-row-wrapper'>
                            <DialogTitleControl chatId={chatId} />
                        </div>
                        <div className='dialog-row-wrapper'>
                            <DialogStatusControl chatId={chatId} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ChatControl.propTypes = {
    chatId: PropTypes.number.isRequired,
    onSelect: PropTypes.func,
    onTileSelect: PropTypes.func
};

export default ChatControl;
