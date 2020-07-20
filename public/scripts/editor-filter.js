'use strict';

// This module applies various filter to image
const FilterEditor=function(media, canvas_reference, final_context, final_context_width, final_context_height, onChange)
{
    this.DOM=el('div', {id:'filter_editor'});

    this.current_mode='Original';

    this.effects=
    [
        'Original',
        'Grayscale',
        'Sepia',
        'Invert',
        'Duotone',
        'Warm',
        'Cool',
        'Dramatic'
    ];

    this.filterCool=pixels=>
    {
        var d = pixels.data;

        for (var i=0; i<d.length; i+=4) 
        {
            // Increase blue color that makes cooler look
            d[i] = d[i]*.75;
            d[i+1] = d[i+1]*.85;
            d[i+2] = d[i+2]*1.7;
        }

        return pixels;
    }


    this.filterWarm=pixels=>
    {
        var d = pixels.data;

        for (var i=0; i<d.length; i+=4) 
        {
            // Increase blue color that makes cooler look
            d[i] = d[i]*1.5;
            d[i+1] = d[i+1]*1.05;
            d[i+2] = d[i+2]*.6;
        }

        return pixels;
    }
    
    this.filterDramatic=pixels=>
    {
        var d = pixels.data;

        for (var i=0; i<d.length; i+=4) 
        {
            // Increase blue color that makes cooler look
            d[i] = d[i]*1.3;
            d[i+1] = d[i+1]*1.4;
            d[i+2] = d[i+2]*.9;
        }

        return pixels;
    }
    
    this.filterInvert=pixels=>
    {
        var d = pixels.data;

        for (var i=0; i<d.length; i+=4) 
        {
            // Increase blue color that makes cooler look
            d[i] = 255-d[i];
            d[i+1] = 255-d[i+1];
            d[i+2] = 255-d[i+2];
        }

        return pixels;
    }

    this.filterGrayscale=pixels=>
    {
        var d = pixels.data;

        for (var i=0; i<d.length; i+=4) 
        {
            var average = (d[i]+d[i+1]+d[i+2])/3;
            
            d[i] = average;
            d[i+1] = average;
            d[i+2] = average;
        }

        return pixels;
    }
    
    this.filterDuotone=(pixels, effect, width, height)=>
    {
        // var tones = getColorTones(pixels.data);

        var tones = [[22, 185, 244], [65, 8, 228]];

        var dueToneData = convertToDueTone(pixels, width*height, tones[0], tones[1]);
        var new_data = new ImageData(new Uint8ClampedArray(dueToneData), width, height);

        return new_data;
    }
    
    this.filterSepia=pixels=>
    {        
        var d = pixels.data;

        for (var i=0; i<d.length; i+=4) 
        {
            var r=d[i];
            var g=d[i+1];
            var b=d[i+2];
            
            d[i] = (r * .393) + (g *.769) + (b * .189);
            d[i+1] = (r * .349) + (g *.686) + (b * .168);
            d[i+2] = (r * .272) + (g *.534) + (b * .131);
        }

        return pixels;
    }

    this.applyChanges=(c, e, w, h)=>
    {
        // If c, e, w, h doesn't exist, it means this method is called from SingleMedia component.
        // If exists, it means this method is called to render sample preview 
        var context = c || final_context;
        var width = w || final_context_width;
        var height = h || final_context_height;
        var effect = e || this.current_mode;

        // Get the filter method
        var custom_filter = this['filter'+effect];

        // Apply the filter if the corresponding method exists in this object
        if(typeof custom_filter=='function' && effect!=='Original')
        {
            var pixels = context.getImageData(0, 0, width, height);
            var grade = custom_filter(pixels, effect, width, height);

            // Modify pixels
            context.putImageData(grade, 0, 0);
        }
    }

    this.modeChanged=(effect_name, effect_container, active_index)=>
    {
        toggleActiveClass(effect_container, active_index);
        
        this.current_mode=effect_name;

        onChange();
    }

    this.render=()=>
    {
        // Loop through all the effects such as original, grayscale, sepia and so on.
        for(var i=0; i<this.effects.length; i++)
        {
            var effect_name = this.effects[i];

            // Insert canvas in DOM before image onload callback
            // This way effect order will be same according to the array
            var effect_sample_container = el('div', {class:effect_name=='Original' ? 'active' : ''});
            var canvas = el('canvas');
            effect_sample_container.appendChild(canvas);
            effect_sample_container.appendChild(el('span', {}, effect_name));
            effect_sample_container.addEventListener('click', ((e, c, i)=>()=>this.modeChanged(e, c, i))(effect_name, effect_sample_container, i))
            this.DOM.appendChild(effect_sample_container);


            // Now load image
            var image = new Image();
            image.src=media.file_url;
            image.onload=((image, canvas, effect_name, parent_object)=>()=>
            {
                var w = image.width;
                var h = image.height;

                canvas.width = w;
                canvas.height = h;

                var context = canvas.getContext('2d');                

                // Then draw the image
                context.drawImage(image, 0, 0, w, h, 0, 0, w, h);

                // Apply preview filter
                parent_object.applyChanges(context, effect_name, w, h);

            })(image, canvas, this.effects[i], this);
        }

        return this.DOM;
    }
}
