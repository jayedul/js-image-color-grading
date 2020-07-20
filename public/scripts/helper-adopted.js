'use strict';

/* --------------Adopted Helpers-------------- */
const rgbToHsl = (r, g, b)=>
{

    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
  
    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
  
    return [h, s, l];
}

function convertToDueTone(imageData, pixelCount, color1, color2) {
    var pixels = imageData.data;
    var pixelArray = [];
    var gradientArray = [];
  
    // Creates a gradient of 255 colors between color1 and color2
    for (var d = 0; d < 255; d += 1) {
      var ratio = d / 255;
      var l = ratio;
      var rA = Math.floor(color1[0] * l + color2[0] * (1 - l));
      var gA = Math.floor(color1[1] * l + color2[1] * (1 - l));
      var bA = Math.floor(color1[2] * l + color2[2] * (1 - l));
      gradientArray.push([rA, gA, bA]);
    }
  
    for (var i = 0, offset, r, g, b, a, srcHSL, convertedHSL; i < pixelCount; i++) {
      offset = i * 4;
      // Gets every color and the alpha channel (r, g, b, a)
      r = pixels[offset + 0];
      g = pixels[offset + 1];
      b = pixels[offset + 2];
      a = pixels[offset + 3];
  
      // Gets the avg
      var avg = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
      // Gets the hue, saturation and luminosity
      var hsl = rgbToHsl(avg, avg, avg);
      // The luminosity from 0 to 255
      var luminosity = Math.max(0, Math.min(254, Math.floor((hsl[2] * 254))));
  
      // Swap every color with the equivalent from the gradient array
      r = gradientArray[luminosity][0];
      g = gradientArray[luminosity][1];
      b = gradientArray[luminosity][2];
  
      pixelArray.push(r);
      pixelArray.push(g);
      pixelArray.push(b);
      pixelArray.push(a);
  
    }
  
    return pixelArray;
  };
  