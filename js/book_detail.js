var userId = $("#input-id").data("userid");
var bookId = $("#input-id").data("bookid");

var options = {
    min:1,
    max:5,
    step:1,
    size:'sm',
    showClear: false,
    showCaption: true,
    clearCaption: '',
    starCaptions: {
        0.5: 'Half Star',
        1: '1 Sao',
        1.5: 'One & Half Star',
        2: '2 Sao',
        2.5: 'Two & Half Stars',
        3: '3 Sao',
        3.5: 'Three & Half Stars',
        4: '4 Sao',
        4.5: 'Four & Half Stars',
        5: '5 Sao'
    }
};
if (userId == 0) {
    options.disabled = true;
}
// with plugin options (do not attach the CSS class "rating" to your input if using this approach)
$("#input-id").rating(options);

$(document).ready(function() {
    // Rating book
    $('#input-id').on('rating.change', function(event, value, caption) {
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name = "csrf-token"]').attr('content')
            }
        });
        var data = {
            user_id: userId,
            book_id: bookId,
            value: value
        };
        $.ajax({
            url: './vote',
            method: 'POST',
            data: data,
            success: function (response) {
                console.log(response);
                //Update rate
                $('.score').text('Score:' + response.score);
            },
            error: function () {
            }
        });
        console.log(value);
        console.log(caption);
    });

    // Delete comment
    $(document).on('click', '.delete-comment', function () {
        if (!confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;
        var commentIdDelete = $(this).data("commentid");
        var self = $(this);
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name = "csrf-token"]').attr('content')
            }
        });
        var data = {
            comment_id: commentIdDelete
        };
        $.ajax({
            url: './deleteComment',
            method: 'POST',
            data: data,
            success: function (response) {
                console.log(response);
                //Delete view
                $(self).closest('.comment-item').remove(); //Find parent view
            },
            error: function () {
            }
        });
    });

    // Delete review
    $(document).on('click', '.delete-review',function () {
        if (!confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;
        var reviewIdDelete = $(this).data('reviewid');
        var self = $(this);
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name = "csrf-token"]').attr('content')
            }
        });
        var data = {
          review_id: reviewIdDelete
        };
        $.ajax({
            url : './deleteReview',
            method: 'POST',
            data: data,
            success: function (response) {
                console.log(response);
                //Delete view
                $(self).closest('.review-item').remove();
            },
            error: function () {
            }
        });

    });

    // Write comment
    $(document).on('click', '.btn-comment', function() {
        var review_id = $(this).closest('.comments-list').data('reviewid');
        var book_id = $(this).closest('.comment-content').find('input[name="book-id-comment"]').val();
        var content = $(this).closest('.comment-content').find('textarea[name="comment"]').val();
        var self = $(this);
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name = "csrf-token"]').attr('content')
            }
        });
        var data = {
            review_id: review_id,
            book_id: book_id,
            review_content: content
        };
        $.ajax({
            url: './comment',
            method: 'POST',
            data: data,
            success: function (response) {
                //insert view to list comment
                var user = response.user;
                var comment = response.comment;
                var $html = $($('.comment-template').html());
                $html.find('.comment-avatar img').prop('src', user.image);
                $html.find('.comment-created-at').html(comment.created_at);
                $html.find('.comment-name a').html(user.name);
                $html.find('.edit-comment').attr('data-commentid', comment.id);
                $html.find('.delete-comment').attr('data-commentid', comment.id);
                $html.find('.comment-content').html(comment.content);

                $(self).closest('.comment-form').before($html);
                //Reset input form
                $(self).closest('.comment-content').find('textarea[name="comment"]').val("");
            },
            error: function () {

            }
        });
    });

    // Write review
    $('.btn-review').on('click', function() {
        var book_id = $(this).closest('.comment-content').find('input[name="book-id"]').val();
        var content = $(this).closest('.comment-content').find('textarea[name="review"]').val();
        var self = $(this);
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name = "csrf-token"]').attr('content')
            }
        });
        var data = {
            book_id: book_id,
            review_content: content
        };
        $.ajax({
            url: './review',
            method: 'POST',
            data: data,
            success: function (response) {
                //insert view to list comment
                var user = response.user;
                var review = response.review;
                var $html = $($('.review-template').html());
                $html.find('.comment-avatar img').prop('src', user.image);
                $html.find('.comment-created-at').html(review.created_at);
                $html.find('.comment-name a').html(user.name);
                $html.find('.reply-review').attr('data-reviewid', review.id);
                $html.find('.edit-review').attr('data-reviewid', review.id);
                $html.find('.delete-review').attr('data-reviewid', review.id);
                $html.find('.review-content').html(review.content);
                $html.find('input[name="book_id"]').val(book_id);
                $html.find('.reply-list').attr('id',"comment-" + review.id);
                $html.find('.comments-list').attr('data-reviewid', review.id);
                $html.find('.comment-ava img').prop('src', user.image);
                $html.find('.comment-comment-name a').html(user.name);
                $html.find('input[name="status"]').val(review.id);
                $html.find('input[name="book-id-comment"]').val(book_id);

                $(self).closest('.review-form').before($html);
                //Reset input form
                $(self).closest('.comment-content').find('textarea[name="review"]').val('');
            },
            error: function () {

            }
        });
    });

    // Edit review UI
    $(document).on('click', '.edit-review', function() {
        var $comment_box = $(this).closest('.comment-box');
        var review_text = $comment_box.find('.review-content').text();
        $comment_box.find('textarea[name="review"]').val(review_text);
        $comment_box.find('.review-content').hide();
        $comment_box.find('.edit-review-content').show();
    });

    $(document).on('click', '.btn-edit-review', function() {
        var review_id = $(this).closest('.comment-box').find('.edit-review').data('reviewid');
        var review_content = $(this).closest('.edit-review-content').find('textarea[name="review"]').val();
        var self = $(this);
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name = "csrf-token"]').attr('content')
            }
        });
        var data = {
            review_id: review_id,
            review_content: review_content
        };

        $.ajax({
            url: './editReview',
            method: 'POST',
            data: data,
            success: function (response) {
                var $comment_box = $(self).closest('.comment-box');
                $comment_box.find('.review-content').text(review_content);
                $comment_box.find('.edit-review-content').hide();
                $comment_box.find('.review-content').show();
            },
            error: function () {
            }
        });
    });

    //Edit comment
    $(document).on('click', '.edit-comment', function() {
        var $comment_box = $(this).closest('.comment-box');
        var review_text = $comment_box.find('.com-content').text();
        $comment_box.find('textarea[name="comment"]').val(review_text);
        $comment_box.find('.com-content').hide();
        $comment_box.find('.edit-comment-content').show();
    });

    $(document).on('click', '.btn-edit-comment', function() {
        var comment_id = $(this).closest('.comment-box').find('.edit-comment').data('commentid');
        var comment_content = $(this).closest('.edit-comment-content').find('textarea[name="comment"]').val();
        var self = $(this);
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name = "csrf-token"]').attr('content')
            }
        });
        var data = {
            comment_id: comment_id,
            comment_content: comment_content
        };

        $.ajax({
            url: './editComment',
            method: 'POST',
            data: data,
            success: function (response) {
                var $comment_box = $(self).closest('.comment-box');
                $comment_box.find('.com-content').text(comment_content);
                $comment_box.find('.edit-comment-content').hide();
                $comment_box.find('.com-content').show();
            },
            error: function () {
            }
        });
    });

    //
    $(document).on('click','.reply-review', function ($response) {
        console.log($(this).data('reviewid'));
        var id = $(this).data('reviewid');
        $("#comment-" + id).toggleClass('hidden');
    });

});