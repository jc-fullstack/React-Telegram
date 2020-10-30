/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';
import PinIcon from '../../Assets/Icons/PinFilled';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Status from './Status';
import { albumHistoryEquals } from '../../Utils/Common';
import { getDate, getDateHint, getViews } from '../../Utils/Message';
import MessageStore from '../../Stores/MessageStore';
import './Meta.css';

class Meta extends React.Component {

    state = { };

    static getDerivedStateFromProps(props, state) {
        const { chatId, messageId, messageIds } = props;
        const { prevChatId, prevMessageId, prevMessageIds } = state;

        if (prevChatId !== chatId || prevMessageId !== messageId || albumHistoryEquals(prevMessageIds, messageIds)) {

            const ids = [messageId, ...(messageIds || [])].filter(x => Boolean(x));
            const id = ids[ids.length - 1];

            const message = MessageStore.get(chatId, id);
            if (!message) return null;

            const { date, edit_date: editDate, views, is_outgoing: isOutgoing } = message;

            return {
                prevChatId: chatId,
                prevMessageId: messageId,
                prevMessageIds: messageIds,

                message,
                date,
                editDate,
                views,
                isOutgoing,
                isPinned: ids.some(x => MessageStore.get(chatId, x).is_pinned)
            };
        }

        return null;
    }

    componentDidMount() {
        MessageStore.on('updateMessageEdited', this.onUpdateMessageEdited);
        MessageStore.on('updateMessageViews', this.onUpdateMessageViews);
        MessageStore.on('updateMessageIsPinned', this.onUpdateMessageIsPinned);
    }

    componentWillUnmount() {
        MessageStore.off('updateMessageEdited', this.onUpdateMessageEdited);
        MessageStore.off('updateMessageViews', this.onUpdateMessageViews);
        MessageStore.off('updateMessageIsPinned', this.onUpdateMessageIsPinned);
    }

    onUpdateMessageIsPinned = update => {
        const { chat_id, message_id } = update;
        const { chatId, messageId, messageIds } = this.props;

        const ids = [messageId, ...(messageIds || [])].filter(x => Boolean(x));

        if (chat_id !== chatId) return;
        if (!ids.some(x => x === message_id)) return;

        this.setState({ isPinned: ids.some(x => MessageStore.get(chatId, x).is_pinned) });
    };

    onUpdateMessageEdited = update => {
        const { chat_id, message_id, edit_date: editDate } = update;
        const { message } = this.props;

        if (!message) return;
        if (message.chat_id !== chat_id) return;
        if (message.id !== message_id) return;

        this.setState({ editDate });
    };

    onUpdateMessageViews = update => {
        const { chat_id, message_id, views } = update;
        const { message } = this.state;

        if (!message) return;
        if (message.chat_id !== chat_id) return;
        if (message.id !== message_id) return;

        this.setState({ views });
    };

    render() {
        const { className, chatId, messageId, onDateClick, t, style } = this.props;
        const { date, editDate, views, isOutgoing, isPinned } = this.state;

        const dateStr = getDate(date);
        const dateHintStr = getDateHint(date);
        const viewsStr = getViews(views);

        return (
            <div className={classNames('meta', className)} style={style}>
                <span>&ensp;</span>
                {views > 0 && (
                    <>
                        <VisibilityIcon className='meta-views-icon' />
                        <span className='meta-views' title={views}>
                            &nbsp;
                            {viewsStr}
                            &nbsp; &nbsp;
                        </span>
                    </>
                )}
                {isPinned && (
                    <>
                        <PinIcon className='meta-pin-icon' />
                        <span>&nbsp;</span>
                    </>
                )}
                {editDate > 0 && <span>{t('EditedMessage')}&nbsp;</span>}
                <a onClick={onDateClick}>
                    <span title={dateHintStr}>{dateStr}</span>
                </a>
                {isOutgoing && <Status chatId={chatId} messageId={messageId} />}
            </div>
        );
    }
}

Meta.propTypes = {
    chatId: PropTypes.number.isRequired,
    messageId: PropTypes.number,
    messageIds: PropTypes.arrayOf(PropTypes.number),
    onDateClick: PropTypes.func
};

export default withTranslation()(Meta);
