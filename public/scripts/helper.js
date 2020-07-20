'use strict';

/* --------------Helpers-------------- */
// All ajax request type are post
// Simplicity matters
const ajaxRequest=(url_slug, data, callback, u_progress)=>
{
    // Prepare headers
    let headers =
    {
        'Accept'            : 'application/json'
    }

    // Let browser set content type header for FormData
    !(data instanceof FormData) ? headers['Content-Type']='application/json;charset=UTF-8' : 0;

    // Prepare AJAX
    let request = window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest();
    request.onreadystatechange = function()
    {
        if(this.readyState!==4){return;}

        // Set infinity retry
        // User might need time to get connected to internet again
        // Though it has some pitfall, but getting connected matters.
        if(this.status==0)
        {
            setTimeout(()=>ajaxRequest(url_slug, data, callback, u_progress), 5000);
            return;
        }
        
        // Prepare response object
        let resp;
        try {resp=JSON.parse(this.response);} catch (e){}
        typeof resp!=='object' ? resp={} : 0;

        // Dispatch request handler
        callback ? callback(resp, this.status) : 0;
    };

    // Assign request progress handler
    typeof u_progress=='function' ? request.upload.addEventListener('progress', e=>u_progress(Math.round(e.loaded/e.total * 100)), false) : 0;

    // Open request and set request header
    request.open('POST', url_slug, true);
    Object.keys(headers).forEach(k=>request.setRequestHeader(k, headers[k]));

    // Send finally
    request.send(data instanceof FormData ? data : JSON.stringify(data));
}


// Create element programmatically
const el=function(tag, atts, child)
{
    var el = document.createElement(tag);
    child ? el.innerHTML=child : 0;

    if(typeof atts=='object')
    {
        for(var k in atts)
        {
            el.setAttribute(k, atts[k]);
        }
    }

    return el;
}

// Clear a DOM element
const clearDom=function(parent)
{
    var dom_holder = parent || this.DOM;

    if(dom_holder)
    {
        while(dom_holder.firstChild)
        {
            dom_holder.removeChild(dom_holder.firstChild);
        }
    }
}

const getColorTones=pixels=>
{
    // This function is supposed to parse highlight and shadow color dynamically from the 'pixels' array.
    return [[22, 185, 244], [65, 8, 228]];
}

const toggleActiveClass=(element, active_index)=>
{
    var nodes = element.parentNode.childNodes;

    // Loop through siblings and toggle active class
    for(var i=0; i<nodes.length; i++)
    {
        nodes[i].setAttribute('class', (i==active_index ? 'active' : ''));
    }
}