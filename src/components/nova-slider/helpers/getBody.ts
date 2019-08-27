export function getBody () {
  var doc = document,
      body : any = doc.body;

  if (!body) {
    body = doc.createElement('body');
    body.fake = true;
  }

  return body;
}
