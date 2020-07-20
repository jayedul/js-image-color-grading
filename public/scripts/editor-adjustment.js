'use strict';

// This module adjusts various parameters in image
const AdjustmentEditor=function(media, canvas_reference, final_context, final_context_width, final_context_height, onChange)
{
    this.DOM=el('div', {id:'adjustment_editor'});

    this.parameters=
    {
        'Exposure':{min:1, max:200, value:100, step:1},
        'Contrast':{min:0, max:300, value:100, step:1},
        'Saturation':{min:0, max:200, value:100, step:1},
        'Warmth':{min:0, max:100, value:0, step:1},
        'Highlight':{min:0, max:200, value:100, step:1}
    }

    this.adjustExposure=pixels=>
    {
        var d=pixels.data;
        var exposure = this.parameters.Exposure.value/100;

        // Loop through pixels
        for(var i=0; i<d.length; i+=4)
        {
            // Increase/decrease percentage of all colors
            d[i]=d[i]*exposure;
            d[i+1]=d[i+1]*exposure;
            d[i+2]=d[i+2]*exposure;
        }

        return pixels;
    }

    this.adjustSaturation=()=>
    {
        return 'saturate('+this.parameters.Saturation.value+'%)';
    }

    this.adjustHighlight=()=>
    {
        return 'brightness('+this.parameters.Highlight.value+'%)';
    }

    this.adjustContrast=()=>
    {
        return 'contrast('+this.parameters.Contrast.value+'%)';
    }

    this.adjustWarmth=pixels=>
    {
        var d = pixels.data;
        var warmth = this.parameters.Warmth.value/15;

        // Increase blue color that makes cooler look
        var r = warmth*1.5;
        var g = warmth*1.1;
        

        for (var i=0; i<d.length; i+=4) 
        {
            r>=1 ? d[i] = d[i]*r : 0;
            g>=1 ? d[i+1] = d[i+1]*g : 0;
        }

        return pixels;
    }

    this.applyChanges=e=>
    {
        var native_effects = [];

        for(var name in this.parameters)
        {
            // Apply changes
            var method = this['adjust'+name];
            if(typeof method=='function')
            {
                var image_data = method(final_context.getImageData(0, 0, final_context_width, final_context_height));

                if(typeof image_data=='string')
                {
                    // Send native canvas filter name is string
                    native_effects.push(image_data)
                }
                else
                {
                    // If it is not string, then it is image data. So put in the context instead.
                    final_context.putImageData(image_data, 0, 0);
                }
            }
        }

        return native_effects;
    }

    this.rangeChanged=e=>
    {
        // Retrieve data
        var value = e.target.value;
        var name = e.target.name;

        // Update parameters
        this.parameters[name].value=parseInt(value);

        onChange();
    }

    this.render=()=>
    {
        for(var k in this.parameters)
        {
            var controller = el('div');
            var title = el('div', {}, k);
            
            var min = this.parameters[k].min;
            var max = this.parameters[k].max;
            var range = this.parameters[k].range;
            var value = this.parameters[k].value;

            // Create the controllable range input field
            var range = el('input', {type:'range', name:k, min:min, max:max, range:range, value:value});
            range.addEventListener('input', this.rangeChanged);
            

            // Append the title and range input to the parent
            controller.appendChild(title);
            controller.appendChild(range);

            this.DOM.appendChild(controller)
        }

        return this.DOM;
    }
}