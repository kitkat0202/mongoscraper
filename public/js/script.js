$(function(){
    /////////////////////////////////
    /////////// Scrape btn //////////
    /////////////////////////////////
    $("#scrape-button").click(() => {
        $.get("api/scrape").then((data) => {
            if (data === "success") {
                $(".articles").empty();
                $.get("/", (data) => {
                    location.reload()
                })
            }
        })
    })

    //////////////////////////////
    ////////// Save btn //////////
    //////////////////////////////
    $(".article-btn").click(function() {
        let id = $(this).data("id")
        let selected = $(this).parent().parent().parent()

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
        let id = $(this).parent().data("id")
        $(".modal-content").attr("data-modalid", id)

        $.get(`/note/get/${id}`, (data) => {
            // console.log(data);
            
            if (data.note) {
                let noteid = data.note._id
                $(".note-submit").attr("data-noteid", noteid)
                $("#title").val(data.note.title)
                $("#body").val(data.note.body)
            } else {
                $(".note-submit").attr("data-noteid", "false")
                $("#title").val("")
                $("#body").val("")
            }
        })
    })

    /////////////////////////////////////
    ////////// Remove save btn //////////
    /////////////////////////////////////
    $(".remove-save").click(function() {
        let id = $(this).parent().data("id")
        let noteid = $(".note-submit").attr("data-noteid")
        let selected = $(this).parent().parent().parent().parent()

        $.get(`/articles/delete/${id}`, (data) => {
            if (data === "success") {
                selected.remove()
                if (noteid !== "false") {
                    $.get(`/note/delete/${noteid}`, (data) => {
                        console.log(data);
                    })
                }
            }
        })
    })

    ///////////////////////////////////
    ////////// Save note btn //////////
    ///////////////////////////////////
    $(".note-submit").click(function() {
        let notedata = {title: $("#title").val().trim(), body: $("#body").val().trim()}
        let artid = $(".modal-content").data("modalid")
        let noteid = $(".note-submit").attr("data-noteid")

        if (noteid === "false") {
            $.post(`/note/new/${artid}`, notedata ,function(data) {
                console.log(data)
            })
        } else {
            $.post(`/note/update/${noteid}`, notedata ,(data) => {
                console.log(data)
            })
        }
        
    })
})