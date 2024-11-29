/**
 * @author Aref Mirhosseini <code@arefmirhosseini.com> (http://arefmirhosseini.com)
 */

import rp from 'request-promise'
import { telegram as configs } from '../configs/configs'

class TelegramClient {

    constructor(ApiToken) {
        this.ApiReq = rp.defaults({
            baseUrl: `${configs.base_url}${ApiToken}`,
            headers: { 'Content-Type': 'application/json' }
        })
        
        return {
            listen: this.ListenMessages.bind(this),
            reply: this.ReplyMessage.bind(this),
            inlineReply: this.InlineReplyMessage.bind(this)
        }
    }

    ListenMessages(baseHookUrl, allowedUpdates = []) {
        if (typeof baseHookUrl === 'undefined') {
            throw new Error('You have to set "listenerUrl" before injecting client listener.').message
            return
        }
        switch (this.GetObjType(allowedUpdates)) {
            case 'string':
                allowedUpdates = allowedUpdates.split(',')
            break
            case 'array':
                allowedUpdates = allowedUpdates
            break
            default:
                allowedUpdates = []
        }
        if (!allowedUpdates.length)
            allowedUpdates = ['message', 'callback_query']
        this.SetHook(baseHookUrl, {
            allowed_updates: allowedUpdates
        })
    }

    SetHook(url, options = {}, callback = this.ResponseHandler) {
        if (typeof url === 'undefined') {
            throw new Error('You have to set "listenerUrl" before injecting client listener.').message
            return
        }
        let opts = Object.assign({}, { url: url }, options)
        this.ApiReq({
                url: '/setWebhook',
                method: 'POST',
                json: true,
                body: opts
            })
            .then(hook => callback(hook))
            .catch(this.ErrorHandler)
    }

    ReplyMessage(ChatID, text, opts = {}, callback = this.ResponseHandler) {
        if (typeof ChatID === 'undefined') {
            throw new Error('You have to set "chat id" before replying.').message
            return
        }
        let reqBody = Object.assign({}, {
            chat_id: ChatID,
            text: text
        }, opts)
        this.ApiReq({
            url: '/sendMessage',
            method: 'POST',
            json: true,
            body: reqBody
        })
        .then(resp => {
            callback(resp)
            return null
        })
        .catch(this.ErrorHandler)
    }

    InlineReplyMessage(inlineQueryId, results = [], opts = {}) {
        if (typeof inlineQueryId === 'undefined') {
            throw new Error('You have to set "inline query id" before replying.').message
            return
        }
        switch (this.GetObjType(results)) {
            case 'string':
                results = results.split(',')
                break
            case 'array':
                results = results
                break
            default:
                results = []
        }
        if (!results.length) {
            throw new Error('You have to set at least one result for replying.').message
            return
        }
        let reqBody = Object.assign({}, {
            inline_query_id: inlineQueryId,
            results: results
        }, opts)
        this.ApiReq({
            url: '/answerInlineQuery',
            method: 'POST',
            json: true,
            body: reqBody
        })
        .then(resp => {
            callback(resp)
            return null
        })
        .catch(this.ErrorHandler)
    }

    ResponseHandler(resp) {
        return resp
    }

    ErrorHandler(err) {
        throw new Error(err)
    }

    GetObjType(Obj) {
        return Object.prototype.toString.call(Obj).substr(8).match(/(.+)?\]/)[1].toLowerCase()
    }

}

export default TelegramClient
