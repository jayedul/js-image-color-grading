'use strict';

// Upload Manager Component
const Upload=function(goBackToHome)
{
    this.DOM=el('div', {id:'upload_container'});

    // Upload file to the server and refresh the list
    this.uploadFiles=function(f)
    {
        if(f.length==0){return;}

        // Check file mime type. Make sure it is image.
        if(!(f[0].type.indexOf('image')===0))
        {
            alert('Only Image, Please.');
            return;
        }
        
        // Prepare form data
        var form = new FormData();
        form.append('new_media', f[0], f[0].filename);

        // Send to server
        ajaxRequest('uploadFile', form, r=>
        {
            if(r.status!=='success')
            {
                alert('Something Went Wrong.');
                return;
            }

            // Reload gallery after successful upload
            goBackToHome();
        });
    }

    // Add/remove visual effect from drag area on drag over/leave.
    this.toggleDragoverState=(element, is_over)=>
    {
        event.preventDefault();
        
        element.setAttribute('class', (is_over ? 'is_over' : ''));
    }

    // Pass the dropped file to upload processor method.
    this.receiveFileFromDrop=event=>
    {
        event.preventDefault();

        if(event.dataTransfer.items && event.dataTransfer.items[0]) 
        {
            this.uploadFiles([event.dataTransfer.items[0].getAsFile()]);
        }
    }


    // Render HTML tags and register event handlers
    this.render=function()
    {
        var title = el('div', {}, 'Upload Image');

        var uploadFiles = this.uploadFiles;
        var upload_container = el('div');
        var upload = el('div', {id:'upload_interface'});
        var browser = el('span', {class:'browse_file'}, ' Browse for Files');
        var input = el('input', {type:'file', accept:'image/*'});

        // Add event listeners
        browser.addEventListener('click', function(){input.click();});
        input.addEventListener('change', function(){uploadFiles(input.files)});
        upload.addEventListener('dragover', ()=>this.toggleDragoverState(upload, true));
        upload.addEventListener('dragleave', ()=>this.toggleDragoverState(upload, false));
        upload.addEventListener('drop', this.receiveFileFromDrop);

        // Append DOM
        upload.appendChild(el('span', {}, 'Drag and Drop or '));
        upload.appendChild(browser);
        upload.appendChild(input);
        upload_container.appendChild(upload)

        // Append DOM to root upload container
        this.DOM.appendChild(title);
        this.DOM.appendChild(upload_container);

        return this.DOM;
    }
}


// Single Media Action Interface (back, save, revert)
const SingleMediaAction=function(closeMedia, saveMedia, revertToOriginal)
{
    this.render=()=>
    {
        // Render action button
        var action_container = el('div', {id:'action_button_container'});

        // Create action buttons
        var back_button = el('button', {class:'no-outline button button-secondary'}, 'Back');
        var save_button = el('button', {class:'no-outline button button-primary'}, 'Save');

        // Assign handler
        back_button.addEventListener('click', closeMedia);
        save_button.addEventListener('click', saveMedia);

        // Create revert button if necessary
        if(revertToOriginal)
        {
            var revert_button = el('button', {class:'no-outline button button-secondary revert-button'}, 'Revert to Original');
            revert_button.addEventListener('click', revertToOriginal);
            action_container.appendChild(revert_button);
        }

        // Mount
        action_container.appendChild(back_button);
        action_container.appendChild(save_button);

        return action_container;
    }
}


// Grid view of multiple media
const Grid=function(media, openSingle)
{
    this.DOM = el('div', {id:'grid_container'});

    this.render=function()
    {
        // Item count
        this.DOM.appendChild(el('h2', {}, media.length+' Items'));

        // Loop through media files and render according to mime type 
        for(var i=0; i<media.length; i++)
        {
            var file = media[i];

            // Wrapper element for single media
            var element = document.createElement('div');

            // Crate media and file name
            element.appendChild(el('img', {src:file.file_url}));
            element.appendChild(el('span', {}, file.file_name));

            element.addEventListener('click', ((file, index)=>()=>openSingle(file, index))(file, i));

            this.DOM.appendChild(element);
        }
        
        return this.DOM;
    }
}


