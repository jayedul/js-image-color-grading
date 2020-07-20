'use strict';

// This module crops and rotates image
const CropEditor=function(media, canvas_reference, final_context, final_context_width, final_context_height, onChange, drawImage, media_state)
{
    this.DOM=el('div', {id:'crop_editor'});

    this.parameters=
    {
        'Flip' : ['None', 'Flip Horizontally', 'Flip Vertically'],
        'Rotate' : ['0 deg', '30 deg', '60 deg', '90 deg', '180 deg'],
        'Ratio' : ['Auto', '16:9', '10:7', '7:5', '4:3', '5:3', '3:2']
    }
    
    this.state=
    {
        current_rotation : 0,
        current_flip : null,
        original_context_width : final_context_width,
        original_context_height : final_context_height,
        
    }
    
    this.applyFlip=flip=>
    {
        this.state.current_flip=flip;

        switch(flip)
        {
            case 'Flip Horizontally':   final_context.translate(media_state.width, 0);
                                        final_context.scale(-1, 1);
                                        onChange();
                                        break;

            case 'Flip Vertically'  :   final_context.translate(0, media_state.height);
                                        final_context.scale(1, -1);
                                        onChange();
                                        break;

            default                 :   final_context.setTransform(1, 0, 0, 1, 0, 0);
                                        this.applyRotate(this.state.current_rotation, true);
        }
    }

    this.getRotationAdjustment=rotate=>
    {
        var {current_rotation}=this.state;

        console.log(rotate, current_rotation);

        if(current_rotation>rotate)
        {
            rotate = -(current_rotation-rotate);
        }
        else if(current_rotation<rotate)
        {
            rotate = rotate-current_rotation;
        }
        else
        {
            rotate=0;
        }

        this.state.current_rotation = current_rotation+rotate;

        console.log(rotate, this.state.current_rotation);

        return rotate;
    }

    this.applyRotate=(degree_text, direct_use)=>
    {
        var {width, height}=media_state;

        var degree = direct_use ? degree_text : this.getRotationAdjustment(parseInt(degree_text));
        var radian = degree * (Math.PI / 180);

        var center_x = width/2;
        var center_y = height/2;

        final_context.clearRect(0, 0, width, height);
        final_context.translate(center_x, center_y);
        final_context.rotate(radian);
        final_context.translate(-center_x, -center_y);
        
        onChange();
    }

    this.applyRatio=ratio=>
    {
        var {original_context_width, original_context_height}=this.state;

        var is_auto = ratio=='Auto';
        var parameter = ratio.split(':');
        var width = is_auto ? original_context_width : parseInt(parameter[0]);
        var height = is_auto ? original_context_height : parseInt(parameter[1]);


        // Determine the widths of original and target ratio
        var original_width_percent = (original_context_width/original_context_height)*100;
        var target_width_percent = (width/height)*100;
        var is_target_wider = target_width_percent>original_width_percent;

        // Calculate the new target width and height without wasting pixels
        var new_width = is_target_wider ? original_context_width : (width/height)*original_context_height;
        var new_height = is_target_wider ? (height/width)*original_context_width : original_context_height;

        // Calculate the image offset to show center portion
        var x_coordination = is_target_wider ? 0 : (original_context_width-new_width)/2;
        var y_coordination = is_target_wider ? (original_context_height-new_height)/2 : 0;

        // Apply the new ratio
        canvas_reference.width=new_width;
        canvas_reference.height=new_height;

        // Draw the image on the canvas again with new offset
        drawImage(new_width, new_height, x_coordination, y_coordination);
        onChange();

        // For some reason rotation and flip gets reset after ratio change. So reinstate older rotation and flip mode.
        this.applyRotate(this.state.current_rotation, true);
        this.applyFlip(this.state.current_flip);
    }

    this.optionClicked=(p_type, option, option_container, i)=>
    {
        this['apply'+p_type](option);

        toggleActiveClass(option_container, i);
    }

    this.renderParameter=(p_type, options)=>
    {
        var container = el('div');

        // Loop through all the option in particular category such as rotate, ratio
        for(var i=0; i<options.length; i++)
        {
            var option_container = el('div', {class:i==0 ? 'active' : ''}, options[i]);

            // Click handler callback
            var callback = ((p_type, option, option_container, i)=>()=>
            {
                this.optionClicked(p_type, option, option_container, i);

            })(p_type, options[i], option_container, i);

            option_container.addEventListener('click', callback);

            container.appendChild(option_container);
        }

        return container;
    }

    this.render=()=>
    {
        // Loop through different types of parameter editor and render
        for(var p_type in this.parameters)
        {
            // Parameter title
            var container = el('div');
            container.appendChild(el('div', {}, p_type));
            
            // Parameter editor
            var editor = el('div');
            editor.appendChild(this.renderParameter(p_type, this.parameters[p_type]));

            // Append accordingly
            container.appendChild(editor);
            this.DOM.appendChild(container);
        }

        return this.DOM;
    }
}