
  function draggableCard( element, cardData ){

    var card = this;

    card.element = element;
    card.data = cardData

    card.dragging = false;

    card.mdX = 0;
    card.mdY = 0;

    card.lastXOffset = 0
    card.lastYOffset = 0
    card.lastRotate = 0

    card.likeSelected = false;
    card.dislikeSelected = false;

    card.settings = {
      enable_blur: false
    }


    card.setupCard = function(){
      $(card.element).find('#swipe-card-top-html').html( card.data['swipe-card-top-html'] )
      $(card.element).find('#swipe-card-body-html').html( card.data['swipe-card-body-html'] )
      $(card.element).find('#swipe-card-desc-html').html( card.data['swipe-card-desc-html'] )
      $(card.element).find('#swipe-card-footer-html').html( card.data['swipe-card-footer-html'] )

      $('#tweet-preview-text').text( card.data['tweet-html'] )
      $('#tweet-response-text').text( card.data['reply-html-negative'] )
      /* TODO: check whether the card has a settings property */
    }

    var redColor = '#f77e76'
    var invisColor = '#f77e7600'
    var greenColor = '#79db98'

    var lightRedColor = 'rgb(205, 92, 92)'
    var deepGreenColor = 'rgb(44, 154, 79)'

    card.jgradient = new JGradient( [ redColor, redColor, invisColor, greenColor, greenColor ] );
    card.jgradient2 = new JGradient( [ lightRedColor, invisColor, deepGreenColor ] );

    card.setTransform = function(xOffset, yOffset, rotate){

      card.lastXOffset = xOffset
      card.lastYOffset = yOffset
      card.lastRotate = rotate

      $( card.bg_element ).css('transform', 'rotate(' + ( rotate / 8 ) + 'deg)')
      $( card.element ).css('transform', 'translate(' + xOffset + 'px, ' + yOffset + 'px) rotate(' + rotate + 'deg)')

    }

    card.onMouseMove = function(e){
      if(card.dragging){

        var deltaX = e.pageX - card.mdX
        var deltaY = e.pageY - card.mdY

        var screenUnit = screen.width / 8

        var xMulti = deltaX * 0.03;
        var yMulti = ( deltaY - screenUnit ) / 80;
        var rotate = xMulti * yMulti;

        var xTrans = xMulti * 50
        var yTrans = yMulti * 80

        if( rotate > 45 ){ rotate = 45 }
        if( rotate < -45 ){ rotate = -45 }

        var sat = ( ( deltaX / 450 ) + 1 ) / 2
        sat = sat < 0 ? 0 : (sat > 1 ? 1 : sat)

        var rgb = card.jgradient.get(sat)

        var op;

        if(sat >= 0.5){
          op = sat - 0.5
        } else {
          op = 0.5 - sat
        }

        var cols_max_opacity = 0.3

        op_sin = op * 10
        op_sin = cols_max_opacity * op_sin

        card.setStripeColor(rgb[0], rgb[1], rgb[2], op_sin)

        card.updateBoxOpacity()

        card.currSelected = (rgb[0] > rgb[1]) ? 'opt1' : 'opt2'

        //rgb = card.jgradient2.get(sat)

        card.setBoxColor(rgb[0], rgb[1], rgb[2], op_sin)

        var box_op = op_sin * 2.5
        box_op = box_op > 255 ? 255 : box_op
        card.updateBoxOpacity( box_op )

        card.setTransform(xTrans, yTrans, rotate)


        if(card.currSelected == 'opt1'){
          $('#tweet-response-text').html( card.data['reply-html-negative'] )
        }
        if(card.currSelected == 'opt2'){
          $('#tweet-response-text').html( card.data['reply-html-positive'] )
        }
      } else {

        var rgb = card.jgradient.get(0.5)

        card.setBoxColor(rgb[0], rgb[1], rgb[2], 0)
        card.setStripeColor(rgb[0], rgb[1], rgb[2], 0)
        card.updateBoxOpacity(0)

        $('#opt-like').removeClass('option-border')
        $('#opt-dislike').removeClass('option-border')
      }
    }

    $(document).mousemove(function(e){
      card.onMouseMove(e)
    });

    // animate top bar

    $(document).on('mousemove', function(e, i){
      var mm_e = e.originalEvent
      var mouse_x = mm_e.clientX
      var mouse_y = mm_e.clientY
      var doc_width = $(document).width()
      var doc_height = $(document).height()
      var top_dec = mouse_y / doc_height
      if(top_dec < 0.15){
        if(!card.dragging){
          console.log('show')
        } else {
          console.log('hide')
        }
      } else {
        console.log('hide')
      }
    })

    $( card.element ).on("mousedown", function(e) {
      card.dragging = true;
      card.mdX = e.pageX
      card.mdY = e.pageY
      $( card.element ).removeClass('swipe-card-origin')
      $( card.element ).css('pointer-events', 'none')
      $( card.bg_element ).fadeIn('fast') //.css('opacity', 1)
      card.onMouseMove(e)
    })

    $( document ).on("mouseup", function(e){
      if(!(card.likeSelected || card.dislikeSelected)){
          card.dragging = false;
          $( card.element ).addClass('swipe-card-origin')
          card.onDislikeLeave()
          card.onLikeLeave()
          $( card.element ).css('pointer-events', 'all')
          $( '#opt-like-container' ).removeClass('option-active')
          $( '#opt-dislike-container' ).removeClass('option-active')
          $( card.bg_element ).fadeOut('fast')
        }
        card.onMouseMove(e)
    });

    card.onDislikeEnter = function(){
      if( card.dragging ){

        card.dislikeSelected = true;

        $( '#opt-dislike-container' ).addClass( 'option-active' )
        $( '#card-timer' ).fadeIn( 'fast' )
        $( '#card-timer' ).addClass('timer-dislike' )
        $( '#card-timer' ).removeClass( 'timer-like' )

        $( card.bg_element ).addClass( 'swipe-slide-rotated-left' )
      }
    }

    card.onDislikeLeave = function(){

      /* take card back to origin */
      if( card.settings.enable_blur ){
        card.dragging = false
        $( card.element ).addClass( 'swipe-card-origin' )
        $( card.element ).css( 'pointer-events', 'all' )
      }
      /* end take card back to origin */
      $( '#opt-dislike-container' ).removeClass( 'option-active' )
      card.dislikeSelected = false;
      card.currentTimer = 0;
      $( '#card-timer' ).fadeOut( 'fast' )
    }

    card.onLikeEnter = function(){

      if( card.dragging ){
        card.likeSelected = true;
        $( '#opt-like-container' ).addClass( 'option-active' )
        $( '#card-timer' ).fadeIn( 'fast' )
        $( '#card-timer' ).addClass( 'timer-like' )
        $( '#card-timer' ).removeClass( 'timer-dislike' )
      }

    }

    card.onLikeLeave = function(){

      /* take card back to origin */
      if( card.settings.enable_blur ){
        card.dragging = false
        $( card.element ).addClass( 'swipe-card-origin' )
        $( card.element ).css( 'pointer-events', 'all' )
      }
      /* end take card back to origin */
      $( '#opt-like-container' ).removeClass( 'option-active' )
      card.likeSelected = false;
      $( '#card-timer' ).fadeOut( 'fast' )
    }

    card.setStripeColor = function( r, g, b, a ){
      $( '#swipe-card-bg' ).css( 'background', 'repeating-linear-gradient( 45deg, transparent, transparent 20px, rgb(' + r + ', ' + g + ', ' + b + ', ' + a + ') 20px, rgb(' + r + ', ' + g + ', ' + b + ', ' + a + ') 40px )')
    }

    card.setBoxColor = function( r, g, b, a ){
      $( '#display-messages' ).find( '.anim-message-inner-right' ).css( 'background', 'rgba(' + r + ', ' + ( g ) + ', ' + b + ', ' + ( a * 0.5 + 0.5 ) + ')' )
    }

    card.updateBoxOpacity = function( value ){
      $( '#message-container' ).css( 'opacity', value )
    }

    $( '#opt-dislike' ).on( 'mouseenter', function(){ card.onDislikeEnter() })
    $( '#opt-dislike-container' ).on( 'mouseenter', function(){ card.onDislikeEnter() })
    $( '#opt-dislike-container' ).on( 'mouseleave', function(){ card.onDislikeLeave()})

    $( '#opt-like' ).on( 'mouseenter', function(){ card.onLikeEnter() })
    $( '#opt-like-container' ).on( 'mouseenter', function(){ card.onLikeEnter() })
    $( '#opt-like-container' ).on( 'mouseleave', function(){ card.onLikeLeave()})

    card.setupCard()
  }

  document.addEventListener("DOMContentLoaded", function(event) {
    var cardData = {
      'swipe-card-top-html': "<div class='swipe-card-header-title'>Facebook inc</div> <div class='swipe-card-header-desc'>Social Networking</div>",
      'swipe-card-body-html': "<div class='swipe-card-metic'>201<span class='swipe-card-metric-description'>Employees</span></div> <div class='swipe-card-metic'>2010<span class='swipe-card-metric-description'> Founded</span></div>",
      'swipe-card-desc-html': "<p class='legend'>TWEET</p> <i class='fas fa-quote-left' style='margin: 10px;color: white;'></i> <span class='twitter-quote'>$250 is your home $FB , go to your home. my OTM calls need you to deliver</span>",
      'swipe-card-footer-html' : "<p class='legend'>QUESTION</p> <i class='far fa-star' style='margin: 10px;color: white;'></i> <span class='twitter-quote'>Is this tweet positive or negative?</span>",
      'tweet-html' : "$250 is your home $FB , go to your home. my OTM calls need you to deliver",
      'reply-html-positive': '<span style="min-width: 150px;text-align:left;margin-right:10px">This tweet is positive!</span>😁',
      'reply-html-negative': '<span style="min-width: 150px;text-align:left;margin-right:10px">This tweet is negative!</span>😢'
    }
    document.

    window.card = new draggableCard($('#swipe-card'), cardData)
  });
