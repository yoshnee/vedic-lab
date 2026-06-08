/* ============================================================
   celestial.js — shared SVG art for the Vedic Astrology Lab,
   AUGMENTED for the Planet Detail Panel: body() now accepts a
   dignity `state` (neutral|exalted|debilitated|own) AND a retro
   flag, so the icon alone carries dignity + retrograde. Diamond
   and glyph marks are unchanged from the app's engine.
   Exposes: window.Celestial = { body, diamond, glyph, colors }
   ============================================================ */
(function () {
  var COLORS = {
    sun: '#F2C230', moon: '#C2D2E0', mars: '#E2503C', mercury: '#36B97A',
    jupiter: '#B26A24', venus: '#B97FD6', saturn: '#3E78E0',
    rahu: '#969CB0', ketu: '#AC9B79'
  };

  var _u = 0;

  function sphereDefs(u) {
    return '<radialGradient id="sh' + u + '" cx="35%" cy="30%" r="78%">'
      + '<stop offset="0%" stop-color="#fff" stop-opacity="0.52"/>'
      + '<stop offset="42%" stop-color="#fff" stop-opacity="0"/>'
      + '<stop offset="100%" stop-color="#000" stop-opacity="0.46"/>'
      + '</radialGradient>'
      + '<clipPath id="cp' + u + '"><circle cx="24" cy="24" r="16"/></clipPath>';
  }
  function craters(list) {
    return list.map(function (p) {
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="#000" fill-opacity="0.14"/>'
        + '<circle cx="' + (p[0] - p[2] * 0.32) + '" cy="' + (p[1] - p[2] * 0.32) + '" r="' + (p[2] * 0.62) + '" fill="#fff" fill-opacity="0.07"/>';
    }).join('');
  }
  function band(y, h, col, op) {
    return '<rect x="6" y="' + (y - h / 2) + '" width="36" height="' + h + '" fill="' + col + '" fill-opacity="' + op + '"/>';
  }
  function features(key) {
    if (key === 'moon') return craters([[18, 18, 3.2], [30, 28, 2.4], [22, 32, 2], [31, 16, 1.5]]);
    if (key === 'mercury') return craters([[19, 19, 3.4], [31, 30, 2.6], [28, 18, 1.8], [18, 30, 2]]);
    if (key === 'mars') return craters([[20, 28, 2.1], [30, 21, 1.7]])
      + '<ellipse cx="24" cy="11" rx="6" ry="2.5" fill="#fff" fill-opacity="0.5"/>'
      + '<ellipse cx="24" cy="37" rx="4" ry="1.8" fill="#fff" fill-opacity="0.34"/>'
      + '<ellipse cx="27" cy="26" rx="7" ry="3" fill="#000" fill-opacity="0.12" transform="rotate(20 27 26)"/>';
    if (key === 'jupiter') return band(13, 3, '#000', 0.14) + band(18, 2, '#fff', 0.16) + band(24, 3.4, '#000', 0.12)
      + band(30, 2.4, '#fff', 0.14) + band(35, 3, '#000', 0.13)
      + '<ellipse cx="18" cy="30" rx="3.6" ry="2.3" fill="#6e2716" fill-opacity="0.6"/>';
    if (key === 'venus') return '<ellipse cx="20" cy="18" rx="12" ry="3.2" fill="#fff" fill-opacity="0.17" transform="rotate(-18 20 18)"/>'
      + '<ellipse cx="27" cy="28" rx="11" ry="3" fill="#fff" fill-opacity="0.12" transform="rotate(-18 27 28)"/>'
      + '<ellipse cx="22" cy="33" rx="8" ry="2.4" fill="#000" fill-opacity="0.10" transform="rotate(-18 22 33)"/>';
    return '';
  }
  function bodyInner(key, u) {
    var c = COLORS[key];
    if (key === 'sun') {
      return '<defs>'
        + '<radialGradient id="sg' + u + '" cx="50%" cy="50%" r="50%">'
        + '<stop offset="0%" stop-color="#FFF7DE"/><stop offset="40%" stop-color="' + c + '"/><stop offset="100%" stop-color="#D5851E"/>'
        + '</radialGradient>'
        + '<radialGradient id="gl' + u + '" cx="50%" cy="50%" r="50%">'
        + '<stop offset="52%" stop-color="' + c + '" stop-opacity="0"/><stop offset="70%" stop-color="' + c + '" stop-opacity="0.34"/><stop offset="100%" stop-color="' + c + '" stop-opacity="0"/>'
        + '</radialGradient></defs>'
        + '<circle cx="24" cy="24" r="23.5" fill="url(#gl' + u + ')"/>'
        + '<circle cx="24" cy="24" r="14.5" fill="url(#sg' + u + ')"/>'
        + '<circle cx="24" cy="24" r="14.5" fill="none" stroke="#FFEFC2" stroke-opacity="0.35" stroke-width="0.8"/>';
    } else if (key === 'saturn') {
      var rs = 12.5;
      return '<defs><radialGradient id="sh' + u + '" cx="35%" cy="30%" r="78%">'
        + '<stop offset="0%" stop-color="#fff" stop-opacity="0.5"/><stop offset="42%" stop-color="#fff" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.46"/>'
        + '</radialGradient></defs>'
        + '<g transform="rotate(-20 24 24)"><ellipse cx="24" cy="24" rx="21" ry="6.3" fill="none" stroke="#9DC0F2" stroke-width="2.3" stroke-opacity="0.8"/></g>'
        + '<circle cx="24" cy="24" r="' + rs + '" fill="' + c + '"/>'
        + '<circle cx="24" cy="24" r="' + rs + '" fill="url(#sh' + u + ')"/>'
        + '<g transform="rotate(-20 24 24)"><path d="M3 24 A21 6.3 0 0 0 45 24" fill="none" stroke="#BDD6FA" stroke-width="2.3" stroke-opacity="0.95"/></g>';
    } else if (key === 'rahu') {
      return '<defs>'
        + '<radialGradient id="rg' + u + '" cx="50%" cy="50%" r="50%"><stop offset="58%" stop-color="#14151C"/><stop offset="100%" stop-color="#2B2D38"/></radialGradient>'
        + '<filter id="rb' + u + '" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.7"/></filter></defs>'
        + '<circle cx="24" cy="24" r="16" fill="none" stroke="' + c + '" stroke-width="3.2" stroke-opacity="0.8" filter="url(#rb' + u + ')"/>'
        + '<circle cx="24" cy="24" r="13.4" fill="url(#rg' + u + ')"/>'
        + '<circle cx="24" cy="24" r="14.1" fill="none" stroke="' + c + '" stroke-width="1.5"/>'
        + '<circle cx="18.5" cy="18" r="1.5" fill="#fff" fill-opacity="0.7"/>';
    } else if (key === 'ketu') {
      return '<defs>'
        + '<linearGradient id="kt' + u + '" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + c + '" stop-opacity="0.6"/><stop offset="100%" stop-color="' + c + '" stop-opacity="0"/></linearGradient>'
        + '<radialGradient id="sh' + u + '" cx="34%" cy="30%" r="80%"><stop offset="0%" stop-color="#fff" stop-opacity="0.5"/><stop offset="42%" stop-color="#fff" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.44"/></radialGradient></defs>'
        + '<path d="M9 40 Q20 29 31 18 L35 22 Q24 33 13 44 Z" fill="url(#kt' + u + ')"/>'
        + '<circle cx="31" cy="17" r="9.5" fill="' + c + '"/>'
        + '<circle cx="31" cy="17" r="9.5" fill="url(#sh' + u + ')"/>';
    }
    // generic sphere
    return '<defs>' + sphereDefs(u) + '</defs>'
      + '<circle cx="24" cy="24" r="16" fill="' + c + '"/>'
      + '<g clip-path="url(#cp' + u + ')">' + features(key) + '</g>'
      + '<circle cx="24" cy="24" r="16" fill="url(#sh' + u + ')"/>';
  }

  /* Planet body SVG with dignity state + optional retrograde "R".
     key:'sun', size:px, state:'neutral'|'exalted'|'debilitated'|'own', retro:bool
     Nodes (rahu/ketu) ignore dignity — nodal dignity is debated. */
  function body(key, size, state, retro) {
    _u++; var u = _u; var c = COLORS[key];
    state = state || 'neutral';
    if (key === 'rahu' || key === 'ketu') state = 'neutral';
    var out;
    if (state === 'debilitated') {
      out = '<defs><filter id="deb' + u + '" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0.38"/><feComponentTransfer><feFuncR type="linear" slope="0.8"/><feFuncG type="linear" slope="0.8"/><feFuncB type="linear" slope="0.8"/></feComponentTransfer></filter></defs>'
        + '<g filter="url(#deb' + u + ')" opacity="0.82">' + bodyInner(key, u) + '</g>'
        + '<circle cx="24" cy="24" r="15.6" fill="#2A2F38" fill-opacity="0.16"/>'
        + '<circle cx="24" cy="24" r="20" fill="none" stroke="#9097A3" stroke-width="1.2" stroke-opacity="0.5" stroke-dasharray="2 4.5"/>';
    } else if (state === 'exalted') {
      out = '<defs><radialGradient id="exg' + u + '" cx="50%" cy="50%" r="50%"><stop offset="40%" stop-color="#FFE6A0" stop-opacity="0"/><stop offset="74%" stop-color="#FFD66B" stop-opacity="0.5"/><stop offset="100%" stop-color="#FFD66B" stop-opacity="0"/></radialGradient><filter id="exb' + u + '" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.3"/></filter></defs>'
        + '<circle cx="24" cy="24" r="23.5" fill="url(#exg' + u + ')"/>'
        + bodyInner(key, u)
        + '<circle cx="20" cy="19" r="8" fill="#fff" fill-opacity="0.12"/>'
        + '<circle cx="24" cy="24" r="20.5" fill="none" stroke="#FFE8AE" stroke-width="1.5" stroke-opacity="0.9" filter="url(#exb' + u + ')"/>'
        + '<path d="M24 1.8 L25.1 5.3 L28.6 6.4 L25.1 7.5 L24 11 L22.9 7.5 L19.4 6.4 L22.9 5.3 Z" fill="#FFF0C6"/>';
    } else if (state === 'own') {
      out = bodyInner(key, u)
        + '<circle cx="24" cy="24" r="20.5" fill="none" stroke="' + c + '" stroke-width="1.6" stroke-opacity="0.92"/>'
        + '<circle cx="24" cy="24" r="18" fill="none" stroke="' + c + '" stroke-width="1" stroke-opacity="0.32"/>'
        + '<g stroke="' + c + '" stroke-width="1.7" stroke-opacity="0.92" stroke-linecap="round"><line x1="24" y1="1.6" x2="24" y2="4.3"/><line x1="24" y1="43.7" x2="24" y2="46.4"/><line x1="1.6" y1="24" x2="4.3" y2="24"/><line x1="43.7" y1="24" x2="46.4" y2="24"/></g>';
    } else {
      out = bodyInner(key, u);
    }
    if (retro) out += '<g><circle cx="39.5" cy="9" r="7.6" fill="#0E1B12" fill-opacity="0.5"/><text x="39.5" y="9" dy="0.34em" text-anchor="middle" font-family="Space Mono, monospace" font-weight="700" font-size="11.5" fill="#E7C977">R</text></g>';
    return '<svg viewBox="0 0 48 48" width="' + size + '" height="' + size + '" style="display:block">' + out + '</svg>';
  }

  /* North Indian chart-diamond mark with a glowing point of light. */
  function diamond(size, opt) {
    opt = opt || {};
    var stroke = opt.stroke || '#E4C257';
    var glow = opt.glow !== false;
    _u++; var u = _u;
    var s = '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" style="display:block">';
    if (glow) {
      s += '<defs>'
        + '<radialGradient id="jlg' + u + '" cx="50%" cy="50%" r="50%">'
        + '<stop offset="0%" stop-color="#FFF6D8"/><stop offset="42%" stop-color="#F3C85A"/><stop offset="100%" stop-color="#F3C85A" stop-opacity="0"/>'
        + '</radialGradient>'
        + '<filter id="jlb' + u + '" x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="3.4"/></filter>'
        + '</defs>';
    }
    s += '<g fill="none" stroke="' + stroke + '" stroke-linejoin="round" stroke-linecap="round">'
      + '<rect x="9" y="9" width="82" height="82" rx="7" stroke-width="4.4"/>'
      + '<path d="M9 9 L91 91 M91 9 L9 91" stroke-width="2.3" stroke-opacity="0.78"/>'
      + '<path d="M50 9 L91 50 L50 91 L9 50 Z" stroke-width="3.5"/>'
      + '</g>';
    if (glow) {
      s += '<circle cx="50" cy="50" r="23" fill="url(#jlg' + u + ')" filter="url(#jlb' + u + ')"/>'
        + '<path d="M50 38 L52.6 47.4 L62 50 L52.6 52.6 L50 62 L47.4 52.6 L38 50 L47.4 47.4 Z" fill="#FFF3CE"/>'
        + '<circle cx="50" cy="50" r="3.4" fill="#FFFBEF"/>';
    } else {
      s += '<circle cx="50" cy="50" r="5" fill="' + stroke + '"/>';
    }
    return s + '</svg>';
  }

  /* Diamond medallion enclosing a short label (used for Houses). */
  function glyph(label, color, size) {
    color = color || '#E4C257';
    var fs = String(label).length > 2 ? 15 : 19;
    return '<svg viewBox="0 0 48 48" width="' + size + '" height="' + size + '" style="display:block">'
      + '<rect x="9" y="9" width="30" height="30" rx="5" transform="rotate(45 24 24)" fill="none" stroke="' + color + '" stroke-width="2" stroke-opacity="0.85"/>'
      + '<rect x="14" y="14" width="20" height="20" rx="3" transform="rotate(45 24 24)" fill="' + color + '" fill-opacity="0.12"/>'
      + '<text x="24" y="24" dy="0.36em" text-anchor="middle" font-family="Space Grotesk, system-ui, sans-serif" font-weight="600" font-size="' + fs + '" fill="' + color + '">' + label + '</text>'
      + '</svg>';
  }

  window.Celestial = { body: body, diamond: diamond, glyph: glyph, colors: COLORS };
})();
