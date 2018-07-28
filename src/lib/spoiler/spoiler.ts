import { Context } from '../../index';
import { addNews, retrieveNews } from '../database/data';
import { spoilerKeyboard } from '../telegram/keyboard';
import { parseSpoilerText } from '../utils/parse';
import { Spoiler, SpoilerContext } from './index';

const charactersLimit = 200;

const counterSpoiler = ({ description, translate }: SpoilerContext): Spoiler => {
    return {
        description,
        thumb_url: 'https://i.imgur.com/54qirkY.png',
        message_text: translate.t('counterSpoilerMessageText'),
        title: translate.t('counterSpoilerTitle', { length: description.length, limit: charactersLimit })
    };
};

const lowSpoiler = ({ translate, id, spoiler_name }: SpoilerContext): Spoiler  => {
    return {
        title: translate.t('lowSpoilerTitle'),
        thumb_url: 'https://i.imgur.com/XOzZR7c.png',
        reply_markup: spoilerKeyboard({ id, translate }),
        description: translate.t('lowSpoilerDescription'),
        message_text: translate.t('lowSpoilerMessageText', { spoiler_name })
    };
};

const highSpoiler = ({ translate, id, spoiler_name }: SpoilerContext): Spoiler => {
    return {
        title: translate.t('highSpoilerTitle'),
        thumb_url: 'https://i.imgur.com/TpAVSKT.png',
        description: translate.t('highSpoilerDescription'),
        reply_markup: spoilerKeyboard({ id, translate, isHigh: true }),
        message_text: translate.t('highSpoilerMessageText', { spoiler_name })
    };
};

const newSpoiler = async ({ message, translate, id }: Context): Promise<Array<Spoiler>> => {
    try {
        const { description, spoiler_name } = parseSpoilerText({ message, translate });
        const spoilerId = <number> await addNews({ message: description, id });

        return [
            counterSpoiler({ description, translate }),
            lowSpoiler({ description, spoiler_name, translate, id: spoilerId }),
            highSpoiler({ description, spoiler_name, translate, id: spoilerId })
        ];
    } catch (e) {
        console.error(e);

        return [{
            title: translate.t('errorTitle'),
            thumb_url: 'https://i.imgur.com/hw9ekg8.png',
            description: translate.t('errorDescription'),
            message_text: translate.t('errorMessageText')
        }];
    }
};

const tagSpoiler = ({ translate }: Context): Spoiler => {
    return {
        title: translate.t('tagSpoilerTitle'),
        thumb_url: 'https://i.imgur.com/XkMEbd8.png',
        description: translate.t('tagSpoilerDescription'),
        message_text: translate.t('tagSpoilerMessageText')
    };
};

const sanitizeSpoiler = async ({ message, translate, id }: Context): Promise<Array<Spoiler>> => {
    if (message.length > charactersLimit) {
        return [{
            thumb_url: 'https://i.imgur.com/GPcjNb0.png',
            description: translate.t('sanitizeSpoilerDescription'),
            message_text: translate.t('sanitizeSpoilerMessageText'),
            title: translate.t('sanitizeSpoilerTitle', { length: message.length, limit: charactersLimit })
        }];
    }

    return newSpoiler({ message, translate, id });
};

export const handleSpoiler = async ({ message, translate, id }: Context): Promise<Array<Spoiler>> => {
    if ('' === message) {
        return [{
            title: translate.t('handleSpoilerTitle'),
            thumb_url: 'https://i.imgur.com/ByINOFv.png',
            description: translate.t('handleSpoilerDescription'),
            message_text: translate.t('handleSpoilerMessageText')
        }];
    }

    return [
        tagSpoiler({ translate }),
        ...await sanitizeSpoiler({ message, translate, id })
    ];
};

export const retrieveSpoiler = async ({ id, translate }: Context): Promise<string> => {
    try {
        return <string> await retrieveNews({ id });
    } catch (e) {
        console.error(e);

        return translate.t('errorRetrieve');
    }
};
