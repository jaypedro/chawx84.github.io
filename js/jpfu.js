//jpFILEUPLOAD - By Jay Pedro @ Bit-Wizards 2016 [http://bitwizards.com/]
//----------------[INFO]-----------------------------------
//  [Dependicies]
//  1.Bootstrap 3+ [http://getbootstrap.com/getting-started/]
//  2.jQuery...obvisouly [https://developers.google.com/speed/libraries/#jquery]
//  3.[Optional] Toastr - used for alerts and whatnot. [https://codeseven.github.io/toastr/]
//  4.[Optional] Font Awesome - can be used in place of the standard glyphicons that ship with bootstrap [https://fortawesome.github.io/Font-Awesome/get-started/]
//
//Right now you can only have one instance of jpFileUpload on a page. Trying to implement this with multiple <input type="file"/> on the same page will cause problems.
(function ($) {
    //Overhead -stuff.....do not change
    var validFileArray = [];
    var invalidFileArray = [];
    var sendText;
    var debugStatus;
    var image;
    var defaults = {
        maxFiles: 1,//Maximum Files Allowed
        maxFileSize: 10485760,//Maximum Size Per File -- in bytes, Default is 10mb
        allowedFileTypes: "",//Allowed File Types
        postUrl: "",//The URL to post the form to.
        useToastr: false,//If you are using toastr
        useFontAwesome: false,//If you are using Font Awesome
        removeAllBtn: true,//Remove all button
        settingsLabel: true,
        toManyFilesMessage: "You can only attach 10 files",//Tried to upload to many files
        invalidFilesMessage: "These files do not meet the requirements!",//Files don't meet requirements
        successMessage: "Files Uploaded!",//Success message
        errorMessage: "Files not uploaded. There was an error please try again.",
        buttonText: "Attach Files",
        

        //Functions
        filesAdded: null, //Runs after files are added to the Valid File Array
        filesRemoved: null,
        beforeDataSend: null,
        sendSuccess: null,
        sendFailure: null,

        //Element Ids - You can change these incase there are collisions
        formId: "",
        debugButtonId: 'jpfu_debugger',
        fileListId: "jpfu_filelist",
        fileInputId: "jpfu_fileinput",
        buttonListId: "jpfu_btns",


    };


    var m = {
        init: function (options) {
            if (options) {
                $.extend(defaults, options);

            }
            //Check for jquery first and foremost
            if (window.jQuery) {
                
                $(this).html(m.htmlFactory("Init Plugin"));
                
                m.getVar('fi').on('change', function () {
                    var files = $(this).prop("files");
                    $.each(files, function (i, v) {
                        validateFile(v);
                    });
                    $(this).val('');
                    validFileArray.length ? createUserList(validFileArray) : null;
                    //If there are items in the invalid file array then we want to display that.
                    invalidFileArray.length ? alertUser(2) : null;
                    invalidFileArray = [];
                });
                m.getVar('fl').on('click', "button", function () {
                    validFileArray.splice($(this).data("index"), 1);
                    rebuildUserList();
                    if (validFileArray.length) {
                        createUserList(validFileArray);
                    }
                    else {
                        defaults.removeAllBtn ? $("#jpfu_removeAll").hide() : null;

                    }
                    $.isFunction(defaults.filesRemoved) && defaults.filesRemoved.call(this);
                    return false;

                });

                //Validates each individual file
                function validateFile(f) {

                    //Builds a user friendly display of the file size
                    var displaySize;
                    //Checks to see if the file size is will show if you round out the megabyte to two decimal places.
                    if (f.size >= 10000) {
                        displaySize = f.size / 1024 / 1024;
                        displaySize = displaySize.toFixed(2);
                        displaySize = displaySize + "mb";
                    }
                    else {
                        displaySize = f.size + "kb";
                    }
                    //Attaches the new display size property to the file object
                    f["displaySize"] = displaySize;

                    //Checks to make sure the file is allowed
                    if (f.name.match(defaults.allowedFileTypes)) {
                        //Adds the appropriate icon for the file type.
                        f["icon"] = buildFileIcon(f.name);
                        
                        //Checks to make sure the file is the right size
                        if (f.size <= defaults.maxFileSize) {
                            //Check to see if there are duplicates.
                            hasDuplicate(f);
                            f.error ? invalidFileArray.push(f) : validFileArray.push(f)


                        }
                        else {
                            //File failed the size check and we attach a property to file object so we can display the error.
                            f["error"] = "file size to large";
                            invalidFileArray.push(f);
                        }
                    }
                    else {
                        //File failed the type check and we attach a property to file object so we can display the error.
                        f["error"] = "wrong file type";
                        invalidFileArray.push(f);
                    }

                }

                //Generates the list of files
                function createUserList(vf) {
                    var currentList = '';
                    rebuildUserList();
                    $("#jpfu_removeAll").length ? $("#jpfu_removeAll").show() : null;

                    if (vf.length >= defaults.maxFiles) {
                        //Another check for to many files
                        vf.splice(defaults.maxFiles, vf.length - defaults.maxFiles);
                        alertUser(1);
                    }
                    $.each(vf, function (i, v) {
                        currentList = currentList + m.htmlFactory("File List Item", v, i);
                    });
                    m.getVar('fl').html(currentList);
                    //Called after files have been selected
                    $.isFunction(defaults.filesAdded) && defaults.filesAdded.call(this);

                }

                //Destroys the list of files
                function rebuildUserList() {
                    m.getVar('fl').html('');
                }

                //Generates a font-awesome/glyphicon icon for the files.
                function buildFileIcon(file) {
                    if (!defaults.useFontAwesome) {
                        return file.type.match(/image.*/) ? "<i class='glyphicon glyphicon-picture'></i>" : "<i class='glyphicon glyphicon-file'></i>";
                    }
                    else {
                        var fileType = file.substr(file.indexOf(".") + 1);
                        switch (fileType) {
                            case "doc":
                            case "docx":
                                return "<i class='fa fa-file-word-o'></i>";
                            case "pdf":
                                return "<i class='fa fa-file-pdf-o'></i>";
                            case "ppt":
                            case "pptx":
                                return "<i class='fa fa-file-powerpoint-o'></i>";
                            case "xls":
                            case "xlsx":
                                return "<i class='fa fa-file-excel-o'></i>";
                            case "zip":
                                return "<i class='fa fa-file-archive-o'></i>";
                            case "png":
                            case "jpg":
                            case "gif":
                            case "jpeg":
                                return "<i class='fa fa-file-image-o'></i>";
                            default:
                                return "<i class='fa fa-file-o'></i>";


                        }
                    }

                }

                //Generates an alert for different things
                function alertUser(alertType) {
                    //Alert Types
                    //1 - To many files
                    //2 - Invalid Files
                    //3 - Debug Clicked
                    //4 - Form data added
                    //5 - Form data not sent
                    if (defaults.useToastr) {
                        toastr.clear();
                    }
                    switch (alertType) {
                        case 1:
                            defaults.useToastr ? toastr["info"](defaults.toManyFilesMessage, "Wait") : m.getVar('fl').append(m.htmlFactory("Alert 1"));
                            break;
                        case 2:
                            defaults.useToastr ? toastr["error"](m.htmlFactory("Invalid File List Toastr"),defaults.invalidFilesMessage) : m.getVar('fl').append(m.htmlFactory("Alert 2"));
                            break;
                        case 3:
                            defaults.useToastr ? toastr["success"]("Debug Clicked. Check the Console log!") : m.getVar('fl').append(generateHTML("Alert 3"));
                        case 4:
                            defaults.useToastr ? toastr["success"](defaults.successMessage) : alert(defaults.successMessage);
                        case 5:
                            defaults.useToastr ? toastr["error"](defaults.errorMessage) : alert(defaults.errorMessage);
                    }
                }

                //Checks to see if the file is a duplicate
                function hasDuplicate(f) {
                    if (validFileArray.length) {
                       return $.each(validFileArray, function (i, v) {
                            if (v.name === f.name) {
                                f["error"] = "Duplicate file";
                                return false;
                            }
                        });
                    }
                }

                //Settings
                function settings() {
                    if (defaults.settingsLabel) {
                        m.getVar('bl').append(m.htmlFactory("Settings Label"));
                    }
                    if (defaults.removeAllBtn) {
                        //Generate Button
                        m.getVar('bl').append(m.htmlFactory("Remove All"));
                        $("#jpfu_removeAll").hide();
                        //Apply Events
                        m.getVar('bl').on("click", "#jpfu_removeAll", function () {
                            validFileArray = [];
                            invalidFileArray = [];
                            rebuildUserList();
                            m.getVar("fi").val('');
                            $.isFunction(defaults.filesRemoved) && defaults.filesRemoved.call(this);
                            $("#jpfu_removeAll").hide();
                            return false;
                        });
                    }

                }
                settings();
            }
            else {
                console.log("You must have jquery installed to use the jpFileUploader. You can get it here https://developers.google.com/speed/libraries/#jquery")
            }
        },
        debugMe: function () {
            console.log("Debug On!");
            var ua = window.navigator.userAgent;
            var ie = ua.indexOf("MSIE ");
            var edge = ua.indexOf("Edge")
            if (ie > 0 || edge > 0) {
                return "IE";
                console.log("Using IE...why? Download Chrome https://www.google.com/chrome/browser/");
            }
            else {
                console.log(ua);
            }
            debugStatus = true;
            m.getVar("bl").append(m.htmlFactory("Debug"));
            m.getVar("bl").on("click", "#" + defaults.debugButtonId, function () {
                console.log(validFileArray);
                return false;
            });
        },
        getVar: function (v) {
            switch (v) {
                case "fl":
                    //The File List
                    return $("#" + defaults.fileListId);
                case "fi":
                    //The File Input
                    return $("#" + defaults.fileInputId);
                case "bl":
                    //The Button List
                    return $("#" + defaults.buttonListId);
                case "frm":
                    //The Form
                    return $("#" + defaults.formId);
                case "sub":
                    return $("#" + defaults.submitButtonId);
                case "msimb":
                    //Max Size In MegaBytes
                    var r = defaults.maxFileSize / 1024 / 1024;
                    return r.toFixed(2);
                case "db":
                    return $("#" + defualts.debugButtonId);
                default:
                    console.log("jpfu - That is not a valid variable");
            }

        },
        //Factory for creating HTML Elements
        htmlFactory: function (elem, file, index) {
            switch (elem) {
                case "Init Plugin":
                    var ic = defaults.useFontAwesome ? 'fa fa-plus' : 'glyphicon glyphicon-plus';
                    return "<div class='row'>" +
                            "<div id='" + defaults.buttonListId + "' class='col-xs-12 col-sm-12 col-md-12 col-lg-12 clearfix'>" +
                                "<span class='btn btn-success btn-file' style=' position: relative; overflow: hidden;'>" +
                                    "<i class='" + ic + "'></i>&nbsp;" +
                                    defaults.buttonText +
                                    "<input type='file' multiple class='form-control' id='" + defaults.fileInputId + "' style='position: absolute; top: 0; right: 0; min-width: 100%; min-height: 100%; font-size: 100px; text-align: right; filter: alpha(opacity=0); opacity: 0; outline: none; background: white; cursor: inherit; display: block;' />" +
                                "</span>&nbsp;" +
                            "</div>" +
                        "</div>" +
                        "<div class='row'>" +
                            "<div style='padding-top: 10px' class='col-xs-12 col-sm-12 col-md-12 col-lg-12'>" +
                                "<ul id='" + defaults.fileListId + "' class='list-group'></ul>" +
                            "</div>" +
                        "</div>";
                case "File List Item":
                    //The File List Item
                    var deleteIcon = defaults.useFontAwesome ? "fa fa-trash" : "glyphicon glyphicon-trash"
                
                    return "<li class='list-group-item clearfix hover'>" +
                        file.icon + "&nbsp;" + file.name + "&nbsp;<em class='text-muted'><small>" + file.displaySize + "</small></em>" +
                         "<button class='btn btn-danger btn-sm pull-right' data-index='" + index + "'>" +
                            "<i class='" + deleteIcon + "'></i>&nbsp;" +
                                "Delete" +
                         "</button>" +
                    "</li>";
                case "Remove All":
                    //The Remove All Button
                    return defaults.useFontAwesome ?
                        "<button class='btn btn-warning pull-right' id='jpfu_removeAll'><i class='fa fa-warning'></i>&nbsp;Remove All</button>&nbsp;" :
                        "<button class='btn btn-warning pull-right' id='jpfu_removeAll'><i class='glyphicon glyphicon-warning-sign'></i>&nbsp;Remove All</button>&nbsp;"
                case "Debug":
                    //The Debug Button
                    return defaults.useFontAwesome ?
                        "<button class='btn btn-info' id='" + defaults.debugButtonId + "' title='View File Array'><i class='fa fa-bug'></i></button>" :
                        "<button class='btn btn-info' id='jpfu_debugger'><i class='glyphicon glyphicon-fire'></i></button>";
                case "Settings Label":
                    //The Settings Label
                    return "<span><em><small>Up to" + defaults.maxFiles + " files at " + m.getVar("msimb") + "mb or less each.</small><em></span>";
                case "Alert 1":
                    //The 1st Alert
                    return "<div class='alert alert-info alert-dismissible' role='alert'>" +
                                  "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
                                      "<span aria-hidden='true'>&times;</span>" +
                                  "</button>" +
                                  "<strong>Wait!</strong>" + defaults.toManyFilesMessage +
                             "</div>";
                case "Alert 2":
                    //The 2nd Alert
                    var errorWarning = '';
                    $.each(invalidFileArray, function (i, v) {
                        errorWarning = errorWarning + v.name + " - [" + v.error + "]<br />";
                    });
                    return "<div class='alert alert-danger alert-dismissible' role='alert'>" +
                                "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
                                    "<span aria-hidden='true'>&times;</span>" +
                                "</button>" +
                                "<strong>Nope</strong>&nbsp;" + defaults.invalidFilesMessage + "<br />" +
                        errorWarning
                    "</div>";
                case "Alert 3":
                    //The 3rd Alert
                    return "<div class='alert alert-success alert-dismissible' role='alert'>" +
                         "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
                             "<span aria-hidden='true'>&times;</span>" +
                         "</button>" +
                         "<strong>Debug Clicked</strong> Check the console log!" +
                    "</div>";
                case "Invalid File List Toastr":
                    var ivfl = "";
                    $.each(invalidFileArray, function (i, v) {
                        i > 0 ? ivfl = ivfl + v.name + " - [ " + v.error + " ]<br />" : ivfl = v.name + " - [ " + v.error + " ]<br />";
                    });
                    return ivfl;



            }
        },
        send: function () {
            if (debugStatus) {
                debugger;
            };
            var fd = new FormData();
            var key;
            var value;
            $.each(validFileArray, function (i, v) {
                fd.append(v.name, v, v.name);
            });
            var form_data = m.getVar('frm').serializeArray();
            $.each(form_data, function (i, v) {
                fd.append(v.name, v.value);
            });
            $.ajax({
                url: defaults.postUrl,
                data: fd,
                cache: false,
                contentType: false,
                processData: false,
                type: "POST",
                beforeSend: function () {
                    $.isFunction(defaults.beforeDataSend) && defaults.beforeDataSend.call(this)
                },
                success: function () {
                    $.isFunction(defaults.sendSuccess) && defaults.sendSuccess.call(this);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    sendText = errorThrown;
                    $.isFunction(defaults.sendFailure) && defaults.sendFailure.call(this);
                },

            });
            
        },
        totalFiles: function () {
            this.rv = validFileArray.length
            return this;
        },
        sendStatus: function () {
            this.rv = sendText;
            return this;
        }
    }
    $.fn.jpfu = function (method) {
        var args = arguments;
        var $this = this;
        var pmeths = [
               {
                   name: "debugMe",
                   pub: true,
               },
               {
                   name: "getVar",
                   pub: false
               },
               {
                   name: "htmlFactory",
                   pub: false
               },
                {
                    name: "send",
                    pub: true
                },
                {
                    name: "totalFiles",
                    pub: true,
                    returnVal: true,

                },
                {
                    name: "sendStatus",
                    pub: true,
                    returnVal: true
                }

        ];
        var results = [];

        if (m[method]) {
            $.each(pmeths, function (i, v) {
                if ([method] == v.name) {
                    if (v.pub) {
                        if (v.returnVal) {
                            results.push(m[method].apply($this, Array.prototype.slice.call(args, 1)));
                            return results[0].rv;
                        }
                        else {
                            return m[method].apply($this, Array.prototype.slice.call(args, 1));
                        }
                    }
                    else {
                        console.log([method] + " is a private, keep out :)");
                    }
                }
            });
        } else if (typeof m === 'object' || !m) {
            return m.init.apply($this, Array.prototype.slice.call(args, 0));
        } else {
            console.log(m + "  is something that jpFileUpload just doesn't do.");
        }

    };
}(jQuery));