// Single Image Manager Interface
const SingleMedia=function(media, media_index, closeSingleMedia)
{
    this.clearDom = clearDom;
    this.DOM = el('div', {id:'single_media'});

    // Prepare necessary resources
    this.editor_container = null;
    this.edit_image = null;
    this.edit_canvas = el('canvas');
    this.edit_context = null;

    // Generate editor Objects    
    this.navigation_map=
    {
        'filter' : {title:'Filter', icon:'', component_reference:FilterEditor},
        'adjustment' : {title:'Adjust', icon:'', component_reference:AdjustmentEditor},
        'crops' : {title:'Crop', icon:'', component_reference:CropEditor}
    }

    this.state=
    {
        current_module:'filter'
    }


    // Render all the three editors and put in property
    // These rendered editor components will take place according to currently selected component
    this.initializeEditors=()=>
    {
        for(var mod in this.navigation_map)
        {
            // Instantiate the editor Object
            var obj = new this.navigation_map[mod].component_reference
                        (media, 
                        this.edit_canvas,
                        this.edit_context, 
                        this.edit_canvas.width, 
                        this.edit_canvas.height, 
                        this.commitFilter,
                        this.drawImage,
                        this.state);

            this.navigation_map[mod].component = obj.render();
            this.navigation_map[mod].obj = obj;
        }

        this.commitFilter();
    }

    // Draw selected image into canvas
    this.drawImage=(width, height, x_coordination, y_coordination)=>
    {
        // Collect the arguments
        var w=width || this.state.width;
        var h=height || this.state.height;
        var x=x_coordination || this.state.x_coordination;
        var y=y_coordination || this.state.y_coordination;

        // Update state parameters
        // Crop editor will change these parameters
        x_coordination!==undefined ? this.state.x_coordination = x_coordination : 0;
        y_coordination!==undefined ? this.state.y_coordination = y_coordination : 0;
        width!==undefined ? this.state.width = width : 0;
        height!==undefined ? this.state.height = height : 0;
        
        // Draw the image in the context
        this.edit_context.drawImage(this.edit_image, x, y, w, h, 0, 0, w, h);
    }

    this.commitFilter=()=>
    {
        this.drawImage();

        // Now execute all the filters
        var native_effects=[];

        for(var mod in this.navigation_map)
        {
            var method = this.navigation_map[mod].obj.applyChanges;
            var response = typeof method=='function' ? method() : null;

            if(response)
            {
                !Array.isArray(response) ? response=[response] : 0;
                native_effects = native_effects.concat(response);
            }
        }

        this.edit_context.filter = native_effects.length>0 ? native_effects.join(' ') : 'none';
    }

    this.mountComponent=()=>
    {        
        // Load the image at first
        this.edit_image = new Image();

        this.edit_image.src=media.file_url;
        this.edit_image.onload=()=>
        {
            var {width, height}=this.edit_image;

            // Make the canvas size same as the image
            this.edit_canvas.width = width;
            this.edit_canvas.height = height;

            // Set default parameters
            this.state.x_coordination = 0;
            this.state.y_coordination = 0;
            this.state.width = width;
            this.state.height = height;

            // Store the context in this object
            this.edit_context = this.edit_canvas.getContext('2d');

            // Now initialize the editors component
            this.initializeEditors();

            // Finally render
            this.render();
        };

        return this.DOM;
    }
    
    this.setModule=(container, mod)=>
    {
        var nodes=container.childNodes;
        this.state.current_module=mod;

        // Loop through nav menus and set as active/inactive
        for(var i=0; i<nodes.length; i++)
        {
            var id=nodes[i].getAttribute('id');
            nodes[i].setAttribute('class', (id=='nav_'+mod ? 'active' : ''));
        }

        // Open the active editor
        this.openEditor(mod);
    }

    this.openEditor=editor=>
    {
        // Clear existing contents from the editor container
        this.clearDom(this.editor_container);

        // Add specific editor according to the current module
        this.editor_container.appendChild(this.navigation_map[editor].component);
    }

    this.saveModifiedFileOnServer=()=>
    {
        this.edit_canvas.toBlob(blob=>
        {
            var form = new FormData();
            form.append('modified_image', blob, media.file_name);
            form.append('file_index', media_index);

            ajaxRequest('saveModifiedFile', form, r=>
            {
                if(r.status!=='success')
                {
                    alert('Something Went Wrong.');
                    return;
                }

                closeSingleMedia();
            });
        });
    }

    this.revertToOriginal=()=>
    {
        media.file_url=media.file_url_original;
        this.mountComponent();
    }

    this.render=()=>
    {
        this.clearDom();

        // Render the main image
        this.DOM.appendChild(this.edit_canvas);

        // Create Navigation
        var nav_container=el('div', {id:'nav_container'});
        var {current_module}=this.state;

        // Loop through nav map and generate HTML
        for(var k in this.navigation_map)
        {
            var nav=el('div', {class:k==current_module ? 'active' : '', id:'nav_'+k}, this.navigation_map[k].title);
            nav.addEventListener('click', (mod=>()=>this.setModule(nav_container, mod))(k));
            nav_container.appendChild(nav);
        }

        // Render navigation container
        this.DOM.appendChild(nav_container);

        // Render current editor
        this.editor_container=el('div');
        this.DOM.appendChild(this.editor_container);
        this.openEditor(current_module);
        
        // Append action button
        var revert_callback = media.file_url!==media.file_url_original ? this.revertToOriginal : null;
        this.DOM.appendChild(new SingleMediaAction(closeSingleMedia, this.saveModifiedFileOnServer, revert_callback).render());

        return this.DOM;
    }
}


