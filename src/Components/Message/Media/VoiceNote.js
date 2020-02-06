/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import AudioAction from './AudioAction';
import VoiceNoteTile from '../../Tile/VoiceNoteTile';
import MediaStatus from './MediaStatus';
import VoiceNoteSlider from './VoiceNoteSlider';
import './VoiceNote.css';

class VoiceNote extends React.Component {
    render() {
        const { chatId, messageId, voiceNote, openMedia, title, meta, caption } = this.props;
        if (!voiceNote) return null;

        const { duration, voice: file } = voiceNote;

        return (
            <div className={classNames('document', { 'media-title': title })}>
                <VoiceNoteTile chatId={chatId} messageId={messageId} file={file} openMedia={openMedia} />
                <div className='voice-note-content'>
                    <VoiceNoteSlider chatId={chatId} messageId={messageId} duration={duration} file={file} />
                    <div className='voice-note-meta'>
                        <AudioAction chatId={chatId} messageId={messageId} duration={duration} file={file} />
                        <MediaStatus chatId={chatId} messageId={messageId} icon={'\u00A0•'} />
                        {!caption && meta}
                    </div>
                </div>
            </div>
        );
    }
}

VoiceNote.propTypes = {
    chatId: PropTypes.number.isRequired,
    messageId: PropTypes.number.isRequired,
    voiceNote: PropTypes.object.isRequired,
    openMedia: PropTypes.func
};

export default VoiceNote;
