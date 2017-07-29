module.exports = function(bp) {
  bp.middlewares.load();

  //Catch 'hello world' from 'facebook'
  bp.hear({
    platform: 'slack',
    type: 'message',
    text: 'hello world'
  }, (event, next) => {
    console.log("HERE RECEUVED");
    console.log(event.text);
  })
}