// The root app renderer
const Gallery=function()
{
    this.clearDom = clearDom;
    this.DOM = document.createElement('div');

    this.state=
    {
        media : [],
        single_media : null,
        media_index : null
    };

    // setState equivalent for components
    this.setState=(new_object, callback)=>
    {
        this.state = Object.assign((this.state || {}), new_object);
        typeof this.render=='function' ? this.render() : 0;
        typeof callback=='function' ? callback() : 0;
    }

    // Open single image to edit upon clicking individuals in grid
    this.openSingleMedia=function(t, single_media, media_index)
    {
        t.setState
        ({
            single_media : single_media, 
            media_index : media_index
        });
    }

    // Send file list request before first rendering
    this.componentWillMount=()=>
    {
        ajaxRequest('getGallery', {}, response=>
        {
            this.setState({media:response.media_files});
        });

        return this;
    }

    // Back to gallery from single media upon save/back button click
    this.backToGallery=()=>
    {
        this.setState
        ({
            single_media:null,
            media_index : null

        }, this.componentWillMount);
    }

    // Render contents in the node and return the rendered node
    this.render=function()
    {
        var child;

        this.clearDom();

        var {single_media, media_index, media}=this.state;

        if(single_media)
        {
            // Render the single image editor interface
            child=new SingleMedia(single_media, media_index, this.backToGallery).mountComponent();
        }
        else
        {
            child = el('div');

            // Render the grid view of multiple media
            child.appendChild(new Grid(media, (media, index)=>this.openSingleMedia(this, media, index)).render());

            // Render upload manager component
            child.appendChild(new Upload(this.backToGallery).render());
        }

        // Render them into parent
        this.DOM.appendChild(el('div', {class:'screen_title'}, (single_media ? single_media.file_name : 'Media Library')));
        this.DOM.appendChild(child);  

        return this.DOM;
    }
}