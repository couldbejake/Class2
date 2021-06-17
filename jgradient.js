function JGradient( colours ){

  var grad = this;

  grad.ctx = null;

  grad.colours = colours

  grad.width = 500;
  grad.height = 500;

  grad.transitionMode = 'linear'

  grad.util_easeInOutExpo = function(x){
    /* https://easings.net/#easeInOutExpo */
    return x === 0
      ? 0
      : x === 1
      ? 1
      : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
      : (2 - Math.pow(2, -20 * x + 10)) / 2;
  }

  grad.util_linear = function(x){
    return x;
  }

  grad.init = function(colours){
    var canv = document.createElement('canvas');
    document.body.appendChild(canv)
    canv.width = grad.width
    canv.height = grad.height
    canv.style.display = 'none'
    grad.ctx = canv.getContext("2d");
    grad.colours = colours
    grad.updateGradient()
  }

  /* GPU ACCELLERATED GRADIENT SAMPLING */
  grad.updateGradient = function(){
      var grd = grad.ctx.createLinearGradient(0, 0, grad.width, 0);
      var step = 1 / grad.colours.length
      for (var i = 0; i < grad.colours.length; i++) {
        place = (i * step)
        grd.addColorStop( place, grad.colours[i] );
      }

      grad.ctx.fillStyle = grd;
      grad.ctx.fillRect(0, 0, grad.width, grad.height);
  }
  grad.get = function( decimal ){
    switch (grad.transitionMode) {
      case 'easeInOutExpo':
        decimal = grad.util_easeInOutExpo(decimal)
        break;
      case 'linear':
      default:
        break;
    }
    decimal = (decimal - 0.000000001) < 0 ? 0 : (decimal - 0.000000001)
    decimal = decimal > 1 ? 1 : decimal
    var width = decimal * grad.width
    var p = grad.ctx.getImageData(width, 0, 1, 1).data;
    var rgb =  [p[0], p[1], p[2]]
    return rgb;
  }
  grad.init( colours )
}
