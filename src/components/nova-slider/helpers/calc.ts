// get css-calc
// @return - false | calc | -webkit-calc | -moz-calc
// @usage - var calc = getCalc();
import { getBody } from './getBody';
import { setFakeBody } from './setFakeBody';
import { resetFakeBody } from './resetFakeBody';

export function calc() {
  var doc = document,
      body = getBody(),
      docOverflow = setFakeBody(body),
      div = doc.createElement('div'),
      result : string | boolean = false;

  body.appendChild(div);
  try {
    var str = '(10px * 10)',
        vals = ['calc' + str, '-moz-calc' + str, '-webkit-calc' + str],
        val;
    for (var i = 0; i < 3; i++) {
      val = vals[i];
      div.style.width = val;
      if (div.offsetWidth === 100) {
        result = val.replace(str, '');
        break;
      }
    }
  } catch (e) {}

  body.fake ? resetFakeBody(body, docOverflow) : div.remove();

  return result;
}
