export function getSlideId() {
  var win : any = window;
  var id = win.tnsId;
  win.tnsId = !id ? 1 : id + 1;

  return 'tns' + win.tnsId;
}
