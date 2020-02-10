module.exports = {
  docs: function(req,res,next){
    // Get only the origin host name not the port number (localhost:8000)
    let urlSplit = req.headers.host.split(':');
    let isEnabled = true;

    // Redirect to Swagger Server
    if(isEnabled){
      res.redirect('http://' + urlSplit[0] + ':3002?url=/swagger/panda-api-docs.yaml');
    } else {
      res.send('<h4>Sorry, documentation server was disabled.</h4>');
    }
  }
};
