$(function(){
    /////////////////////////////////
    /////////// Scrape btn //////////
    /////////////////////////////////
    $("#scrape-button").click(() => {
        $(".articles").empty()
        $("#loadbar").removeClass("disappear")
        $.get("api/scrape").then(() => {
            location.reload()

        })
    })

    //////////////////////////////
    ////////// Save btn //////////
    //////////////////////////////
    $(".article-btn").click(function() {
        let id = $(this).attr("data-id")
        let selected = $(this).parent().parent()

        $.get(`/articles/update/${id}`, (data) => {
            if (data === "success") {
                selected.remove()
            }
        })
    })

    /////////////////////////////////
    ////////// Add-note btn /////////
    /////////////////////////////////
    $(".add-note").click(function() {
        let id = $(this).parent().attr("data-id")
        console.log("ADD-NOTE -- id: ",id);
        
        $(".modal-content").attr("data-modalid", id)

        $.get(`/note/get/${id}`, (data) => {
            // console.log(data);
            
            if (data.note) {
                console.log("data.note true");
                
                let noteid = data.note._id
                $(".note-submit").attr("data-noteid", noteid)
                $(".note-delete").show()
                $("#title").val(data.note.title)
                $("#body").val(data.note.body)
            } else {
                console.log("data.note false");
                $(".note-submit").attr("data-noteid", "false")
                $(".note-delete").hide()
                $("#title").val("")
                $("#body").val("")
            }
        })
    })

    ////////////////////////////////////////
    ////////// Remove article btn //////////
    ////////////////////////////////////////
    $(".remove-save").click(function() {
        let artid = $(this).parent().attr("data-id")
        let noteid = $(".note-submit").attr("data-noteid")
        let selected = $(this).parent().parent().parent().parent()
        console.log(`REMOVE-SAVE -- artid: ${artid}, noteid: ${noteid}`)
        

        $.get(`/articles/delete/${artid}`, (data) => {
            if (data === "success") {
                console.log("article remove success")
                
                if (noteid !== "false") {
                    $.get(`/note/delete/${noteid}`, (data) => {
                        console.log("note delete success")
                        console.log(data);
                        selected.remove()
                    })
                } else {
                    console.log("no notes")
                    selected.remove()
                }
            }
        })
    })

    ///////////////////////////////////
    ////////// Save note btn //////////
    ///////////////////////////////////
    $(".note-submit").click(function() {
        let notedata = {title: $("#title").val().trim(), body: $("#body").val().trim()}
        let artid = $(".modal-content").attr("data-modalid")
        let noteid = $(".note-submit").attr("data-noteid")
        console.log(`NOTE-SUBMIT -- artid: ${artid}, noteid: ${noteid}, selected`);

        if (noteid === "false") {
            console.log("new note");
            
            $.post(`/note/new/${artid}`, notedata ,function(data) {
                console.log(data);
                
                $(".note-delete").show()
            })
        } else {
            console.log("update note");
            
            $.post(`/note/update/${noteid}`, notedata ,(data) => {
                console.log(data);
            })
        }
        
    })

    /////////////////////////////////
    ////////// Delete Note //////////
    /////////////////////////////////
    $(".note-delete").click(function() {
        let noteid = $(".note-submit").attr("data-noteid")
        console.log(`NOTE-DELETE -- noteid: ${noteid}`);
        
        $.get(`/note/delete/${noteid}`, (data) => {
            console.log(data);
            
            $("#title").val("")
            $("#body").val("")
        })
        
    })
})