$(document).ready(function() {
    //toggle `popup` / `inline` mode
    $.fn.editable.defaults.mode = 'popup';     
    
    //make username editable
    $('#lname').editable();
    
    $('#fname').editable();

    //make comment
    $('#comments').editable({
                               type:  'textarea',
                               pk:    1,
                               name:  'comments',
                               url:   'post.php',  
                               title: 'Enter comments'
                            });
			    
    
    //select
    $('#group').editable();
    
    //date
    $('#dob').editable({
                               type:  'date',
                               pk:    1,
                               name:  'dob',
                               url:   'post.php',  
                               title: 'Select Date of birth'
                            });
			    
    //make status editable
    $('#status').editable({
        type: 'select',
        title: 'Select status',
        placement: 'right',
        value: 2,
        source: [
            {value: 1, text: 'status 1'},
            {value: 2, text: 'status 2'},
            {value: 3, text: 'status 3'}
        ]
        /*
        //uncomment these lines to send data on server
        ,pk: 1
        ,url: '/post'
        */
    });
});