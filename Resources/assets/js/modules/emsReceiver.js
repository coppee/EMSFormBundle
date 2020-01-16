import {encoding, security} from '../helpers';

const DEFAULT_CONFIG = {
    "id": false,
    "domains": [],
};

export class emsReceiver
{
    constructor(options)
    {
        let config = Object.assign({}, DEFAULT_CONFIG, options);
        this.domains = config.domains;
        this.id = config.id;
        this.lang = document.documentElement.lang;
        this.basePath = window.location.pathname.replace(/\/iframe\/.*/g, '');

        if (this.id !== false) {
            window.addEventListener("message", evt => this.onMessage(evt));
        }
    }

    onMessage(message)
    {
        if ( !this.domains.includes(message.origin) ) {
            return;
        }

        let data = encoding.jsonParse(message.data);

        if (!data) {
            return;
        }

        let xhr = new XMLHttpRequest();
        xhr.addEventListener("load", evt => this.onResponse(evt, xhr, message));

        switch (data.instruction) {
            case "form": {
                xhr.open("GET", this.basePath+"/form/"+this.id+'/'+this.lang);
                xhr.setRequestHeader("Content-Type",  "application/json");
                xhr.send();
                break;
            }
            case "submit": {
                xhr.open("POST", this.basePath+"/form/"+this.id+"/"+this.lang);
                xhr.setRequestHeader("Content-Type",  "application/x-www-form-urlencoded");
                security.addHashCashHeader(data, xhr);
                xhr.send(encoding.urlEncodeData(data.form));
                break;
            }
            case "dynamic": {
                xhr.open("POST", this.basePath+"/ajax/"+this.id+"/"+this.lang);
                xhr.setRequestHeader("Content-Type",  "application/x-www-form-urlencoded");
                security.addHashCashHeader(data, xhr);
                xhr.send(encoding.urlEncodeData(data.data));
                break;
            }
            default:
                return;
        }
    }

    onResponse(evt, xhr, message)
    {
        if (xhr.status === 200) {
            message.source.postMessage(xhr.responseText, message.origin);
        }
    }
}
