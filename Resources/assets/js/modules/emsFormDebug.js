import {addDynamicFields, replaceFormFields} from "../dynamicFields";
import {encoding, security} from '../helpers';

export const DEFAULT_CONFIG = {
    idForm: 'wrapper-form'
};

export class emsFormDebug
{
    constructor(options)
    {
        let config = Object.assign({}, DEFAULT_CONFIG, options);
        this.elementForm = document.getElementById(config.idForm);
        this.ajaxUrl = window.location.pathname.replace(/\/debug\/form\//g, '/debug/ajax/');
    }

    onDynamicFieldChange(data)
    {
        let xhr = new XMLHttpRequest();
        xhr.addEventListener("load", evt => emsFormDebug.onResponse(evt, xhr, this));

        xhr.open("POST", this.ajaxUrl);
        xhr.setRequestHeader("Content-Type",  "application/x-www-form-urlencoded");
        security.addHashCashHeader(data, xhr);
        xhr.send(encoding.urlEncodeData(data));
    }

    static onResponse(evt, xhr, emsFormInstance)
    {
        if (xhr.status !== 200) {
            return;
        }

        let data = encoding.jsonParse(xhr.responseText);

        if (!data) {
            return;
        }
        
        if (data.instruction === 'dynamic') {
            replaceFormFields(data.response, Object.values(encoding.jsonParse(data.dynamicFields)));
            addDynamicFields(emsFormInstance.elementForm.querySelector('form'), emsFormInstance);
        }
    }
}
